import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Clock,
  MoreVertical,
  Star,
  Archive
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface FileVersion {
  id: string;
  fileName: string;
  version: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  isLatest: boolean;
  changeLog?: string;
  fileType: string;
  downloadCount: number;
}

const FileVersionsList: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<FileVersion | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mock data for file versions
  const fileVersions: FileVersion[] = [
    {
      id: '1',
      fileName: 'تقرير_المشروع_النهائي.pdf',
      version: '3.2',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      uploadedBy: 'أحمد محمد',
      isLatest: true,
      changeLog: 'تحديث البيانات المالية وإضافة الملاحق',
      fileType: 'pdf',
      downloadCount: 15
    },
    {
      id: '2',
      fileName: 'تقرير_المشروع_النهائي.pdf',
      version: '3.1',
      size: '2.3 MB',
      uploadDate: '2024-01-10',
      uploadedBy: 'سارة أحمد',
      isLatest: false,
      changeLog: 'تصحيح الأخطاء الإملائية',
      fileType: 'pdf',
      downloadCount: 8
    },
    {
      id: '3',
      fileName: 'تقرير_المشروع_النهائي.pdf',
      version: '3.0',
      size: '2.1 MB',
      uploadDate: '2024-01-05',
      uploadedBy: 'محمد علي',
      isLatest: false,
      changeLog: 'النسخة الأولية للتقرير النهائي',
      fileType: 'pdf',
      downloadCount: 25
    },
    {
      id: '4',
      fileName: 'عرض_تقديمي_المشروع.pptx',
      version: '2.1',
      size: '5.8 MB',
      uploadDate: '2024-01-12',
      uploadedBy: 'فاطمة حسن',
      isLatest: true,
      changeLog: 'إضافة الرسوم البيانية الجديدة',
      fileType: 'pptx',
      downloadCount: 12
    },
    {
      id: '5',
      fileName: 'جدول_البيانات_المالية.xlsx',
      version: '1.5',
      size: '1.2 MB',
      uploadDate: '2024-01-08',
      uploadedBy: 'عمر خالد',
      isLatest: true,
      changeLog: 'تحديث أرقام الربع الأخير',
      fileType: 'xlsx',
      downloadCount: 20
    }
  ];

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = (file: FileVersion) => {
    toast({
      title: "تم بدء التحميل",
      description: `جاري تحميل ${file.fileName} الإصدار ${file.version}`,
    });
  };

  const handlePreview = (file: FileVersion) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const handleArchive = (file: FileVersion) => {
    toast({
      title: "تم أرشفة الملف",
      description: `تم أرشفة ${file.fileName} الإصدار ${file.version}`,
    });
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
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إصدارات الملفات</h2>
          <p className="text-gray-600 mt-1">إدارة ومتابعة جميع إصدارات ملفات المشروع</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {fileVersions.length} ملف
        </Badge>
      </div>

      <div className="space-y-4">
        {fileVersions.map((file) => (
          <Card key={file.id} className={cn(
            "transition-all duration-200 hover:shadow-md",
            file.isLatest && "ring-2 ring-blue-200 bg-blue-50/30"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 space-x-reverse flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(file.fileType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {file.fileName}
                      </h3>
                      <Badge 
                        variant={file.isLatest ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {file.isLatest ? "الأحدث" : `إصدار ${file.version}`}
                      </Badge>
                      {file.isLatest && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(file.uploadDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{file.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>{file.downloadCount} تحميل</span>
                      </div>
                    </div>
                    
                    {file.changeLog && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">سجل التغييرات:</span> {file.changeLog}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          الحجم: {file.size}
                        </span>
                        <span className="text-sm text-gray-500">
                          الإصدار: {file.version}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          معاينة
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          تحميل
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleArchive(file)}>
                              <Archive className="h-4 w-4 ml-2" />
                              أرشفة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFile && getFileIcon(selectedFile.fileType)}
              معاينة الملف: {selectedFile?.fileName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gray-100 rounded-lg p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              معاينة الملف غير متاحة حالياً
            </p>
            <p className="text-sm text-gray-500 mb-6">
              يمكنك تحميل الملف لعرضه في التطبيق المناسب
            </p>
            
            {selectedFile && (
              <div className="space-y-3 text-sm text-gray-600 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span>اسم الملف:</span>
                  <span className="font-medium">{selectedFile.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>الإصدار:</span>
                  <span className="font-medium">{selectedFile.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>الحجم:</span>
                  <span className="font-medium">{selectedFile.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الرفع:</span>
                  <span className="font-medium">{formatDate(selectedFile.uploadDate)}</span>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => selectedFile && handleDownload(selectedFile)}
              className="mt-6"
            >
              <Download className="h-4 w-4 ml-2" />
              تحميل الملف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileVersionsList;