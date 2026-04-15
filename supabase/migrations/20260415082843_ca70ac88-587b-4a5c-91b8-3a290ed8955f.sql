
-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

CREATE POLICY "Providers can upload listing photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can update listing photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Providers can delete listing photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add gallery_urls column
ALTER TABLE public.provider_listings ADD COLUMN gallery_urls text[] DEFAULT '{}';
