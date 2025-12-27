import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  History,
  FolderOpen,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import FileUploadDialog from "@/components/tree-system/FileUploadDialog";
import FileVersionsList from "@/components/tree-system/FileVersionsList";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  uploadedBy: string;
  deliverableId?: string;
  deliverableName?: string;
  versions: FileVersion[];
  status: 'active' | 'archived' | 'deleted';
}

interface FileVersion {
  id: string;
  version: string;
  uploadDate: Date;
  uploadedBy: string;
  size: number;
  changes: string;
  url: string;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'images' | 'videos'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockFiles: FileItem[] = [
      {
        id: '1',
        name: 'تقرير_المرحلة_الأولى.pdf',
        type: 'pdf',
        size: 2048576,
        uploadDate: new Date('2024-01-15'),
        uploadedBy: 'أحمد محمد',
        deliverableId: 'del1',
        deliverableName: 'تقرير التحليل الأولي',
        status: 'active',
        versions: [
          {
            id: 'v1',
            version: '1.0',
            uploadDate: new Date('2024-01-15'),
            uploadedBy: 'أحمد محمد',
            size: 2048576,
            changes: 'النسخة الأولى',
            url: '/files/report_v1.pdf'
          }
        ]
      },
      {
        id: '2',
        name: 'مخططات_التصميم.zip',
        type: 'zip',
        size: 15728640,
        uploadDate: new Date('2024-01-20'),
        uploadedBy: 'سارة أحمد',
        deliverableId: 'del2',
        deliverableName: 'مخططات التصميم المعماري',
        status: 'active',
        versions: [
          {
            id: 'v2',
            version: '2.1',
            uploadDate: new Date('2024-01-20'),
            uploadedBy: 'سارة أحمد',
            size: 15728640,
            changes: 'تحديث المخططات وإضافة التفاصيل',
            url: '/files/designs_v2.zip'
          }
        ]
      }
    ];
    setFiles(mockFiles);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'zip':
      case 'rar':
        return <FolderOpen className="h-8 w-8 text-yellow-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.deliverableName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'documents' && ['pdf', 'doc', 'docx'].includes(file.type)) ||
                         (filterType === 'images' && ['jpg', 'jpeg', 'png', 'gif'].includes(file.type)) ||
                         (filterType === 'videos' && ['mp4', 'avi', 'mov'].includes(file.type));
    
    return matchesSearch && matchesFilter && file.status === 'active';
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'ar');
      case 'size':
        return b.size - a.size;
      case 'date':
      default:
        return b.uploadDate.getTime() - a.uploadDate.getTime();
    }
  });

  const handleFileUpload = (fileData: any) => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      uploadDate: new Date(),
      uploadedBy: 'المستخدم الحالي',
      deliverableId: fileData.deliverableId,
      deliverableName: fileData.deliverableName,
      status: 'active',
      versions: [{
        id: 'v1',
        version: '1.0',
        uploadDate: new Date(),
        uploadedBy: 'المستخدم الحالي',
        size: fileData.size,
        changes: 'النسخة الأولى',
        url: fileData.url
      }]
    };

    setFiles(prev => [newFile, ...prev]);
    toast({
      title: "تم رفع الملف بنجاح",
      description: `تم رفع الملف "${fileData.name}" بنجاح`,
    });
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status: 'deleted' as const } : file
    ));
    toast({
      title: "تم حذف الملف",
      description: "تم حذف الملف بنجاح",
    });
  };

  const handleDownloadFile = (file: FileItem) => {
    // Simulate file download
    toast({
      title: "جاري تحميل الملف",
      description: `جاري تحميل "${file.name}"`,
    });
  };

  const handleViewVersions = (file: FileItem) => {
    setSelectedFile(file);
    setIsVersionsDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">إدارة الملفات</h2>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 ml-2" />
            رفع ملف جديد
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="البحث في الملفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأنواع</option>
              <option value="documents">المستندات</option>
              <option value="images">الصور</option>
              <option value="videos">الفيديوهات</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">ترتيب حسب التاريخ</option>
              <option value="name">ترتيب حسب الاسم</option>
              <option value="size">ترتيب حسب الحجم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid gap-4 w-full">
        {sortedFiles.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <FileText className="h-16 w-16 text-gray-300" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد ملفات</h3>
                <p className="text-gray-500">لم يتم العثور على ملفات تطابق معايير البحث</p>
              </div>
            </div>
          </Card>
        ) : (
          sortedFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        {file.deliverableName && (
                          <p className="text-sm text-blue-600 mt-1">
                            {file.deliverableName}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 mt-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.uploadDate.toLocaleDateString('ar-SA')}</span>
                          <span>•</span>
                          <span>{file.uploadedBy}</span>
                          <span>•</span>
                          <span>{file.versions.length} إصدار</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewVersions(file)}
                          className="text-gray-600 hover:text-green-600"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">إحصائيات الملفات</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {files.filter(f => f.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">إجمالي الملفات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {files.reduce((sum, f) => sum + f.versions.length, 0)}
              </div>
              <div className="text-sm text-gray-500">إجمالي الإصدارات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
              </div>
              <div className="text-sm text-gray-500">إجمالي الحجم</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {files.filter(f => f.uploadDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-500">ملفات هذا الأسبوع</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleFileUpload}
      />

      {selectedFile && (
        <FileVersionsList
          isOpen={isVersionsDialogOpen}
          onClose={() => {
            setIsVersionsDialogOpen(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
        />
      )}
    </div>
  );
};

export default FileManager;