import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, Calendar, Weight, AlertCircle } from "lucide-react";

interface DeliverableFormData {
  name: string;
  description: string;
  type: string;
  priority: string;
  weight: number;
  dueDate: string;
  estimatedHours: number;
  tags: string[];
}

const CreateDeliverableDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<DeliverableFormData>({
    name: '',
    description: '',
    type: '',
    priority: 'متوسط',
    weight: 1,
    dueDate: '',
    estimatedHours: 0,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const deliverableTypes = [
    { value: 'document', label: 'وثيقة' },
    { value: 'report', label: 'تقرير' },
    { value: 'presentation', label: 'عرض تقديمي' },
    { value: 'software', label: 'برمجيات' },
    { value: 'design', label: 'تصميم' },
    { value: 'analysis', label: 'تحليل' },
    { value: 'prototype', label: 'نموذج أولي' },
    { value: 'other', label: 'أخرى' }
  ];

  const priorityLevels = [
    { value: 'منخفض', label: 'منخفض', color: 'bg-green-100 text-green-800' },
    { value: 'متوسط', label: 'متوسط', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'عالي', label: 'عالي', color: 'bg-orange-100 text-orange-800' },
    { value: 'حرج', label: 'حرج', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (field: keyof DeliverableFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى إدخال اسم المخرج",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.type) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى اختيار نوع المخرج",
        variant: "destructive"
      });
      return false;
    }

    if (formData.weight < 0.1 || formData.weight > 10) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب أن يكون الوزن بين 0.1 و 10",
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم إنشاء المخرج بنجاح",
        description: `تم إنشاء المخرج "${formData.name}" بوزن ${formData.weight}`,
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: '',
        priority: 'متوسط',
        weight: 1,
        dueDate: '',
        estimatedHours: 0,
        tags: []
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المخرج",
        description: "حدث خطأ أثناء إنشاء المخرج. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      priority: 'متوسط',
      weight: 1,
      dueDate: '',
      estimatedHours: 0,
      tags: []
    });
    setNewTag('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إنشاء مخرج جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5" />
            إنشاء مخرج جديد
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    اسم المخرج *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل اسم المخرج"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    الوصف
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="وصف تفصيلي للمخرج وأهدافه"
                    className="mt-1 min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium">
                      نوع المخرج *
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر نوع المخرج" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliverableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight and Priority System */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Weight className="h-4 w-4" />
                <h3 className="font-medium">نظام الأوزان والأولوية</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="weight" className="text-sm font-medium">
                    الوزن (0.1 - 10) *
                  </Label>
                  <div className="mt-1 space-y-2">
                    <Input
                      id="weight"
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 1)}
                      placeholder="1.0"
                    />
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      الوزن يحدد أهمية المخرج في حساب التقدم الإجمالي
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">
                    الأولوية
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color} variant="secondary">
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline and Estimation */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">الجدولة والتقدير</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    تاريخ الاستحقاق *
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedHours" className="text-sm font-medium">
                    الساعات المقدرة
                  </Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">العلامات</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="أضف علامة"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="sm">
                      إضافة
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المخرج'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDeliverableDialog;