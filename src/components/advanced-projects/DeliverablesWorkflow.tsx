import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Download,
  Upload,
  MessageSquare,
  User,
  Calendar,
  Eye,
  Edit3,
  Send,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'design' | 'code' | 'report';
  status: 'draft' | 'submitted' | 'under_review' | 'revision_requested' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  comments: Comment[];
  files: File[];
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  type: 'comment' | 'revision_request' | 'approval';
}

interface File {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  url: string;
}

const DeliverablesWorkflow: React.FC = () => {
  const { toast } = useToast();
  const [selectedDeliverable, setSelectedDeliverable] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Handler functions
  const handleApproveDeliverable = (id: string) => {
    setDeliverables(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'approved' as const, reviewedAt: new Date() } : d
    ))
    toast({
      title: "تم اعتماد المخرج",
      description: "تم اعتماد المخرج بنجاح",
    })
  }

  const handleRequestRevision = (id: string) => {
    setDeliverables(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'revision_requested' as const, reviewedAt: new Date() } : d
    ))
    toast({
      title: "طلب تعديل",
      description: "تم طلب تعديل على المخرج",
    })
  }

  const handleRejectDeliverable = (id: string) => {
    setDeliverables(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'rejected' as const, reviewedAt: new Date() } : d
    ))
    toast({
      title: "تم رفض المخرج",
      description: "تم رفض المخرج",
      variant: "destructive"
    })
  }

  const handleDownloadFile = (file: File) => {
    toast({
      title: "تحميل الملف",
      description: `جاري تحميل ${file.name}`,
    })
  }

  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      title: 'تصميم واجهة المستخدم الرئيسية',
      description: 'تصميم شامل لواجهة المستخدم الرئيسية للتطبيق',
      type: 'design',
      status: 'under_review',
      submittedBy: 'أحمد محمد',
      submittedAt: new Date('2024-01-15'),
      reviewedBy: 'سارة أحمد',
      comments: [
        {
          id: '1',
          author: 'سارة أحمد',
          content: 'التصميم ممتاز، لكن يحتاج تعديل في الألوان',
          createdAt: new Date('2024-01-16'),
          type: 'comment'
        }
      ],
      files: [
        {
          id: '1',
          name: 'ui-design-v1.figma',
          size: 2048000,
          uploadedAt: new Date('2024-01-15'),
          url: '#'
        }
      ],
      dueDate: new Date('2024-01-20'),
      priority: 'high'
    },
    {
      id: '2',
      title: 'تقرير تحليل المتطلبات',
      description: 'تقرير مفصل عن تحليل متطلبات المشروع',
      type: 'report',
      status: 'revision_requested',
      submittedBy: 'محمد علي',
      submittedAt: new Date('2024-01-14'),
      reviewedBy: 'خالد حسن',
      reviewedAt: new Date('2024-01-16'),
      comments: [
        {
          id: '2',
          author: 'خالد حسن',
          content: 'يرجى إضافة المزيد من التفاصيل في قسم المتطلبات الوظيفية',
          createdAt: new Date('2024-01-16'),
          type: 'revision_request'
        }
      ],
      files: [
        {
          id: '2',
          name: 'requirements-analysis.pdf',
          size: 1024000,
          uploadedAt: new Date('2024-01-14'),
          url: '#'
        }
      ],
      dueDate: new Date('2024-01-18'),
      priority: 'medium'
    },
    {
      id: '3',
      title: 'كود وحدة المصادقة',
      description: 'تطوير وحدة المصادقة والتحقق من الهوية',
      type: 'code',
      status: 'approved',
      submittedBy: 'فاطمة سالم',
      submittedAt: new Date('2024-01-12'),
      reviewedBy: 'عمر يوسف',
      reviewedAt: new Date('2024-01-14'),
      comments: [
        {
          id: '3',
          author: 'عمر يوسف',
          content: 'الكود ممتاز ويتبع أفضل الممارسات. معتمد للنشر',
          createdAt: new Date('2024-01-14'),
          type: 'approval'
        }
      ],
      files: [
        {
          id: '3',
          name: 'auth-module.zip',
          size: 512000,
          uploadedAt: new Date('2024-01-12'),
          url: '#'
        }
      ],
      dueDate: new Date('2024-01-15'),
      priority: 'high'
    }
  ]);

  const getStatusIcon = (status: Deliverable['status']) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="h-4 w-4" />;
      case 'submitted':
        return <Send className="h-4 w-4" />;
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'revision_requested':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Deliverable['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-500 bg-gray-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'revision_requested':
        return 'text-orange-600 bg-orange-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: Deliverable['status']) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'submitted':
        return 'مُرسل';
      case 'under_review':
        return 'قيد المراجعة';
      case 'revision_requested':
        return 'مطلوب تعديل';
      case 'approved':
        return 'معتمد';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير محدد';
    }
  };

  const getPriorityColor = (priority: Deliverable['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-r-red-500';
      case 'medium':
        return 'border-r-yellow-500';
      case 'low':
        return 'border-r-green-500';
      default:
        return 'border-r-gray-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStatusChange = (deliverableId: string, newStatus: Deliverable['status']) => {
    setDeliverables(prev => prev.map(d => 
      d.id === deliverableId 
        ? { ...d, status: newStatus, reviewedAt: new Date() }
        : d
    ));
    
    toast({
      title: "تم تحديث الحالة",
      description: `تم تغيير حالة المخرج إلى ${getStatusText(newStatus)}`,
    });
  };

  const handleAddComment = (deliverableId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'المراجع الحالي',
      content: newComment,
      createdAt: new Date(),
      type: 'comment'
    };

    setDeliverables(prev => prev.map(d => 
      d.id === deliverableId 
        ? { ...d, comments: [...d.comments, comment] }
        : d
    ));

    setNewComment('');
    toast({
      title: "تم إضافة التعليق",
      description: "تم إضافة تعليقك بنجاح",
    });
  };

  const filteredDeliverables = deliverables.filter(d => 
    filterStatus === 'all' || d.status === filterStatus
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">سير عمل المخرجات</h2>
          <p className="text-gray-600">إدارة ومراجعة واعتماد مخرجات المشروع</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ml-2" />
            رفع مخرج جديد
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              الكل ({deliverables.length})
            </Button>
            <Button
              variant={filterStatus === 'under_review' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('under_review')}
            >
              قيد المراجعة ({deliverables.filter(d => d.status === 'under_review').length})
            </Button>
            <Button
              variant={filterStatus === 'revision_requested' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('revision_requested')}
            >
              مطلوب تعديل ({deliverables.filter(d => d.status === 'revision_requested').length})
            </Button>
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('approved')}
            >
              معتمد ({deliverables.filter(d => d.status === 'approved').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables List */}
      <div className="space-y-4">
        {filteredDeliverables.map((deliverable) => (
          <Card key={deliverable.id} className={cn("border-r-4", getPriorityColor(deliverable.priority))}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{deliverable.title}</h3>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(deliverable.status)
                    )}>
                      {getStatusIcon(deliverable.status)}
                      {getStatusText(deliverable.status)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{deliverable.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {deliverable.submittedBy}
                    </div>
                    {deliverable.submittedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        تم الإرسال: {deliverable.submittedAt.toLocaleDateString('ar-SA')}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      موعد التسليم: {deliverable.dueDate.toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDeliverable(
                      selectedDeliverable === deliverable.id ? null : deliverable.id
                    )}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    {selectedDeliverable === deliverable.id ? 'إخفاء' : 'عرض'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {selectedDeliverable === deliverable.id && (
              <CardContent className="pt-0 border-t">
                <div className="space-y-6">
                  {/* Files Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">الملفات المرفقة</h4>
                    <div className="space-y-2">
                      {deliverable.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">التعليقات والملاحظات</h4>
                    <div className="space-y-3 mb-4">
                      {deliverable.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt.toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="إضافة تعليق..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(deliverable.id)}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleAddComment(deliverable.id)}
                        disabled={!newComment.trim()}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {deliverable.status === 'under_review' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(deliverable.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          اعتماد
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(deliverable.id, 'revision_requested')}
                        >
                          <RefreshCw className="h-4 w-4 ml-1" />
                          طلب تعديل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(deliverable.id, 'rejected')}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          رفض
                        </Button>
                      </>
                    )}
                    
                    {deliverable.status === 'revision_requested' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(deliverable.id, 'submitted')}
                      >
                        <ArrowRight className="h-4 w-4 ml-1" />
                        إعادة إرسال
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredDeliverables.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مخرجات</h3>
            <p className="text-gray-600">لم يتم العثور على مخرجات تطابق المرشح المحدد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliverablesWorkflow;