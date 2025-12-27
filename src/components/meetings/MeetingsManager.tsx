import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Video,
  MapPin,
  Download,
  Send,
  UserCheck,
  UserX,
  MessageSquare,
  Loader2
} from "lucide-react";
import { meetingsApiService, Meeting } from '@/services/meetingsApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function MeetingsManager() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  
  // Form state for new meeting
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    type: 'physical' as const,
    organizer: 'المنظم الحالي'
  });
  
  const { toast } = useToast();
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const fetchMeetings = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const response = await meetingsApiService.getMeetings({
        page,
        limit: 10,
        search,
        status: status === 'all' ? undefined : status
      });
      
      if (response.success) {
        setMeetings(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الاجتماعات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings(currentPage, searchTerm, statusFilter);
  }, [currentPage, statusFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMeetings(1, searchTerm, statusFilter);
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      const response = await meetingsApiService.createMeeting(meetingData);
      if (response.success) {
        toast({
          title: 'نجح',
          description: 'تم إنشاء الاجتماع بنجاح'
        });
        setShowCreateModal(false);
        fetchMeetings(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الاجتماع',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateMeeting = async (meetingData: any) => {
    if (!selectedMeeting) return;
    
    try {
      const response = await meetingsApiService.updateMeeting(selectedMeeting.id, meetingData);
      if (response.success) {
        toast({
          title: 'نجح',
          description: 'تم تحديث الاجتماع بنجاح'
        });
        setShowEditModal(false);
        setSelectedMeeting(null);
        fetchMeetings(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الاجتماع',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      const response = await meetingsApiService.deleteMeeting(meetingId);
      if (response.success) {
        toast({
          title: 'نجح',
          description: 'تم حذف الاجتماع بنجاح'
        });
        fetchMeetings(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الاجتماع',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SCHEDULED': { label: 'مجدول', color: 'bg-blue-100 text-blue-800', icon: Calendar },
      'IN_PROGRESS': { label: 'جاري', color: 'bg-green-100 text-green-800', icon: Clock },
      'COMPLETED': { label: 'مكتمل', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      'CANCELLED': { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['SCHEDULED'];
    const IconComponent = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  if (loading && meetings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل الاجتماعات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الاجتماعات</h1>
          <p className="text-muted-foreground mt-2">
            جدولة ومتابعة الاجتماعات والمشاركين
          </p>
        </div>
        
        {hasPermission('create_meeting') && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة اجتماع
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="بحث في الاجتماعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="SCHEDULED">مجدول</SelectItem>
                <SelectItem value="IN_PROGRESS">جاري</SelectItem>
                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} variant="outline">
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    {getStatusBadge(meeting.status)}
                  </div>
                  
                  {meeting.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(meeting.start_time).toLocaleDateString('ar-SA')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(meeting.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    {meeting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    
                    {meeting.meeting_url && (
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>اجتماع عبر الإنترنت</span>
                      </div>
                    )}
                    
                    {meeting.participants && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.participants.length} مشارك</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setShowDetailsModal(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  
                  {hasPermission('edit_meeting') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {hasPermission('delete_meeting') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <span className="text-sm text-muted-foreground">
            صفحة {currentPage} من {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}

export default MeetingsManager;