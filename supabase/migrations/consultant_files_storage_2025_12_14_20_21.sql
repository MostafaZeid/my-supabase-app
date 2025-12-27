-- إنشاء bucket لملفات المستشارين
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consultant-files',
  'consultant-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- سياسة السماح بالرفع للمستشارين والمدراء
CREATE POLICY "Allow upload for consultants and admins" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'consultant-files' AND
  (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
);

-- سياسة السماح بالعرض للجميع (الملفات عامة)
CREATE POLICY "Allow public view" ON storage.objects
FOR SELECT USING (bucket_id = 'consultant-files');

-- سياسة السماح بالتحديث للمالك أو المدراء
CREATE POLICY "Allow update for owner or admins" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'consultant-files' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    auth.role() = 'service_role'
  )
);

-- سياسة السماح بالحذف للمالك أو المدراء
CREATE POLICY "Allow delete for owner or admins" ON storage.objects
FOR DELETE USING (
  bucket_id = 'consultant-files' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    auth.role() = 'service_role'
  )
);