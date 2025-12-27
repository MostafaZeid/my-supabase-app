import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  name: string;
  description: string;
  phaseId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateActivityDialogProps {
  phaseId?: string;
  onActivityCreated?: (activity: Activity) => void;
}

const CreateActivityDialog: React.FC<CreateActivityDialogProps> = ({
  phaseId,
  onActivityCreated
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phaseId: phaseId || '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: 'pending' as Activity['status'],
    priority: 'medium' as Activity['priority'],
    assignedTo: '',
    estimatedHours: 0,
    tags: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "اسم النشاط مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phaseId) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب تحديد المرحلة",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.startDate) {
      toast({
        title: "خطأ في التحقق",
        description: "تاريخ البداية مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.endDate) {
      toast({
        title: "خطأ في التحقق",
        description: "تاريخ النهاية مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (formData.endDate <= formData.startDate) {
      toast({
        title: "خطأ في التحقق",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive"
      });
      return false;
    }

    if (formData.estimatedHours <= 0) {
      toast({
        title: "خطأ في التحقق",
        description: "الساعات المقدرة يجب أن تكون أكبر من صفر",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const newActivity: Activity = {
        id: `activity_${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        phaseId: formData.phaseId,
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo.trim(),
        estimatedHours: formData.estimatedHours,
        actualHours: 0,
        progress: 0,
        dependencies: [],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onActivityCreated?.(newActivity);

      toast({
        title: "تم إنشاء النشاط",
        description: `تم إنشاء النشاط "${newActivity.name}" بنجاح`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        phaseId: phaseId || '',
        startDate: undefined,
        endDate: undefined,
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        estimatedHours: 0,
        tags: ''
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء النشاط",
        description: "حدث خطأ أثناء إنشاء النشاط. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phaseId: phaseId || '',
      startDate: undefined,
      endDate: undefined,
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      estimatedHours: 0,
      tags: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة نشاط
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إنشاء نشاط جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-name" className="text-sm font-medium">
                اسم النشاط *
              </Label>
              <Input
                id="activity-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="أدخل اسم النشاط"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-description" className="text-sm font-medium">
                وصف النشاط
              </Label>
              <Textarea
                id="activity-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="أدخل وصف مفصل للنشاط"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Phase Selection */}
          {!phaseId && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">المرحلة *</Label>
              <Select
                value={formData.phaseId}
                onValueChange={(value) => handleInputChange('phaseId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المرحلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phase1">المرحلة الأولى</SelectItem>
                  <SelectItem value="phase2">المرحلة الثانية</SelectItem>
                  <SelectItem value="phase3">المرحلة الثالثة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">تاريخ البداية *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: ar })
                    ) : (
                      "اختر تاريخ البداية"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">تاريخ النهاية *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: ar })
                    ) : (
                      "اختر تاريخ النهاية"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="on-hold">معلق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">الأولوية</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment and Hours */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned-to" className="text-sm font-medium">
                المسؤول عن التنفيذ
              </Label>
              <Input
                id="assigned-to"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="اسم المسؤول أو البريد الإلكتروني"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-hours" className="text-sm font-medium">
                الساعات المقدرة *
              </Label>
              <Input
                id="estimated-hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                placeholder="عدد الساعات المقدرة"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              العلامات
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="أدخل العلامات مفصولة بفواصل"
            />
            <p className="text-xs text-muted-foreground">
              استخدم الفواصل للفصل بين العلامات المختلفة
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء النشاط"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateActivityDialog;