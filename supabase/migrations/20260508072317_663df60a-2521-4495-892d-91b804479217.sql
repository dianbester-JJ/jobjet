CREATE POLICY "Users can upload completed job images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'listing-photos'
  AND (storage.foldername(name))[1] = 'completed-jobs'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update own completed job images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'listing-photos'
  AND (storage.foldername(name))[1] = 'completed-jobs'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete own completed job images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'listing-photos'
  AND (storage.foldername(name))[1] = 'completed-jobs'
  AND (storage.foldername(name))[2] = auth.uid()::text
);