import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function ScheduleMeetingModal({ isOpen, onClose, client }: ScheduleMeetingModalProps) {
  const { dir } = useLanguage();
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    type: 'online',
    agenda: ''
  });

  if (!client) return null;

  const handleSchedule = () => {
    console.log('جدولة اجتماع:', meetingData);
    alert(dir === 'rtl' ? 'تم جدولة الاجتماع بنجاح!' : 'Meeting scheduled successfully!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'معلومات العميل' : 'Client Information'}
            </h3>
            <p><strong>{dir === 'rtl' ? 'المؤسسة:' : 'Organization:'}</strong> {dir === 'rtl' ? client.organization : client.organizationEn}</p>
            <p><strong>{dir === 'rtl' ? 'مسؤول التواصل:' : 'Communication Manager:'}</strong> {dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn}</p>
            <p><strong>{dir === 'rtl' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {client.contactPerson?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'عنوان الاجتماع' : 'Meeting Title'}</Label>
              <Input
                value={meetingData.title}
                onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                placeholder={dir === 'rtl' ? 'أدخل عنوان الاجتماع' : 'Enter meeting title'}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'نوع الاجتماع' : 'Meeting Type'}</Label>
              <Select value={meetingData.type} onValueChange={(value) => setMeetingData({...meetingData, type: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">{dir === 'rtl' ? 'اجتماع عبر الإنترنت' : 'Online Meeting'}</SelectItem>
                  <SelectItem value="office">{dir === 'rtl' ? 'اجتماع في المكتب' : 'Office Meeting'}</SelectItem>
                  <SelectItem value="client">{dir === 'rtl' ? 'اجتماع لدى العميل' : 'Client Site Meeting'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'الوقت' : 'Time'}</Label>
              <Input
                type="time"
                value={meetingData.time}
                onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'المدة (دقيقة)' : 'Duration (minutes)'}</Label>
              <Select value={meetingData.duration} onValueChange={(value) => setMeetingData({...meetingData, duration: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                  <SelectItem value="60">60 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                  <SelectItem value="90">90 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                  <SelectItem value="120">120 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{dir === 'rtl' ? 'جدول الأعمال' : 'Meeting Agenda'}</Label>
            <Textarea
              value={meetingData.agenda}
              onChange={(e) => setMeetingData({...meetingData, agenda: e.target.value})}
              placeholder={dir === 'rtl' ? 'أدخل جدول أعمال الاجتماع...' : 'Enter meeting agenda...'}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              {dir === 'rtl' ? 'الاجتماعات القادمة' : 'Upcoming Meetings'}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm">{dir === 'rtl' ? 'مراجعة المشروع الأول' : 'First Project Review'}</span>
                <span className="text-sm text-muted-foreground">2024-02-15 10:00</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm">{dir === 'rtl' ? 'اجتماع المتابعة الشهري' : 'Monthly Follow-up Meeting'}</span>
                <span className="text-sm text-muted-foreground">2024-02-20 14:00</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSchedule} className="bg-[#1B4FFF] text-white">
            {dir === 'rtl' ? 'جدولة الاجتماع' : 'Schedule Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}