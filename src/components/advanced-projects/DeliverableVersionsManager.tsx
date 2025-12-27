import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Plus, 
  Download,
  Upload,
  History,
  Clock,
  User,
  FileIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DeliverableVersion {
  id: string;
  deliverable_id: string;
  version_number: number;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  change_summary?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  uploaded_at: string;
  is_current: boolean;
  created_at: string;
}

interface DeliverableVersionsManagerProps {
  deliverableId: string;
  deliverableName: string;
}

const DeliverableVersionsManager: React.FC<DeliverableVersionsManagerProps> = ({ 
  deliverableId, 
  deliverableName 
}) => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<DeliverableVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state for new version
  const [newVersion, setNewVersion] = useState({
    file_name: '',
    file_url: '',
    change_summary: ''
  });

  useEffect(() => {
    loadVersions();
  }, [deliverableId]);

  const loadVersions = async () => {
    setLoading(true);
    
    // محاكاة تحميل الإصدارات - في التطبيق الحقيقي سيتم جلبها من Supabase
    const mockVersions: DeliverableVersion[] = [
      {
        id: '1',
        deliverable_id: deliverableId,
        version_number: 3,
        file_url: 'https://example.com/files/ui-design-v3.pdf',
        file_name: 'تصميم_واجهة_المستخدم_v3.pdf',
        file_size: 2621440,
        change_summary: 'إضافة الشاشات المتجاوبة والتفاعلات',
        uploaded_by: 'user1',
        uploaded_by_name: 'سارة أحمد علي',
        uploaded_at: '2024-01-20T14:30:00Z',
        is_current: true,
        created_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        deliverable_id: deliverableId,
        version_number: 2,
        file_url: 'https://example.com/files/ui-design-v2.pdf',
        file_name: 'تصميم_واجهة_المستخدم_v2.pdf',
        file_size: 2359296,
        change_summary: 'تحديث الألوان وتحسين التخطيط',
        uploaded_by: 'user1',
        uploaded_by_name: 'سارة أحمد علي',
        uploaded_at: '2024-01-18T10:15:00Z',
        is_current: false,
        created_at: '2024-01-18T10:15:00Z'
      },
      {
        id: '3',
        deliverable_id: deliverableId,
        version_number: 1,
        file_url: 'https://example.com/files/ui-design-v1.pdf',
        file_name: 'تصميم_واجهة_المستخدم_v1.pdf',
        file_size: 2048576,
        change_summary: 'الإصدار الأولي لتصميم واجهة المستخدم',
        uploaded_by: 'user1',
        uploaded_by_name: 'سارة أحمد علي',
        uploaded_at: '2024-01-15T09:00:00Z',
        is_current: false,
        created_at: '2024-01-15T09:00:00Z'
      }
    ];
    
    setVersions(mockVersions);
    setLoading(false);
  };

  const handleUploadVersion = async () => {
    if (!newVersion.file_name.trim() || !newVersion.file_url.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم الملف ورابط الملف",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    // محاكاة رفع إصدار جديد
    const nextVersionNumber = Math.max(...versions.map(v => v.version_number)) + 1;
    
    const newVersionData: DeliverableVersion = {
      id: Date.now().toString(),
      deliverable_id: deliverableId,
      version_number: nextVersionNumber,
      file_url: newVersion.file_url,
      file_name: newVersion.file_name,
      file_size: Math.floor(Math.random() * 5000000) + 1000000, // حجم عشوائي
      change_summary: newVersion.change_summary,
      uploaded_by: 'current_user',
      uploaded_by_name: 'المستخدم الحالي',
      uploaded_at: new Date().toISOString(),
      is_current: true,
      created_at: new Date().toISOString()
    };

    // تحديث الإصدارات السابقة لتكون غير حالية
    const updatedVersions = versions.map(v => ({ ...v, is_current: false }));
    
    setVersions([newVersionData, ...updatedVersions]);
    setShowUploadDialog(false);
    setNewVersion({ file_name: '', file_url: '', change_summary: '' });
    setUploading(false);

    toast({
      title: "تم رفع الإصدار",
      description: `تم رفع الإصدار ${nextVersionNumber} بنجاح`,
    });
  };

  const handleDownload = (version: DeliverableVersion) => {
    if (version.file_url) {
      window.open(version.file_url, '_blank');
    }
    
    toast({
      title: "تحميل الملف",
      description: `جاري تحميل ${version.file_name}`,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد';
    
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentVersion = versions.find(v => v.is_current);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الإصدارات</h2>
          <p className="text-gray-600 mt-1">إدارة إصدارات المخرج: {deliverableName}</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          رفع إصدار جديد
        </Button>
      </div>

      {/* Current Version Summary */}
      {currentVersion && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-green-800">الإصدار الحالي: v{currentVersion.version_number}</span>
                  <Badge className="bg-green-100 text-green-800">حالي</Badge>
                </div>
                <p className="text-sm text-green-700">{currentVersion.file_name}</p>
                <p className="text-xs text-green-600 mt-1">
                  رفع بواسطة {currentVersion.uploaded_by_name} في {formatDate(currentVersion.uploaded_at)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(currentVersion)}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <Download className="h-4 w-4 mr-2" />
                تحميل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Versions History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">تاريخ الإصدارات</h3>
            <Badge variant="outline">{versions.length} إصدار</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">جاري تحميل الإصدارات...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إصدارات</h3>
              <p className="text-gray-600 mb-4">ابدأ برفع الإصدار الأول من المخرج</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                رفع إصدار جديد
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                      version.is_current 
                        ? "border-green-200 bg-green-50" 
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "p-2 rounded-lg",
                        version.is_current ? "bg-green-100" : "bg-gray-100"
                      )}>
                        <FileIcon className={cn(
                          "h-5 w-5",
                          version.is_current ? "text-green-600" : "text-gray-600"
                        )} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          الإصدار {version.version_number}
                        </span>
                        {version.is_current && (
                          <Badge className="bg-green-100 text-green-800">حالي</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-1">{version.file_name}</p>
                      
                      {version.change_summary && (
                        <p className="text-sm text-gray-600 mb-2">{version.change_summary}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{version.uploaded_by_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(version.uploaded_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{formatFileSize(version.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(version)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Upload New Version Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>رفع إصدار جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">اسم الملف *</Label>
              <Input
                id="file-name"
                value={newVersion.file_name}
                onChange={(e) => setNewVersion({...newVersion, file_name: e.target.value})}
                placeholder="مثال: تصميم_واجهة_المستخدم_v4.pdf"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-url">رابط الملف *</Label>
              <Input
                id="file-url"
                value={newVersion.file_url}
                onChange={(e) => setNewVersion({...newVersion, file_url: e.target.value})}
                placeholder="https://example.com/files/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="change-summary">ملخص التغييرات</Label>
              <Textarea
                id="change-summary"
                value={newVersion.change_summary}
                onChange={(e) => setNewVersion({...newVersion, change_summary: e.target.value})}
                placeholder="وصف موجز للتغييرات في هذا الإصدار..."
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">ملاحظة:</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                سيصبح هذا الإصدار هو الإصدار الحالي تلقائياً، وسيتم تحديث حالة الإصدارات السابقة.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUploadVersion} disabled={uploading}>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  رفع الإصدار
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliverableVersionsManager;