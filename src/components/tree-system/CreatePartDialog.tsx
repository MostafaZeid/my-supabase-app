import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package } from "lucide-react";

interface PartFormData {
  name: string;
  description: string;
  weight: number;
  priority: 'عالية' | 'متوسطة' | 'منخفضة';
  estimatedHours: number;
  deliverableId: string;
}

const CreatePartDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PartFormData>({
    name: '',
    description: '',
    weight: 0,
    priority: 'متوسطة',
    estimatedHours: 0,
    deliverableId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock deliverables data - in real app this would come from context/props
  const mockDeliverables = [
    { id: '1', name: 'تقرير المرحلة الأولى' },
    { id: '2', name: 'دراسة الجدوى' },
    { id: '3', name: 'التصميم الأولي' }
  ];

  const handleInputChange = (field: keyof PartFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم الجزء",
        variant: "destructive"
      });
      return;
    }

    if (!formData.deliverableId) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار المخرج المرتبط",
        variant: "destructive"
      });
      return;
    }

    if (formData.weight <= 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب أن يكون الوزن أكبر من صفر",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating part:', formData);
      
      toast({
        title: "تم إنشاء الجزء بنجاح",
        description: `تم إنشاء الجزء "${formData.name}" بنجاح`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        weight: 0,
        priority: 'متوسطة',
        estimatedHours: 0,
        deliverableId: ''
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الجزء",
        description: "حدث خطأ أثناء إنشاء الجزء. يرجى المحاولة مرة أخرى.",
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
      weight: 0,
      priority: 'متوسطة',
      estimatedHours: 0,
      deliverableId: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة جزء جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Package className="h-5 w-5" />
            إنشاء جزء جديد
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliverable">المخرج المرتبط *</Label>
            <Select
              value={formData.deliverableId}
              onValueChange={(value) => handleInputChange('deliverableId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المخرج" />
              </SelectTrigger>
              <SelectContent>
                {mockDeliverables.map((deliverable) => (
                  <SelectItem key={deliverable.id} value={deliverable.id}>
                    {deliverable.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">اسم الجزء *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="أدخل اسم الجزء"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="أدخل وصف الجزء"
              className="text-right min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">الوزن (%) *</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">الساعات المقدرة</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours || ''}
                onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">الأولوية</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'عالية' | 'متوسطة' | 'منخفضة') => handleInputChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="عالية">عالية</SelectItem>
                <SelectItem value="متوسطة">متوسطة</SelectItem>
                <SelectItem value="منخفضة">منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء الجزء"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePartDialog;