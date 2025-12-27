import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface Requirement {
  id: string;
  name: string;
  type: 'technical_proposal' | 'contract' | 'project_plan';
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  file?: File;
  uploadDate?: Date;
  approvedBy?: string;
  comments?: string;
  required: boolean;
}

const ProjectRequirements: React.FC = () => {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      name: 'العرض الفني',
      type: 'technical_proposal',
      status: 'approved',
      required: true,
      uploadDate: new Date('2024-01-15'),
      approvedBy: 'أحمد محمد',
      comments: 'تم الموافقة على العرض الفني'
    },
    {
      id: '2',
      name: 'العقد الموقع',
      type: 'contract',
      status: 'submitted',
      required: true,
      uploadDate: new Date('2024-01-20'),
      comments: 'في انتظار المراجعة القانونية'
    },
    {
      id: '3',
      name: 'مخطط المشروع التفصيلي',
      type: 'project_plan',
      status: 'pending',
      required: true
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const getStatusIcon = (status: Requirement['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Requirement['status']) => {
    switch (status) {
      case 'approved':
        return 'معتمد';
      case 'submitted':
        return 'مرسل';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'في الانتظار';
    }
  };

  const getStatusColor = (status: Requirement['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, requirementId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadingFor(requirementId);
    }
  };

  const handleUpload = (requirementId: string) => {
    if (!selectedFile) return;

    setRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? { 
            ...req, 
            file: selectedFile, 
            status: 'submitted',
            uploadDate: new Date(),
            comments: 'تم رفع الملف بنجاح'
          }
        : req
    ));

    toast({
      title: "تم رفع الملف",
      description: "تم رفع الملف بنجاح وإرساله للمراجعة",
    });

    setSelectedFile(null);
    setUploadingFor(null);
  };

  const handleApprove = (requirementId: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? { 
            ...req, 
            status: 'approved',
            approvedBy: 'مدير المشروع',
            comments: 'تم اعتماد المتطلب'
          }
        : req
    ));

    toast({
      title: "تم الاعتماد",
      description: "تم اعتماد المتطلب بنجاح",
    });
  };

  const handleReject = (requirementId: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? { 
            ...req, 
            status: 'rejected',
            comments: 'يحتاج إلى تعديل'
          }
        : req
    ));

    toast({
      title: "تم الرفض",
      description: "تم رفض المتطلب، يرجى المراجعة والتعديل",
      variant: "destructive"
    });
  };

  const completedRequirements = requirements.filter(req => req.status === 'approved').length;
  const totalRequirements = requirements.filter(req => req.required).length;
  const completionPercentage = (completedRequirements / totalRequirements) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">متطلبات المشروع الإلزامية</h2>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 ml-2" />
            إضافة متطلب جديد
          </Button>
        </div>
        
        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">نسبة الإنجاز</h3>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{completedRequirements} من {totalRequirements} متطلب مكتمل</span>
              <span>
                {totalRequirements - completedRequirements} متطلب متبقي
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {requirements.map((requirement) => (
          <Card key={requirement.id} className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">{requirement.name}</h3>
                    {requirement.required && (
                      <span className="text-sm text-red-600">* مطلوب</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(requirement.status)}
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    getStatusColor(requirement.status)
                  )}>
                    {getStatusText(requirement.status)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* File Upload Section */}
              {requirement.status === 'pending' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">رفع الملف</h4>
                    <p className="text-gray-600 mb-4">
                      اختر الملف المطلوب لهذا المتطلب
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      <input
                        type="file"
                        id={`file-${requirement.id}`}
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, requirement.id)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <label
                        htmlFor={`file-${requirement.id}`}
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        اختيار ملف
                      </label>
                      {uploadingFor === requirement.id && selectedFile && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {selectedFile.name}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleUpload(requirement.id)}
                          >
                            رفع الملف
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* File Info */}
              {requirement.file && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{requirement.file.name}</p>
                        <p className="text-sm text-gray-600">
                          تم الرفع في: {requirement.uploadDate?.toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 ml-1" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              {requirement.comments && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">ملاحظات:</h5>
                  <p className="text-blue-800">{requirement.comments}</p>
                  {requirement.approvedBy && (
                    <p className="text-sm text-blue-600 mt-2">
                      بواسطة: {requirement.approvedBy}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {requirement.status === 'submitted' && (
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(requirement.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 ml-1" />
                    اعتماد
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(requirement.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4 ml-1" />
                    رفض
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                </div>
              )}

              {requirement.status === 'approved' && (
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 ml-1" />
                    عرض التفاصيل
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">ملخص المتطلبات</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-800">إجمالي المتطلبات:</span>
              <span className="font-semibold text-blue-900">{requirements.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">المتطلبات المعتمدة:</span>
              <span className="font-semibold text-green-600">{completedRequirements}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">في انتظار المراجعة:</span>
              <span className="font-semibold text-yellow-600">
                {requirements.filter(req => req.status === 'submitted').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">المتطلبات المتبقية:</span>
              <span className="font-semibold text-red-600">
                {requirements.filter(req => req.status === 'pending').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRequirements;