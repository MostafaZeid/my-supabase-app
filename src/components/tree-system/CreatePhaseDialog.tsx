import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
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

interface PhaseFormData {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  priority: 'منخفضة' | 'متوسطة' | 'عالية' | 'حرجة';
  status: 'مخطط' | 'قيد التنفيذ' | 'مكتمل' | 'متأخر' | 'معلق';
  weight: number;
  budget: number;
}

const CreatePhaseDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<PhaseFormData>({
    name: '',
    description: '',
    startDate: undefined,
    endDate: undefined,
    priority: 'متوسطة',
    status: 'مخطط',
    weight: 0,
    budget: 0
  });

  const [errors, setErrors] = useState<Partial<PhaseFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PhaseFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المرحلة مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف المرحلة مطلوب';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    if (formData.weight < 0 || formData.weight > 100) {
      newErrors.weight = 'الوزن يجب أن يكون بين 0 و 100';
    }

    if (formData.budget < 0) {
      newErrors.budget = 'الميزانية يجب أن تكون أكبر من أو تساوي صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم إنشاء المرحلة بنجاح",
        description: `تم إنشاء المرحلة "${formData.name}" بنجاح`,
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        startDate: undefined,
        endDate: undefined,
        priority: 'متوسطة',
        status: 'مخطط',
        weight: 0,
        budget: 0
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المرحلة",
        description: "حدث خطأ أثناء إنشاء المرحلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PhaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مرحلة جديدة
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إنشاء مرحلة جديدة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">المعلومات الأساسية</h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">اسم المرحلة *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="أدخل اسم المرحلة"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">وصف المرحلة *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="أدخل وصف تفصيلي للمرحلة"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">التواريخ</h3>
            
            <div className="grid gap-4">
              <div>
                <Label>تاريخ البداية *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-right ${errors.startDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر تاريخ البداية</span>
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
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <Label>تاريخ النهاية *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-right ${errors.endDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر تاريخ النهاية</span>
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
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">الحالة والأولوية</h3>
            
            <div className="grid gap-4">
              <div>
                <Label>الأولوية</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="منخفضة">منخفضة</SelectItem>
                    <SelectItem value="متوسطة">متوسطة</SelectItem>
                    <SelectItem value="عالية">عالية</SelectItem>
                    <SelectItem value="حرجة">حرجة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مخطط">مخطط</SelectItem>
                    <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                    <SelectItem value="مكتمل">مكتمل</SelectItem>
                    <SelectItem value="متأخر">متأخر</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Weight and Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">الوزن والميزانية</h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="weight">الوزن (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                  placeholder="0"
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && (
                  <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="budget">الميزانية (ريال)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                  placeholder="0.00"
                  className={errors.budget ? 'border-red-500' : ''}
                />
                {errors.budget && (
                  <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء المرحلة'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePhaseDialog;