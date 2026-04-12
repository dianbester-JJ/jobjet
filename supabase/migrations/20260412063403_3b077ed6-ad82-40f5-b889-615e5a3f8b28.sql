
-- Add roles array and active_role to profiles
ALTER TABLE public.profiles
ADD COLUMN roles text[] NOT NULL DEFAULT ARRAY['customer']::text[],
ADD COLUMN active_role text NOT NULL DEFAULT 'customer';

-- Migrate existing providers: set their roles to ['pro'] and active_role to 'pro'
UPDATE public.profiles
SET roles = ARRAY['pro']::text[], active_role = 'pro'
WHERE id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'provider'
);

-- Update handle_new_user function to set roles on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, roles, active_role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    ARRAY['customer']::text[],
    'customer'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');
  
  RETURN new;
END;
$function$;
