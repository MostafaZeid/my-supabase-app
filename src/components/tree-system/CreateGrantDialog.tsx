import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, Users, Shield, Calendar, FileText } from "lucide-react";

interface GrantFormData {
  clientName: string;
  clientEmail: string;
  accessLevel: 'read' | 'write' | 'admin';
  grantedSections: string[];
  expiryDate: string;
  description: string;
}

interface CreateGrantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GrantFormData) => void;
}

const CreateGrantDialog: React.FC<CreateGrantDialogProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<GrantFormData>({
    clientName: '',
    clientEmail: '',
    accessLevel: 'read',
    grantedSections: [],
    expiryDate: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<GrantFormData>>({});

  const accessLevels = [
    { value: 'read', label: 'قراءة فقط', icon: FileText },
    { value: 'write', label: 'قراءة وكتابة', icon: Users },
    { value: 'admin', label: 'إدارة كاملة', icon: Shield }
  ];

  const availableSections = [
    'المراحل والأنشطة',
    'المخرجات والملفات',
    'التكليفات والمهام',
    'التقارير والإحصائيات',
    'إعدادات المشروع'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<GrantFormData> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'اسم العميل مطلوب';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'البريد الإلكتروني غير صحيح';
    }

    if (formData.grantedSections.length === 0) {
      newErrors.grantedSections = 'يجب اختيار قسم واحد على الأقل';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'تاريخ انتهاء الصلاحية مطلوب';
    } else {
      const selectedDate = new Date(formData.expiryDate);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.expiryDate = 'تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      toast({
        title: "تم إنشاء المنحة بنجاح",
        description: `تم منح صلاحيات الوصول للعميل ${formData.clientName}`,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      accessLevel: 'read',
      grantedSections: [],
      expiryDate: '',
      description: ''
    });
    setErrors({});
    onClose();
  };

  const handleSectionToggle = (section: string) => {
    setFormData(prev => ({
      ...prev,
      grantedSections: prev.grantedSections.includes(section)
        ? prev.grantedSections.filter(s => s !== section)
        : [...prev.grantedSections, section]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm md:max-w-lg lg:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">إنشاء منحة وصول جديدة</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                معلومات العميل الفرعي
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم العميل الفرعي"
                />
                {errors.clientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="client@example.com"
                />
                {errors.clientEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>
                )}
              </div>
            </div>

            {/* Access Level */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                مستوى الصلاحية
              </h3>
              
              <div className="grid gap-3">
                {accessLevels.map((level) => {
                  const IconComponent = level.icon;
                  return (
                    <label
                      key={level.value}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.accessLevel === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accessLevel"
                        value={level.value}
                        checked={formData.accessLevel === level.value}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          accessLevel: e.target.value as 'read' | 'write' | 'admin'
                        }))}
                        className="sr-only"
                      />
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">{level.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Granted Sections */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
                الأقسام المسموح بالوصول إليها *
              </h3>
              
              <div className="space-y-2">
                {availableSections.map((section) => (
                  <label
                    key={section}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.grantedSections.includes(section)}
                      onChange={() => handleSectionToggle(section)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{section}</span>
                  </label>
                ))}
              </div>
              {errors.grantedSections && (
                <p className="text-red-500 text-xs">{errors.grantedSections}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 ml-1" />
                تاريخ انتهاء الصلاحية *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المنحة (اختياري)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="أضف وصفاً للمنحة أو ملاحظات إضافية..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                إنشاء المنحة
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGrantDialog;