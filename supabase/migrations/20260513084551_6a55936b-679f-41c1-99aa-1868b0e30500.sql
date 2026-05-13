
REVOKE EXECUTE ON FUNCTION public.get_public_provider_profile(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_own_email() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_public_provider_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_own_email() TO authenticated;
