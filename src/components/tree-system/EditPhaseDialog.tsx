import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date | null;
  endDate: Date | null;
  weight: number;
  progress: number;
  budget: number;
  actualCost: number;
  assignedTo: string;
  dependencies: string[];
  tags: string[];
}

interface EditPhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: Phase | null;
  onSave: (phase: Phase) => void;
}

const EditPhaseDialog: React.FC<EditPhaseDialogProps> = ({
  open,
  onOpenChange,
  phase,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Phase>({
    id: '',
    name: '',
    description: '',
    status: 'planned',
    priority: 'medium',
    startDate: null,
    endDate: null,
    weight: 0,
    progress: 0,
    budget: 0,
    actualCost: 0,
    assignedTo: '',
    dependencies: [],
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (phase) {
      setFormData(phase);
      setErrors({});
    }
  }, [phase]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المرحلة مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف المرحلة مطلوب';
    }

    if (formData.weight < 0 || formData.weight > 100) {
      newErrors.weight = 'الوزن يجب أن يكون بين 0 و 100';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'نسبة التقدم يجب أن تكون بين 0 و 100';
    }

    if (formData.budget < 0) {
      newErrors.budget = 'الميزانية يجب أن تكون أكبر من أو تساوي صفر';
    }

    if (formData.actualCost < 0) {
      newErrors.actualCost = 'التكلفة الفعلية يجب أن تكون أكبر من أو تساوي صفر';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء المذكورة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(formData);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المرحلة بنجاح"
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث المرحلة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Phase, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'on-hold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">
            تحرير المرحلة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">المعلومات الأساسية</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-right block">
                  اسم المرحلة *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="أدخل اسم المرحلة"
                  className={cn("text-right", errors.name && "border-red-500")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 text-right">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-right block">
                  وصف المرحلة *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="أدخل وصف المرحلة"
                  className={cn("text-right min-h-[100px]", errors.description && "border-red-500")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 text-right">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">الحالة والأولوية</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-right block">حالة المرحلة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">
                      <span className="text-gray-600">مخططة</span>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <span className="text-blue-600">قيد التنفيذ</span>
                    </SelectItem>
                    <SelectItem value="completed">
                      <span className="text-green-600">مكتملة</span>
                    </SelectItem>
                    <SelectItem value="on-hold">
                      <span className="text-yellow-600">معلقة</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">أولوية المرحلة</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="text-green-600">منخفضة</span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="text-yellow-600">متوسطة</span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="text-orange-600">عالية</span>
                    </SelectItem>
                    <SelectItem value="critical">
                      <span className="text-red-600">حرجة</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">التواريخ</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-right block">تاريخ البداية</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
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
                      selected={formData.startDate || undefined}
                      onSelect={(date) => handleInputChange('startDate', date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">تاريخ الانتهاء</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !formData.endDate && "text-muted-foreground",
                        errors.endDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP", { locale: ar })
                      ) : (
                        "اختر تاريخ الانتهاء"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate || undefined}
                      onSelect={(date) => handleInputChange('endDate', date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-sm text-red-500 text-right">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress and Weight */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">التقدم والوزن</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-right block">
                  وزن المرحلة (%)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                  placeholder="0"
                  className={cn("text-right", errors.weight && "border-red-500")}
                />
                {errors.weight && (
                  <p className="text-sm text-red-500 text-right">{errors.weight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress" className="text-right block">
                  نسبة التقدم (%)
                </Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => handleInputChange('progress', Number(e.target.value))}
                  placeholder="0"
                  className={cn("text-right", errors.progress && "border-red-500")}
                />
                {errors.progress && (
                  <p className="text-sm text-red-500 text-right">{errors.progress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">الميزانية</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-right block">
                  الميزانية المخططة
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                  placeholder="0"
                  className={cn("text-right", errors.budget && "border-red-500")}
                />
                {errors.budget && (
                  <p className="text-sm text-red-500 text-right">{errors.budget}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualCost" className="text-right block">
                  التكلفة الفعلية
                </Label>
                <Input
                  id="actualCost"
                  type="number"
                  min="0"
                  value={formData.actualCost}
                  onChange={(e) => handleInputChange('actualCost', Number(e.target.value))}
                  placeholder="0"
                  className={cn("text-right", errors.actualCost && "border-red-500")}
                />
                {errors.actualCost && (
                  <p className="text-sm text-red-500 text-right">{errors.actualCost}</p>
                )}
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">التكليف</h3>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo" className="text-right block">
                المكلف بالمرحلة
              </Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="اسم المكلف أو الفريق"
                className="text-right"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPhaseDialog;