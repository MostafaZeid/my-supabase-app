import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], versionType: 'major' | 'minor' | 'patch') => Promise<void>;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5
}) => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'patch'>('minor');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `حجم الملف يتجاوز الحد المسموح (${Math.round(maxFileSize / 1024 / 1024)}MB)`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast({
        title: "خطأ",
        description: `لا يمكن رفع أكثر من ${maxFiles} ملفات`,
        variant: "destructive"
      });
      return;
    }

    const validFiles: FileUploadItem[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "خطأ في الملف",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
        return;
      }

      // Check for duplicates
      const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size);
      if (isDuplicate) {
        toast({
          title: "ملف مكرر",
          description: `الملف ${file.name} موجود بالفعل`,
          variant: "destructive"
        });
        return;
      }

      validFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending'
      });
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = (fileItem: FileUploadItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' } : f
      ));

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: Math.min(progress, 100) } : f
        ));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulate random success/failure
          const isSuccess = Math.random() > 0.1; // 90% success rate
          
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { 
                  ...f, 
                  progress: 100, 
                  status: isSuccess ? 'success' : 'error',
                  error: isSuccess ? undefined : 'فشل في رفع الملف'
                } 
              : f
          ));

          if (isSuccess) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload files sequentially
      for (const fileItem of files) {
        if (fileItem.status === 'pending') {
          await simulateUpload(fileItem);
        }
      }

      // Check if all uploads were successful
      const failedUploads = files.filter(f => f.status === 'error');
      
      if (failedUploads.length === 0) {
        const successfulFiles = files.map(f => f.file);
        await onUpload(successfulFiles, versionType);
        
        toast({
          title: "تم الرفع بنجاح",
          description: `تم رفع ${files.length} ملف بنجاح`,
        });
        
        handleClose();
      } else {
        toast({
          title: "فشل في رفع بعض الملفات",
          description: `فشل في رفع ${failedUploads.length} من ${files.length} ملف`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء رفع الملفات",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setVersionType('minor');
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm md:max-w-lg lg:max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-lg font-semibold">رفع ملف جديد</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Version Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">نوع الإصدار</label>
            <div className="flex gap-2">
              {[
                { value: 'major', label: 'رئيسي', description: 'تغييرات كبيرة' },
                { value: 'minor', label: 'فرعي', description: 'تحسينات' },
                { value: 'patch', label: 'إصلاح', description: 'إصلاحات بسيطة' }
              ].map((type) => (
                <Button
                  key={type.value}
                  variant={versionType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVersionType(type.value as any)}
                  disabled={isUploading}
                  className="flex-1 flex-col h-auto py-2"
                >
                  <span className="font-medium">{type.label}</span>
                  <span className="text-xs opacity-70">{type.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
              isUploading && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
            <p className="text-sm text-gray-500 mb-4">
              الحد الأقصى: {maxFiles} ملفات، {Math.round(maxFileSize / 1024 / 1024)}MB لكل ملف
            </p>
            <p className="text-xs text-gray-400 mb-4">
              الأنواع المدعومة: {acceptedTypes.join(', ')}
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              اختيار الملفات
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">الملفات المحددة ({files.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    {getStatusIcon(fileItem.status)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      
                      {fileItem.status === 'uploading' && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(fileItem.progress)}%
                          </p>
                        </div>
                      )}
                      
                      {fileItem.status === 'error' && fileItem.error && (
                        <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                      )}
                    </div>

                    {fileItem.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                        disabled={isUploading}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="flex-1"
            >
              {isUploading ? 'جاري الرفع...' : 'رفع الملفات'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadDialog;