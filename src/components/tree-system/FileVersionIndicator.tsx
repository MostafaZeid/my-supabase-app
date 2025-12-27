import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileVersion {
  id: string;
  version: string;
  fileName: string;
  uploadDate: string;
  size: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  downloadUrl?: string;
}

const FileVersionIndicator: React.FC = () => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Mock data for demonstration
  const fileVersions: FileVersion[] = [
    {
      id: '1',
      version: 'v1.0',
      fileName: 'تقرير_المرحلة_الأولى.pdf',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      status: 'approved',
      downloadUrl: '/files/report-v1.pdf'
    },
    {
      id: '2',
      version: 'v1.1',
      fileName: 'تقرير_المرحلة_الأولى_محدث.pdf',
      uploadDate: '2024-01-20',
      size: '2.8 MB',
      status: 'review',
      downloadUrl: '/files/report-v1-1.pdf'
    },
    {
      id: '3',
      version: 'v2.0',
      fileName: 'تقرير_المرحلة_الأولى_نهائي.pdf',
      uploadDate: '2024-01-25',
      size: '3.1 MB',
      status: 'draft'
    }
  ];

  const getStatusIcon = (status: FileVersion['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: FileVersion['status']) => {
    switch (status) {
      case 'approved':
        return 'معتمد';
      case 'review':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'مسودة';
    }
  };

  const getStatusColor = (status: FileVersion['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = async (file: FileVersion) => {
    if (!file.downloadUrl) {
      toast({
        title: "خطأ في التحميل",
        description: "الملف غير متاح للتحميل حالياً",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(file.id);

    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, you would handle the actual file download here
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "تم التحميل بنجاح",
        description: `تم تحميل ${file.fileName} بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل الملف",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">إصدارات الملفات</h3>
      </div>

      {fileVersions.map((file) => (
        <div
          key={file.id}
          className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {file.version}
                </span>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                  getStatusColor(file.status)
                )}>
                  {getStatusIcon(file.status)}
                  {getStatusText(file.status)}
                </div>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1 truncate">
                {file.fileName}
              </h4>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>تاريخ الرفع: {formatDate(file.uploadDate)}</span>
                <span>الحجم: {file.size}</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(file)}
                disabled={!file.downloadUrl || isDownloading === file.id}
                className="flex items-center gap-2"
              >
                <Download className={cn(
                  "h-4 w-4",
                  isDownloading === file.id && "animate-spin"
                )} />
                {isDownloading === file.id ? 'جاري التحميل...' : 'تحميل'}
              </Button>
            </div>
          </div>

          {file.status === 'rejected' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>سبب الرفض:</strong> يرجى مراجعة التنسيق والتأكد من اكتمال البيانات المطلوبة
              </p>
            </div>
          )}

          {file.status === 'review' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                الملف قيد المراجعة من قبل فريق الإدارة، سيتم إشعارك بالنتيجة قريباً
              </p>
            </div>
          )}
        </div>
      ))}

      {fileVersions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد ملفات متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default FileVersionIndicator;