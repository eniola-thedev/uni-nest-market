
-- Avatars: anyone can view, users manage own (folder = user id)
CREATE POLICY "Avatars viewable to all" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Listing images: viewable to all, users manage own
CREATE POLICY "Listing images viewable to all" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Users upload own listing images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own listing images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own listing images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Student IDs: private
CREATE POLICY "Owner can view own student id" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-ids' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admin can view all student ids" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-ids' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "User upload own student id" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-ids' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "User update own student id" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'student-ids' AND (storage.foldername(name))[1] = auth.uid()::text);
