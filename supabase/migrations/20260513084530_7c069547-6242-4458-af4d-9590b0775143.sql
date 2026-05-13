
-- 1) admin_notes on provider_listings: revoke column from public roles
REVOKE SELECT (admin_notes) ON public.provider_listings FROM anon, authenticated;
-- Owners can still read all their own columns via separate self-policy (none currently column-restricted).
-- Re-grant other columns explicitly to authenticated/anon
GRANT SELECT (id, user_id, title, category_id, description, hourly_rate, years_experience, cover_photo_url, verified, created_at, updated_at, approved, service_radius, latitude, longitude, rate_type, rate_unit, working_hours_per_day, gallery_urls, location)
  ON public.provider_listings TO anon, authenticated;

-- 2) Realtime: restrict messages channel subscriptions
-- Enable RLS on realtime.messages if not already
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='realtime' AND tablename='messages') THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

DROP POLICY IF EXISTS "Authenticated users can receive own message broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can receive own message broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Restrict realtime subscriptions: topic must reference the user's id
  -- Supabase realtime broadcasts on channel topics; we scope by topic prefix matching auth.uid()
  (realtime.topic() LIKE 'user:' || auth.uid()::text || ':%')
  OR (realtime.topic() = 'messages:' || auth.uid()::text)
);

-- 3) admin_emails: enable RLS with no public policies (only SECURITY DEFINER functions access it)
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.admin_emails FROM anon, authenticated;

-- 4) message-attachments storage bucket: make private + path-based ownership
UPDATE storage.buckets SET public = false WHERE id = 'message-attachments';

DROP POLICY IF EXISTS "Public can read message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Message participants can read attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own message attachments" ON storage.objects;

CREATE POLICY "Users can upload own message attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Message participants can read attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.attachment_url LIKE '%' || storage.objects.name
        AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can delete own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5) profiles: hide email from public/approved-provider exposure (phone stays visible by product design)
REVOKE SELECT (email) ON public.profiles FROM anon, authenticated;
-- Owner still sees their own email because of "Users can view own profile" policy + table-level grant via auth context.
-- Re-grant email select only to no one publicly; owner reads use service-level access through Supabase auth (auth.uid()=id).
-- Actually column grants apply per role; we need owner to still see email. Grant email back to authenticated; the
-- "Approved provider profiles readable" policy will still allow row access but column grant gates it.
-- Since we want owner-only email access, we keep email REVOKED at column level and rely on a SECURITY DEFINER function for any owner read.
-- Simpler: re-grant email to authenticated, but tighten the "Approved provider profiles readable" policy to exclude email is impossible at policy level.
-- Use a column-grant approach: keep email revoked from anon, grant to authenticated (only owner policy returns the row → owner sees email; provider-public policy also returns row but app code should not select email).
GRANT SELECT (email) ON public.profiles TO authenticated;
-- Net effect: anon never sees email; authenticated can technically select email of approved providers via the policy.
-- To fully block, drop email exposure via the public-provider policy by splitting policies.

DROP POLICY IF EXISTS "Approved provider profiles readable" ON public.profiles;

-- Create a SECURITY DEFINER function that returns safe public provider profile data (no email)
CREATE OR REPLACE FUNCTION public.get_public_provider_profile(_user_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  phone text,
  location text,
  roles text[],
  active_role text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.phone, p.location, p.roles, p.active_role
  FROM public.profiles p
  WHERE p.id = _user_id
    AND EXISTS (SELECT 1 FROM public.provider_listings pl WHERE pl.user_id = p.id AND pl.approved = true);
$$;

-- Restore a policy so app queries listing approved provider profiles still work but only for non-sensitive columns.
-- Since column-level grant control is the only way at policy time, we grant minimal columns to anon/authenticated and revoke email/deletion_requested_at.
CREATE POLICY "Approved provider public columns readable"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM public.provider_listings pl WHERE pl.user_id = profiles.id AND pl.approved = true)
);

REVOKE SELECT (email, deletion_requested_at) ON public.profiles FROM anon;
REVOKE SELECT (email, deletion_requested_at) ON public.profiles FROM authenticated;
-- Owner reads of own email: use a dedicated function
CREATE OR REPLACE FUNCTION public.get_own_email()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT email FROM public.profiles WHERE id = auth.uid(); $$;

-- 6) user_roles privilege escalation: only allow self-inserting 'customer'
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert own customer role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'customer'::app_role);
