import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  weight: number;
  startDate: Date;
  endDate: Date;
  assignedTo: string;
  phaseId: string;
  activityId?: string;
  progress: number;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  dependencies: string[];
  files: any[];
  comments: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface EditDeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliverable: Deliverable | null;
  onSave: (deliverable: Deliverable) => void;
  phases: any[];
  activities: any[];
  users: any[];
}

const EditDeliverableDialog: React.FC<EditDeliverableDialogProps> = ({
  open,
  onOpenChange,
  deliverable,
  onSave,
  phases = [],
  activities = [],
  users = []
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Deliverable>>({
    name: '',
    description: '',
    type: '',
    priority: 'medium',
    status: 'pending',
    weight: 1,
    startDate: new Date(),
    endDate: new Date(),
    assignedTo: '',
    phaseId: '',
    activityId: '',
    progress: 0,
    estimatedHours: 0,
    actualHours: 0,
    tags: [],
    dependencies: []
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (deliverable && open) {
      setFormData({
        ...deliverable,
        startDate: new Date(deliverable.startDate),
        endDate: new Date(deliverable.endDate)
      });
      setErrors({});
    }
  }, [deliverable, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'اسم المخرج مطلوب';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'وصف المخرج مطلوب';
    }

    if (!formData.type?.trim()) {
      newErrors.type = 'نوع المخرج مطلوب';
    }

    if (!formData.phaseId) {
      newErrors.phaseId = 'المرحلة مطلوبة';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'المسؤول مطلوب';
    }

    if (formData.weight === undefined || formData.weight < 1 || formData.weight > 100) {
      newErrors.weight = 'الوزن يجب أن يكون بين 1 و 100';
    }

    if (formData.progress === undefined || formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'نسبة الإنجاز يجب أن تكون بين 0 و 100';
    }

    if (formData.estimatedHours !== undefined && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'الساعات المقدرة لا يمكن أن تكون سالبة';
    }

    if (formData.actualHours !== undefined && formData.actualHours < 0) {
      newErrors.actualHours = 'الساعات الفعلية لا يمكن أن تكون سالبة';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !deliverable) return;

    const updatedDeliverable: Deliverable = {
      ...deliverable,
      ...formData,
      updatedAt: new Date()
    } as Deliverable;

    onSave(updatedDeliverable);
    toast({
      title: "تم التحديث بنجاح",
      description: "تم تحديث المخرج بنجاح",
    });
    onOpenChange(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'review': return 'text-purple-600 bg-purple-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!deliverable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">
            تحرير المخرج
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">المعلومات الأساسية</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-right block">اسم المخرج *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم المخرج"
                  className={cn("text-right", errors.name && "border-red-500")}
                />
                {errors.name && <p className="text-red-500 text-sm text-right">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-right block">الوصف *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="أدخل وصف المخرج"
                  className={cn("text-right min-h-[100px]", errors.description && "border-red-500")}
                />
                {errors.description && <p className="text-red-500 text-sm text-right">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-right block">نوع المخرج *</Label>
                <Input
                  id="type"
                  value={formData.type || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="أدخل نوع المخرج"
                  className={cn("text-right", errors.type && "border-red-500")}
                />
                {errors.type && <p className="text-red-500 text-sm text-right">{errors.type}</p>}
              </div>
            </div>
          </div>

          {/* Assignment and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">التخصيص والأولوية</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-right block">المرحلة *</Label>
                <Select
                  value={formData.phaseId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, phaseId: value }))}
                >
                  <SelectTrigger className={cn("text-right", errors.phaseId && "border-red-500")}>
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.phaseId && <p className="text-red-500 text-sm text-right">{errors.phaseId}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-right block">النشاط (اختياري)</Label>
                <Select
                  value={formData.activityId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, activityId: value }))}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر النشاط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون نشاط</SelectItem>
                    {activities
                      .filter(activity => activity.phaseId === formData.phaseId)
                      .map((activity) => (
                        <SelectItem key={activity.id} value={activity.id}>
                          {activity.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">المسؤول *</Label>
                <Select
                  value={formData.assignedTo || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger className={cn("text-right", errors.assignedTo && "border-red-500")}>
                    <SelectValue placeholder="اختر المسؤول" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedTo && <p className="text-red-500 text-sm text-right">{errors.assignedTo}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-right block">الأولوية</Label>
                  <Select
                    value={formData.priority || 'medium'}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getPriorityColor('low'))}>
                          منخفضة
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getPriorityColor('medium'))}>
                          متوسطة
                        </span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getPriorityColor('high'))}>
                          عالية
                        </span>
                      </SelectItem>
                      <SelectItem value="critical">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getPriorityColor('critical'))}>
                          حرجة
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-right block">الحالة</Label>
                  <Select
                    value={formData.status || 'pending'}
                    onValueChange={(value: 'pending' | 'in-progress' | 'review' | 'completed') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor('pending'))}>
                          في الانتظار
                        </span>
                      </SelectItem>
                      <SelectItem value="in-progress">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor('in-progress'))}>
                          قيد التنفيذ
                        </span>
                      </SelectItem>
                      <SelectItem value="review">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor('review'))}>
                          قيد المراجعة
                        </span>
                      </SelectItem>
                      <SelectItem value="completed">
                        <span className={cn("px-2 py-1 rounded-full text-xs", getStatusColor('completed'))}>
                          مكتمل
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Progress and Weight */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">التقدم والوزن</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-right block">الوزن (1-100) *</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                  className={cn("text-right", errors.weight && "border-red-500")}
                />
                {errors.weight && <p className="text-red-500 text-sm text-right">{errors.weight}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress" className="text-right block">نسبة الإنجاز (0-100) *</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  className={cn("text-right", errors.progress && "border-red-500")}
                />
                {errors.progress && <p className="text-red-500 text-sm text-right">{errors.progress}</p>}
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">تتبع الوقت</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours" className="text-right block">الساعات المقدرة</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  className={cn("text-right", errors.estimatedHours && "border-red-500")}
                />
                {errors.estimatedHours && <p className="text-red-500 text-sm text-right">{errors.estimatedHours}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHours" className="text-right block">الساعات الفعلية</Label>
                <Input
                  id="actualHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.actualHours || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualHours: parseFloat(e.target.value) || 0 }))}
                  className={cn("text-right", errors.actualHours && "border-red-500")}
                />
                {errors.actualHours && <p className="text-red-500 text-sm text-right">{errors.actualHours}</p>}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">التواريخ</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-right block">تاريخ البداية</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
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
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, startDate: date || new Date() }));
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-right block">تاريخ الانتهاء</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
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
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, endDate: date || new Date() }));
                        setEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && <p className="text-red-500 text-sm text-right">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">العلامات</h3>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddTag}
                  size="sm"
                  disabled={!tagInput.trim()}
                >
                  إضافة
                </Button>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="أدخل علامة جديدة"
                  className="text-right flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
              </div>
              
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="ml-2 h-4 w-4" />
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeliverableDialog;