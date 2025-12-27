import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText,
  Calendar,
  Users,
  DollarSign,
  Target,
  Save,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSave: (projectData: any) => void;
}

export function EditProjectModal({ isOpen, onClose, project, onSave }: EditProjectModalProps) {
  const { dir } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    status: 'planning',
    priority: 'medium',
    progress: 0,
    startDate: '',
    endDate: '',
    budget: 0,
    spent: 0,
    teamLeader: '',
    teamLeaderEn: '',
    teamSize: 1,
    deliverables: {
      total: 0,
      completed: 0
    }
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        nameEn: project.nameEn || '',
        description: project.description || '',
        descriptionEn: project.descriptionEn || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        progress: project.progress || 0,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        budget: project.budget || 0,
        spent: project.spent || 0,
        teamLeader: project.teamLeader || '',
        teamLeaderEn: project.teamLeaderEn || '',
        teamSize: project.teamSize || 1,
        deliverables: {
          total: project.deliverables?.total || 0,
          completed: project.deliverables?.completed || 0
        }
      });
    }
  }, [project]);

  if (!project) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const updatedProject = {
      ...project,
      ...formData
    };
    onSave(updatedProject);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>{dir === 'rtl' ? 'تحرير بيانات المشروع' : 'Edit Project Information'}</div>
              <p className="text-sm font-normal text-muted-foreground">
                {dir === 'rtl' ? formData.name : formData.nameEn}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Basic Information */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'المعلومات الأساسية' : 'Basic Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'}</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'وصف المشروع (عربي)' : 'Project Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF] min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'وصف المشروع (إنجليزي)' : 'Project Description (English)'}</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF] min-h-[80px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'حالة المشروع' : 'Project Status'}</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="mt-1 border-2 focus:border-[#1B4FFF]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">{dir === 'rtl' ? 'تخطيط' : 'Planning'}</SelectItem>
                      <SelectItem value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</SelectItem>
                      <SelectItem value="onHold">{dir === 'rtl' ? 'معلق' : 'On Hold'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'أولوية المشروع' : 'Project Priority'}</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="mt-1 border-2 focus:border-[#1B4FFF]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{dir === 'rtl' ? 'منخفضة' : 'Low'}</SelectItem>
                      <SelectItem value="medium">{dir === 'rtl' ? 'متوسطة' : 'Medium'}</SelectItem>
                      <SelectItem value="high">{dir === 'rtl' ? 'عالية' : 'High'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'نسبة التقدم (%)' : 'Progress (%)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'الجدولة الزمنية' : 'Timeline'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'تاريخ البداية' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'معلومات الفريق' : 'Team Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'قائد الفريق (عربي)' : 'Team Leader (Arabic)'}</Label>
                  <Input
                    value={formData.teamLeader}
                    onChange={(e) => handleInputChange('teamLeader', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'قائد الفريق (إنجليزي)' : 'Team Leader (English)'}</Label>
                  <Input
                    value={formData.teamLeaderEn}
                    onChange={(e) => handleInputChange('teamLeaderEn', e.target.value)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'حجم الفريق' : 'Team Size'}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'المعلومات المالية' : 'Financial Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'الميزانية الإجمالية (ريال)' : 'Total Budget (SAR)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'المبلغ المصروف (ريال)' : 'Amount Spent (SAR)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    max={formData.budget}
                    value={formData.spent}
                    onChange={(e) => handleInputChange('spent', parseFloat(e.target.value) || 0)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1B4FFF]" />
                {dir === 'rtl' ? 'المخرجات والتسليمات' : 'Deliverables'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{dir === 'rtl' ? 'إجمالي المخرجات' : 'Total Deliverables'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.deliverables.total}
                    onChange={(e) => handleNestedInputChange('deliverables', 'total', parseInt(e.target.value) || 0)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
                <div>
                  <Label>{dir === 'rtl' ? 'المخرجات المكتملة' : 'Completed Deliverables'}</Label>
                  <Input
                    type="number"
                    min="0"
                    max={formData.deliverables.total}
                    value={formData.deliverables.completed}
                    onChange={(e) => handleNestedInputChange('deliverables', 'completed', parseInt(e.target.value) || 0)}
                    className="mt-1 border-2 focus:border-[#1B4FFF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} className="bg-[#1B4FFF] text-white">
            <Save className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}