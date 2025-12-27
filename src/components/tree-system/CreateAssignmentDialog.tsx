import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, User, Clock, FileText, Target } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AssignmentFormData {
  title: string;
  description: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date | undefined;
  estimatedHours: string;
  category: string;
  deliverableId?: string;
  phaseId?: string;
}

const CreateAssignmentDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    dueDate: undefined,
    estimatedHours: '',
    category: '',
    deliverableId: '',
    phaseId: ''
  });

  // Mock data for dropdowns
  const consultants = [
    { id: '1', name: 'أحمد محمد', role: 'مستشار أول' },
    { id: '2', name: 'فاطمة علي', role: 'مستشار تقني' },
    { id: '3', name: 'محمد سالم', role: 'مستشار مالي' },
    { id: '4', name: 'نورا أحمد', role: 'مستشار قانوني' }
  ];

  const categories = [
    'تحليل وتصميم',
    'تطوير وبرمجة',
    'اختبار وجودة',
    'توثيق ومراجعة',
    'إدارة ومتابعة',
    'استشارة وتوجيه'
  ];

  const phases = [
    { id: '1', name: 'مرحلة التخطيط' },
    { id: '2', name: 'مرحلة التحليل' },
    { id: '3', name: 'مرحلة التطوير' },
    { id: '4', name: 'مرحلة الاختبار' }
  ];

  const deliverables = [
    { id: '1', name: 'تقرير التحليل الأولي', phaseId: '2' },
    { id: '2', name: 'وثيقة المتطلبات', phaseId: '1' },
    { id: '3', name: 'نموذج أولي للنظام', phaseId: '3' },
    { id: '4', name: 'تقرير الاختبار', phaseId: '4' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل جداً';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'متوسطة';
    }
  };

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إدخال عنوان التكليف",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.assigneeId) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى اختيار المستشار المكلف",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.dueDate) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى تحديد تاريخ الاستحقاق",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى اختيار فئة التكليف",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const assignedConsultant = consultants.find(c => c.id === formData.assigneeId);
      
      toast({
        title: "تم إنشاء التكليف بنجاح",
        description: `تم تكليف ${assignedConsultant?.name} بـ "${formData.title}"`,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'medium',
        dueDate: undefined,
        estimatedHours: '',
        category: '',
        deliverableId: '',
        phaseId: ''
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء التكليف",
        description: "حدث خطأ أثناء إنشاء التكليف. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigneeId: '',
      priority: 'medium',
      dueDate: undefined,
      estimatedHours: '',
      category: '',
      deliverableId: '',
      phaseId: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 ml-2" />
          إنشاء تكليف جديد
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right flex items-center justify-end">
            <User className="w-5 h-5 ml-2" />
            إنشاء تكليف جديد للمستشار
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Assignment Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-right block font-medium">
              عنوان التكليف *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="أدخل عنوان التكليف..."
              className="text-right"
              required
            />
          </div>

          {/* Assignment Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block font-medium">
              وصف التكليف
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="أدخل وصف مفصل للتكليف..."
              className="text-right min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Assignee and Priority Row */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                المستشار المكلف *
              </Label>
              <Select value={formData.assigneeId} onValueChange={(value) => handleInputChange('assigneeId', value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر المستشار..." />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-gray-500">{consultant.role}</span>
                        <span className="font-medium">{consultant.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-right block font-medium">
                مستوى الأولوية
              </Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(priority))}>
                        {getPriorityLabel(priority)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                تاريخ الاستحقاق *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-right font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP", { locale: ar })
                    ) : (
                      "اختر تاريخ الاستحقاق"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleInputChange('dueDate', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours" className="text-right block font-medium">
                الساعات المقدرة
              </Label>
              <div className="relative">
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                  placeholder="0"
                  className="text-right pl-12"
                  min="0"
                  step="0.5"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-right block font-medium">
              فئة التكليف *
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر فئة التكليف..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phase and Deliverable */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-right block font-medium">
                المرحلة المرتبطة
              </Label>
              <Select value={formData.phaseId} onValueChange={(value) => handleInputChange('phaseId', value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر المرحلة (اختياري)..." />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 ml-2 text-blue-500" />
                        {phase.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-right block font-medium">
                المخرج المرتبط
              </Label>
              <Select 
                value={formData.deliverableId} 
                onValueChange={(value) => handleInputChange('deliverableId', value)}
                disabled={!formData.phaseId}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر المخرج (اختياري)..." />
                </SelectTrigger>
                <SelectContent>
                  {deliverables
                    .filter(d => !formData.phaseId || d.phaseId === formData.phaseId)
                    .map((deliverable) => (
                    <SelectItem key={deliverable.id} value={deliverable.id}>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 ml-2 text-green-500" />
                        {deliverable.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              إعادة تعيين
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  جاري الإنشاء...
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء التكليف
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;