import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  Phone,
  Mail,
  Plus,
  Trash2,
  Save,
  Send,
  X,
  User,
  Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
  contactPerson: {
    name: string;
    nameEn: string;
    email: string;
    phone: string;
  };
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: string;
  type: 'internal' | 'client';
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ScheduleMeetingModal({ isOpen, onClose, client }: ScheduleMeetingModalProps) {
  const { language, dir } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [meetingData, setMeetingData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    date: '',
    time: '',
    duration: '60', // minutes
    type: 'video_call', // video_call, phone_call, in_person
    location: '',
    locationEn: '',
    agenda: '',
    agendaEn: '',
    priority: 'medium',
    reminder: '15', // minutes before
    recurring: 'none'
  });

  const [attendees, setAttendees] = useState<Attendee[]>([
    {
      id: '1',
      name: client?.contactPerson.name || '',
      email: client?.contactPerson.email || '',
      role: dir === 'rtl' ? 'ممثل العميل' : 'Client Representative',
      type: 'client'
    },
    {
      id: '2',
      name: 'د. فهد السعدي',
      email: 'fahad@albayan-consulting.com',
      role: dir === 'rtl' ? 'مدير النظام' : 'System Manager',
      type: 'internal'
    }
  ]);

  if (!client) return null;

  const addAttendee = () => {
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: '',
      type: 'internal'
    };
    setAttendees([...attendees, newAttendee]);
  };

  const removeAttendee = (id: string) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter(attendee => attendee.id !== id));
    }
  };

  const updateAttendee = (id: string, field: keyof Attendee, value: any) => {
    setAttendees(attendees.map(attendee => 
      attendee.id === id ? { ...attendee, [field]: value } : attendee
    ));
  };

  const handleSave = async (action: 'save' | 'send') => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!meetingData.title || !meetingData.date || !meetingData.time) {
        toast({
          title: dir === 'rtl' ? 'خطأ في البيانات' : 'Validation Error',
          description: dir === 'rtl' ? 'العنوان والتاريخ والوقت مطلوبة' : 'Title, date, and time are required',
          variant: 'destructive',
        });
        return;
      }

      // Validate attendees
      const invalidAttendees = attendees.filter(a => !a.name || !a.email);
      if (invalidAttendees.length > 0) {
        toast({
          title: dir === 'rtl' ? 'خطأ في البيانات' : 'Validation Error',
          description: dir === 'rtl' ? 'جميع الحضور يجب أن يكون لديهم اسم وبريد إلكتروني' : 'All attendees must have name and email',
          variant: 'destructive',
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const actionText = action === 'save' 
        ? (dir === 'rtl' ? 'تم حفظ الاجتماع' : 'Meeting saved')
        : (dir === 'rtl' ? 'تم إرسال دعوات الاجتماع' : 'Meeting invitations sent');

      toast({
        title: dir === 'rtl' ? 'تم بنجاح' : 'Success',
        description: actionText,
      });

      onClose();
    } catch (error) {
      toast({
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'حدث خطأ أثناء العملية' : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call': return <Video className="w-4 h-4" />;
      case 'phone_call': return <Phone className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDateTime = () => {
    if (!meetingData.date || !meetingData.time) return '';
    const date = new Date(`${meetingData.date}T${meetingData.time}`);
    return date.toLocaleString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-6 h-6 text-[#1B4FFF]" />
              {dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'مع' : 'With'} {dir === 'rtl' ? client.organization : client.organizationEn}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meeting Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {dir === 'rtl' ? 'معلومات الاجتماع الأساسية' : 'Basic Meeting Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {dir === 'rtl' ? 'عنوان الاجتماع (عربي)' : 'Meeting Title (Arabic)'}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={meetingData.title}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل عنوان الاجتماع' : 'Enter meeting title'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleEn">
                    {dir === 'rtl' ? 'عنوان الاجتماع (إنجليزي)' : 'Meeting Title (English)'}
                  </Label>
                  <Input
                    id="titleEn"
                    value={meetingData.titleEn}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل عنوان الاجتماع بالإنجليزية' : 'Enter meeting title in English'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {dir === 'rtl' ? 'وصف الاجتماع (عربي)' : 'Meeting Description (Arabic)'}
                  </Label>
                  <Textarea
                    id="description"
                    value={meetingData.description}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل وصف الاجتماع' : 'Enter meeting description'}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">
                    {dir === 'rtl' ? 'وصف الاجتماع (إنجليزي)' : 'Meeting Description (English)'}
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={meetingData.descriptionEn}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل وصف الاجتماع بالإنجليزية' : 'Enter meeting description in English'}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date, Time & Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {dir === 'rtl' ? 'التاريخ والوقت والنوع' : 'Date, Time & Type'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {dir === 'rtl' ? 'التاريخ' : 'Date'}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={meetingData.date}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">
                    {dir === 'rtl' ? 'الوقت' : 'Time'}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={meetingData.time}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    {dir === 'rtl' ? 'المدة (دقيقة)' : 'Duration (minutes)'}
                  </Label>
                  <Select value={meetingData.duration} onValueChange={(value) => setMeetingData(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="30">30 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="45">45 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="60">60 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="90">90 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="120">120 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">
                    {dir === 'rtl' ? 'نوع الاجتماع' : 'Meeting Type'}
                  </Label>
                  <Select value={meetingData.type} onValueChange={(value) => setMeetingData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_call">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {dir === 'rtl' ? 'مكالمة فيديو' : 'Video Call'}
                        </div>
                      </SelectItem>
                      <SelectItem value="phone_call">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {dir === 'rtl' ? 'مكالمة هاتفية' : 'Phone Call'}
                        </div>
                      </SelectItem>
                      <SelectItem value="in_person">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {dir === 'rtl' ? 'اجتماع شخصي' : 'In Person'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location (if in-person or additional info) */}
              {(meetingData.type === 'in_person' || meetingData.type === 'video_call') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {meetingData.type === 'in_person' 
                        ? (dir === 'rtl' ? 'الموقع (عربي)' : 'Location (Arabic)')
                        : (dir === 'rtl' ? 'رابط الاجتماع (عربي)' : 'Meeting Link (Arabic)')
                      }
                    </Label>
                    <Input
                      id="location"
                      value={meetingData.location}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={meetingData.type === 'in_person' 
                        ? (dir === 'rtl' ? 'أدخل عنوان الموقع' : 'Enter location address')
                        : (dir === 'rtl' ? 'أدخل رابط الاجتماع' : 'Enter meeting link')
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationEn">
                      {meetingData.type === 'in_person' 
                        ? (dir === 'rtl' ? 'الموقع (إنجليزي)' : 'Location (English)')
                        : (dir === 'rtl' ? 'رابط الاجتماع (إنجليزي)' : 'Meeting Link (English)')
                      }
                    </Label>
                    <Input
                      id="locationEn"
                      value={meetingData.locationEn}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, locationEn: e.target.value }))}
                      placeholder={meetingData.type === 'in_person' 
                        ? (dir === 'rtl' ? 'أدخل عنوان الموقع بالإنجليزية' : 'Enter location address in English')
                        : (dir === 'rtl' ? 'أدخل رابط الاجتماع بالإنجليزية' : 'Enter meeting link in English')
                      }
                    />
                  </div>
                </div>
              )}

              {/* Meeting Summary */}
              {meetingData.date && meetingData.time && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getMeetingTypeIcon(meetingData.type)}
                    <span className="font-medium text-blue-800">
                      {dir === 'rtl' ? 'ملخص الاجتماع' : 'Meeting Summary'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {formatDateTime()} • {meetingData.duration} {dir === 'rtl' ? 'دقيقة' : 'minutes'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {dir === 'rtl' ? 'الحضور' : 'Attendees'}
                </CardTitle>
                <Button onClick={addAttendee} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'إضافة حضور' : 'Add Attendee'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendees.map((attendee, index) => (
                  <div key={attendee.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-3 space-y-2">
                      <Label>{dir === 'rtl' ? 'الاسم' : 'Name'}</Label>
                      <Input
                        value={attendee.name}
                        onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                        placeholder={dir === 'rtl' ? 'أدخل الاسم' : 'Enter name'}
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <Label>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input
                        type="email"
                        value={attendee.email}
                        onChange={(e) => updateAttendee(attendee.id, 'email', e.target.value)}
                        placeholder={dir === 'rtl' ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <Label>{dir === 'rtl' ? 'الدور' : 'Role'}</Label>
                      <Input
                        value={attendee.role}
                        onChange={(e) => updateAttendee(attendee.id, 'role', e.target.value)}
                        placeholder={dir === 'rtl' ? 'أدخل الدور' : 'Enter role'}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>{dir === 'rtl' ? 'النوع' : 'Type'}</Label>
                      <Select value={attendee.type} onValueChange={(value: 'internal' | 'client') => updateAttendee(attendee.id, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {dir === 'rtl' ? 'داخلي' : 'Internal'}
                            </div>
                          </SelectItem>
                          <SelectItem value="client">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {dir === 'rtl' ? 'عميل' : 'Client'}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {attendees.length > 1 && (
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttendee(attendee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agenda & Additional Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agenda */}
            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'جدول الأعمال' : 'Meeting Agenda'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agenda">{dir === 'rtl' ? 'جدول الأعمال (عربي)' : 'Agenda (Arabic)'}</Label>
                  <Textarea
                    id="agenda"
                    value={meetingData.agenda}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, agenda: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل جدول أعمال الاجتماع' : 'Enter meeting agenda'}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agendaEn">{dir === 'rtl' ? 'جدول الأعمال (إنجليزي)' : 'Agenda (English)'}</Label>
                  <Textarea
                    id="agendaEn"
                    value={meetingData.agendaEn}
                    onChange={(e) => setMeetingData(prev => ({ ...prev, agendaEn: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل جدول أعمال الاجتماع بالإنجليزية' : 'Enter meeting agenda in English'}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'إعدادات إضافية' : 'Additional Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">{dir === 'rtl' ? 'الأولوية' : 'Priority'}</Label>
                  <Select value={meetingData.priority} onValueChange={(value) => setMeetingData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{dir === 'rtl' ? 'منخفضة' : 'Low'}</SelectItem>
                      <SelectItem value="medium">{dir === 'rtl' ? 'متوسطة' : 'Medium'}</SelectItem>
                      <SelectItem value="high">{dir === 'rtl' ? 'عالية' : 'High'}</SelectItem>
                      <SelectItem value="urgent">{dir === 'rtl' ? 'عاجلة' : 'Urgent'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder">{dir === 'rtl' ? 'التذكير قبل (دقيقة)' : 'Reminder Before (minutes)'}</Label>
                  <Select value={meetingData.reminder} onValueChange={(value) => setMeetingData(prev => ({ ...prev, reminder: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 {dir === 'rtl' ? 'دقائق' : 'minutes'}</SelectItem>
                      <SelectItem value="15">15 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="30">30 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                      <SelectItem value="60">60 {dir === 'rtl' ? 'دقيقة' : 'minutes'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurring">{dir === 'rtl' ? 'التكرار' : 'Recurring'}</Label>
                  <Select value={meetingData.recurring} onValueChange={(value) => setMeetingData(prev => ({ ...prev, recurring: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{dir === 'rtl' ? 'لا يتكرر' : 'No Repeat'}</SelectItem>
                      <SelectItem value="daily">{dir === 'rtl' ? 'يومياً' : 'Daily'}</SelectItem>
                      <SelectItem value="weekly">{dir === 'rtl' ? 'أسبوعياً' : 'Weekly'}</SelectItem>
                      <SelectItem value="monthly">{dir === 'rtl' ? 'شهرياً' : 'Monthly'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSave('save')} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {dir === 'rtl' ? 'حفظ كمسودة' : 'Save as Draft'}
            </Button>
            <Button 
              onClick={() => handleSave('send')} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {dir === 'rtl' ? 'إرسال الدعوات' : 'Send Invitations'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}