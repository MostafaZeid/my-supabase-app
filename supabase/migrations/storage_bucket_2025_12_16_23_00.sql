-- إنشاء bucket للملفات
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deliverable-files',
  'deliverable-files', 
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
);

-- سياسة الرفع: فقط المستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'deliverable-files'
);

-- سياسة القراءة: فقط المستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'deliverable-files'
);

-- سياسة التحديث: فقط صاحب الملف
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'deliverable-files'
);

-- سياسة الحذف: فقط صاحب الملف
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1] AND
  bucket_id = 'deliverable-files'
);