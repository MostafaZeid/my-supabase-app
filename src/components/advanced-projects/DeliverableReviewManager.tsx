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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  Send,
  User,
  Calendar,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Plus,
  Filter
} from "lucide-react";

interface DeliverableReview {
  id: string;
  deliverable_id: string;
  deliverable_name?: string;
  version_id?: string;
  reviewer_user_id: string;
  reviewer_name?: string;
  submitter_user_id: string;
  submitter_name?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_at: string;
  review_due_date?: string;
  reviewed_at?: string;
  status: 'pending' | 'in_review' | 'approved' | 'changes_requested' | 'rejected';
  decision?: 'approved' | 'changes_requested' | 'rejected';
  decision_notes?: string;
  created_at: string;
}

interface ReviewComment {
  id: string;
  review_id: string;
  author_user_id: string;
  author_name?: string;
  comment_type: 'note' | 'change_request' | 'response' | 'approval_note';
  content: string;
  is_internal: boolean;
  created_at: string;
}

interface DeliverableReviewManagerProps {
  projectId: string;
  deliverableId?: string;
}

const DeliverableReviewManager: React.FC<DeliverableReviewManagerProps> = ({ 
  projectId, 
  deliverableId 
}) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<DeliverableReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<DeliverableReview | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Form states
  const [newReview, setNewReview] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    reviewer_user_id: '',
    review_due_date: ''
  });
  
  const [newComment, setNewComment] = useState({
    content: '',
    comment_type: 'note' as const,
    is_internal: false
  });

  useEffect(() => {
    loadReviews();
  }, [projectId, deliverableId]);

  const loadReviews = async () => {
    setLoading(true);
    
    // محاكاة تحميل المراجعات - في التطبيق الحقيقي سيتم جلبها من Supabase
    const mockReviews: DeliverableReview[] = [
      {
        id: '1',
        deliverable_id: '11111111-1111-1111-1111-111111111111',
        deliverable_name: 'تصميم واجهة المستخدم',
        version_id: 'v3',
        reviewer_user_id: 'reviewer1',
        reviewer_name: 'د. محمد العلي',
        submitter_user_id: 'submitter1',
        submitter_name: 'سارة أحمد علي',
        title: 'مراجعة تصميم واجهة المستخدم - الإصدار 3',
        description: 'مراجعة شاملة للتصميم النهائي مع التركيز على تجربة المستخدم',
        priority: 'high',
        submitted_at: '2024-01-20T10:00:00Z',
        review_due_date: '2024-01-23T17:00:00Z',
        reviewed_at: '2024-01-22T14:30:00Z',
        status: 'approved',
        decision: 'approved',
        decision_notes: 'التصميم ممتاز ويلبي جميع المتطلبات. معتمد للتنفيذ.',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        deliverable_id: '22222222-2222-2222-2222-222222222222',
        deliverable_name: 'مخطط قاعدة البيانات',
        version_id: 'v2',
        reviewer_user_id: 'reviewer2',
        reviewer_name: 'م. فاطمة الزهراء',
        submitter_user_id: 'submitter2',
        submitter_name: 'أحمد محمد حسن',
        title: 'مراجعة مخطط قاعدة البيانات - الإصدار 2',
        description: 'مراجعة فنية لمخطط قاعدة البيانات والعلاقات',
        priority: 'medium',
        submitted_at: '2024-01-19T09:00:00Z',
        review_due_date: '2024-01-22T17:00:00Z',
        reviewed_at: '2024-01-21T16:00:00Z',
        status: 'changes_requested',
        decision: 'changes_requested',
        decision_notes: 'يحتاج إلى إضافة فهارس للأداء وتحسين بعض العلاقات.',
        created_at: '2024-01-19T09:00:00Z'
      },
      {
        id: '3',
        deliverable_id: '33333333-3333-3333-3333-333333333333',
        deliverable_name: 'دليل المستخدم',
        reviewer_user_id: 'reviewer1',
        reviewer_name: 'د. محمد العلي',
        submitter_user_id: 'submitter1',
        submitter_name: 'سارة أحمد علي',
        title: 'مراجعة دليل المستخدم',
        description: 'مراجعة محتوى ودقة دليل المستخدم',
        priority: 'medium',
        submitted_at: '2024-01-21T11:00:00Z',
        review_due_date: '2024-01-26T17:00:00Z',
        status: 'in_review',
        created_at: '2024-01-21T11:00:00Z'
      }
    ];
    
    // فلترة حسب المخرج إذا تم تحديده
    const filteredReviews = deliverableId 
      ? mockReviews.filter(r => r.deliverable_id === deliverableId)
      : mockReviews;
    
    setReviews(filteredReviews);
    setLoading(false);
  };

  const loadComments = async (reviewId: string) => {
    // محاكاة تحميل التعليقات
    const mockComments: ReviewComment[] = [
      {
        id: '1',
        review_id: reviewId,
        author_user_id: 'reviewer1',
        author_name: 'د. محمد العلي',
        comment_type: 'approval_note',
        content: 'التصميم يتبع أفضل الممارسات في تجربة المستخدم. الألوان متناسقة والتخطيط واضح.',
        is_internal: false,
        created_at: '2024-01-22T14:00:00Z'
      },
      {
        id: '2',
        review_id: reviewId,
        author_user_id: 'reviewer2',
        author_name: 'م. فاطمة الزهراء',
        comment_type: 'change_request',
        content: 'يرجى إضافة فهرس على حقل created_at في جدول المشاريع لتحسين الأداء.',
        is_internal: false,
        created_at: '2024-01-21T15:30:00Z'
      },
      {
        id: '3',
        review_id: reviewId,
        author_user_id: 'submitter2',
        author_name: 'أحمد محمد حسن',
        comment_type: 'response',
        content: 'شكراً للملاحظات. سأقوم بإضافة الفهارس المطلوبة وتحديث العلاقات في الإصدار القادم.',
        is_internal: false,
        created_at: '2024-01-21T16:45:00Z'
      }
    ];
    
    setComments(mockComments);
  };

  const handleCreateReview = async () => {
    if (!newReview.title.trim() || !newReview.reviewer_user_id) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان المراجعة واختيار المراجع",
        variant: "destructive"
      });
      return;
    }

    const reviewData: DeliverableReview = {
      id: Date.now().toString(),
      deliverable_id: deliverableId || 'default',
      deliverable_name: 'مخرج جديد',
      reviewer_user_id: newReview.reviewer_user_id,
      reviewer_name: 'مراجع محدد',
      submitter_user_id: 'current_user',
      submitter_name: 'المستخدم الحالي',
      title: newReview.title,
      description: newReview.description,
      priority: newReview.priority,
      submitted_at: new Date().toISOString(),
      review_due_date: newReview.review_due_date ? new Date(newReview.review_due_date).toISOString() : undefined,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setReviews([reviewData, ...reviews]);
    setShowCreateDialog(false);
    setNewReview({
      title: '',
      description: '',
      priority: 'medium',
      reviewer_user_id: '',
      review_due_date: ''
    });

    toast({
      title: "تم إنشاء المراجعة",
      description: "تم إنشاء طلب المراجعة بنجاح",
    });
  };

  const handleReviewDecision = async (reviewId: string, decision: 'approved' | 'changes_requested' | 'rejected', notes?: string) => {
    const updatedReviews = reviews.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            status: decision as any,
            decision,
            decision_notes: notes,
            reviewed_at: new Date().toISOString()
          }
        : review
    );
    
    setReviews(updatedReviews);
    
    if (selectedReview?.id === reviewId) {
      const updatedReview = updatedReviews.find(r => r.id === reviewId);
      if (updatedReview) {
        setSelectedReview(updatedReview);
      }
    }

    const decisionText = {
      approved: 'معتمد',
      changes_requested: 'يتطلب تعديلات',
      rejected: 'مرفوض'
    }[decision];

    toast({
      title: "تم اتخاذ القرار",
      description: `تم تحديث حالة المراجعة إلى: ${decisionText}`,
    });
  };

  const handleAddComment = async () => {
    if (!newComment.content.trim() || !selectedReview) {
      return;
    }

    const commentData: ReviewComment = {
      id: Date.now().toString(),
      review_id: selectedReview.id,
      author_user_id: 'current_user',
      author_name: 'المستخدم الحالي',
      comment_type: newComment.comment_type,
      content: newComment.content,
      is_internal: newComment.is_internal,
      created_at: new Date().toISOString()
    };

    setComments([...comments, commentData]);
    setNewComment({
      content: '',
      comment_type: 'note',
      is_internal: false
    });

    toast({
      title: "تم إضافة التعليق",
      description: "تم إضافة التعليق بنجاح",
    });
  };

  const handleViewReview = (review: DeliverableReview) => {
    setSelectedReview(review);
    loadComments(review.id);
    setShowReviewDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      changes_requested: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      in_review: <Eye className="h-4 w-4" />,
      approved: <CheckCircle2 className="h-4 w-4" />,
      changes_requested: <AlertTriangle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const filteredReviews = statusFilter === 'all' 
    ? reviews 
    : reviews.filter(review => review.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المراجعات</h2>
          <p className="text-gray-600 mt-1">
            {deliverableId ? 'مراجعات المخرج المحدد' : 'جميع مراجعات المشروع'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إنشاء مراجعة جديدة
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <Label>فلترة حسب الحالة:</Label>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">في الانتظار</SelectItem>
            <SelectItem value="in_review">قيد المراجعة</SelectItem>
            <SelectItem value="approved">معتمد</SelectItem>
            <SelectItem value="changes_requested">يتطلب تعديلات</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">جاري تحميل المراجعات...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراجعات</h3>
            <p className="text-gray-600 mb-4">ابدأ بإنشاء مراجعة جديدة</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء مراجعة جديدة
            </Button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                      <Badge className={cn("flex items-center gap-1", getStatusColor(review.status))}>
                        {getStatusIcon(review.status)}
                        {review.status === 'pending' && 'في الانتظار'}
                        {review.status === 'in_review' && 'قيد المراجعة'}
                        {review.status === 'approved' && 'معتمد'}
                        {review.status === 'changes_requested' && 'يتطلب تعديلات'}
                        {review.status === 'rejected' && 'مرفوض'}
                      </Badge>
                      <Badge className={getPriorityColor(review.priority)}>
                        {review.priority === 'low' && 'منخفضة'}
                        {review.priority === 'medium' && 'متوسطة'}
                        {review.priority === 'high' && 'عالية'}
                        {review.priority === 'urgent' && 'عاجلة'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{review.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>المراجع: {review.reviewer_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>تاريخ التسليم: {formatDate(review.submitted_at)}</span>
                      </div>
                      {review.review_due_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>موعد المراجعة: {formatDate(review.review_due_date)}</span>
                        </div>
                      )}
                    </div>
                    
                    {review.decision_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>ملاحظات القرار:</strong> {review.decision_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReview(review)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      عرض التفاصيل
                    </Button>
                    
                    {review.status === 'pending' || review.status === 'in_review' ? (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewDecision(review.id, 'approved', 'معتمد')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewDecision(review.id, 'changes_requested', 'يتطلب تعديلات')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewDecision(review.id, 'rejected', 'مرفوض')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Review Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء مراجعة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="review-title">عنوان المراجعة *</Label>
              <Input
                id="review-title"
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                placeholder="مثال: مراجعة تصميم واجهة المستخدم"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review-description">وصف المراجعة</Label>
              <Textarea
                id="review-description"
                value={newReview.description}
                onChange={(e) => setNewReview({...newReview, description: e.target.value})}
                placeholder="وصف تفصيلي لما يجب مراجعته..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select value={newReview.priority} onValueChange={(value: any) => setNewReview({...newReview, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="due-date">موعد المراجعة</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={newReview.review_due_date}
                  onChange={(e) => setNewReview({...newReview, review_due_date: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>المراجع *</Label>
              <Select value={newReview.reviewer_user_id} onValueChange={(value) => setNewReview({...newReview, reviewer_user_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المراجع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewer1">د. محمد العلي</SelectItem>
                  <SelectItem value="reviewer2">م. فاطمة الزهراء</SelectItem>
                  <SelectItem value="reviewer3">أ. خالد أحمد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateReview}>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء المراجعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Details Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedReview?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              {/* Review Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">الحالة</Label>
                  <Badge className={cn("mt-1 flex items-center gap-1 w-fit", getStatusColor(selectedReview.status))}>
                    {getStatusIcon(selectedReview.status)}
                    {selectedReview.status === 'pending' && 'في الانتظار'}
                    {selectedReview.status === 'in_review' && 'قيد المراجعة'}
                    {selectedReview.status === 'approved' && 'معتمد'}
                    {selectedReview.status === 'changes_requested' && 'يتطلب تعديلات'}
                    {selectedReview.status === 'rejected' && 'مرفوض'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">الأولوية</Label>
                  <Badge className={cn("mt-1 w-fit", getPriorityColor(selectedReview.priority))}>
                    {selectedReview.priority === 'low' && 'منخفضة'}
                    {selectedReview.priority === 'medium' && 'متوسطة'}
                    {selectedReview.priority === 'high' && 'عالية'}
                    {selectedReview.priority === 'urgent' && 'عاجلة'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">المراجع</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedReview.reviewer_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">المرسل</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedReview.submitter_name}</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  التعليقات والملاحظات
                </h3>
                
                <ScrollArea className="h-64 border rounded-lg p-4">
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">لا توجد تعليقات بعد</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{comment.author_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.comment_type === 'note' && 'ملاحظة'}
                              {comment.comment_type === 'change_request' && 'طلب تعديل'}
                              {comment.comment_type === 'response' && 'رد'}
                              {comment.comment_type === 'approval_note' && 'ملاحظة اعتماد'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Add Comment */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex gap-2">
                    <Select value={newComment.comment_type} onValueChange={(value: any) => setNewComment({...newComment, comment_type: value})}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">ملاحظة</SelectItem>
                        <SelectItem value="change_request">طلب تعديل</SelectItem>
                        <SelectItem value="response">رد</SelectItem>
                        <SelectItem value="approval_note">ملاحظة اعتماد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Textarea
                      value={newComment.content}
                      onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                      placeholder="اكتب تعليقك هنا..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.content.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Decision Actions */}
              {(selectedReview.status === 'pending' || selectedReview.status === 'in_review') && (
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    onClick={() => handleReviewDecision(selectedReview.id, 'approved', 'معتمد')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    اعتماد
                  </Button>
                  <Button
                    onClick={() => handleReviewDecision(selectedReview.id, 'changes_requested', 'يتطلب تعديلات')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    طلب تعديلات
                  </Button>
                  <Button
                    onClick={() => handleReviewDecision(selectedReview.id, 'rejected', 'مرفوض')}
                    variant="destructive"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliverableReviewManager;