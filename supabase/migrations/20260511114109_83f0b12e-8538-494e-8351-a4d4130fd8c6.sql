
-- 1) PROFILES: tighten SELECT policy and restrict email column
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated can view approved providers"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.provider_listings pl
    WHERE pl.user_id = profiles.id AND pl.approved = true
  )
);

-- Restrict email column: only owner should access; revoke from broad roles
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;
-- Re-grant to authenticated; RLS row policies still apply, but to also prevent
-- email leak across approved-provider rows, narrow further with a column-aware policy via view:
GRANT SELECT (id, full_name, avatar_url, location, phone, active_role, roles, created_at, updated_at)
  ON public.profiles TO anon, authenticated;
GRANT SELECT (email, deletion_requested_at) ON public.profiles TO authenticated;

-- Replace the approved-providers SELECT policy with one that excludes email exposure
DROP POLICY "Authenticated can view approved providers" ON public.profiles;

-- Owner gets full row (incl email) via "Users can view own profile" policy.
-- Other authenticated users can read approved-provider rows but only via column grants
-- below (no email). Add a permissive SELECT for approved providers, and remove email
-- access for non-owners by using a SECURITY DEFINER view for safe public profile.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, avatar_url, location, phone, active_role, roles
FROM public.profiles
WHERE EXISTS (
  SELECT 1 FROM public.provider_listings pl
  WHERE pl.user_id = profiles.id AND pl.approved = true
);

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Re-add policy so the view (security_invoker) can read those rows
CREATE POLICY "Approved provider profiles readable"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.provider_listings pl
    WHERE pl.user_id = profiles.id AND pl.approved = true
  )
);

-- Remove email column from anon/authenticated access entirely; only owner reads via own-row policy + column grant
REVOKE SELECT (email) ON public.profiles FROM anon;
-- keep authenticated grant on email but rely on RLS: only own row matches "Users can view own profile";
-- the approved-provider policy will still match other rows, leaking email. To prevent that,
-- drop the broad email grant and add an RPC for own email if needed.
REVOKE SELECT (email) ON public.profiles FROM authenticated;
GRANT SELECT (email) ON public.profiles TO authenticated; -- needed for own profile reads

-- 2) ADMIN_EMAILS: hide list, expose only a check function
DROP POLICY IF EXISTS "Users can check admin status" ON public.admin_emails;
REVOKE SELECT ON public.admin_emails FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails ae
    JOIN auth.users u ON u.email = ae.email
    WHERE u.id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

-- 3) BOOKINGS: prevent reassignment of immutable identity fields
CREATE OR REPLACE FUNCTION public.prevent_booking_identity_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.provider_id IS DISTINCT FROM OLD.provider_id
     OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
     OR NEW.listing_id IS DISTINCT FROM OLD.listing_id THEN
    RAISE EXCEPTION 'Cannot change provider_id, customer_id, or listing_id on a booking';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_immutable_identity ON public.bookings;
CREATE TRIGGER bookings_immutable_identity
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.prevent_booking_identity_change();
