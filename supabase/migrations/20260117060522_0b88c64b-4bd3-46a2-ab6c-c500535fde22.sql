-- Create vetting_submissions table
CREATE TABLE public.vetting_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  id_photo_url TEXT,
  has_criminal_history BOOLEAN NOT NULL DEFAULT false,
  criminal_offence TEXT,
  services TEXT[] NOT NULL,
  other_service TEXT,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('referrals', 'photos')),
  referral_numbers TEXT[],
  job_photo_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vetting_submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own submissions
CREATE POLICY "Users can insert own vetting submission"
  ON public.vetting_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own vetting submission"
  ON public.vetting_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Add approved column to provider_listings
ALTER TABLE public.provider_listings 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create admin_emails table for storing admin email addresses
CREATE TABLE public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_emails (only for reading)
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can check if their email is admin
CREATE POLICY "Users can check admin status"
  ON public.admin_emails FOR SELECT
  USING (true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE email = _email
  )
$$;

-- Admin can view all vetting submissions
CREATE POLICY "Admins can view all vetting submissions"
  ON public.vetting_submissions FOR SELECT
  USING (public.is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

-- Admin can update vetting submissions
CREATE POLICY "Admins can update vetting submissions"
  ON public.vetting_submissions FOR UPDATE
  USING (public.is_admin((SELECT email FROM auth.users WHERE id = auth.uid())));

-- Update provider_listings policy to only show approved listings to public
DROP POLICY IF EXISTS "Anyone can view listings" ON public.provider_listings;

CREATE POLICY "Anyone can view approved listings"
  ON public.provider_listings FOR SELECT
  USING (approved = true OR auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_vetting_submissions_updated_at
BEFORE UPDATE ON public.vetting_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();