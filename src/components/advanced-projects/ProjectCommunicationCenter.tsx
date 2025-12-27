import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Plus,
  Bell,
  BellOff,
  Pin,
  Archive,
  Reply,
  Forward,
  MoreVertical,
  Search,
  Filter,
  Users,
  Hash,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Paperclip,
  Eye,
  EyeOff
} from "lucide-react";

interface ProjectMessage {
  id: string;
  project_id: string;
  sender_user_id: string;
  sender_name?: string;
  recipient_user_id?: string;
  recipient_name?: string;
  subject?: string;
  content: string;
  message_type: 'general' | 'urgent' | 'announcement' | 'question' | 'update' | 'issue';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  reply_to_message_id?: string;
  attachments: any[];
  created_at: string;
  updated_at: string;
}

interface ProjectChannel {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  channel_type: 'general' | 'announcements' | 'technical' | 'client' | 'team';
  is_private: boolean;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface ProjectNotification {
  id: string;
  project_id: string;
  user_id: string;
  notification_type: 'message' | 'mention' | 'review' | 'deadline' | 'assignment' | 'update';
  title: string;
  content?: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

interface ProjectCommunicationCenterProps {
  projectId: string;
  projectName?: string;
}

const ProjectCommunicationCenter: React.FC<ProjectCommunicationCenterProps> = ({ 
  projectId, 
  projectName 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [channels, setChannels] = useState<ProjectChannel[]>([]);
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageFilter, setMessageFilter] = useState<string>('all');
  
  // Form states
  const [newMessage, setNewMessage] = useState({
    recipient_user_id: '',
    subject: '',
    content: '',
    message_type: 'general' as const,
    priority: 'normal' as const
  });
  
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    channel_type: 'general' as const,
    is_private: false
  });

  useEffect(() => {
    loadMessages();
    loadChannels();
    loadNotifications();
  }, [projectId]);

  const loadMessages = async () => {
    setLoading(true);
    
    // محاكاة تحميل الرسائل - في التطبيق الحقيقي سيتم جلبها من Supabase
    const mockMessages: ProjectMessage[] = [
      {
        id: '1',
        project_id: projectId,
        sender_user_id: 'user1',
        sender_name: 'أحمد محمد',
        recipient_user_id: null,
        subject: 'بداية المشروع',
        content: 'مرحباً بالجميع! نبدأ اليوم العمل على مشروع تطوير منصة إدارة السياسات والإجراءات. أتطلع للعمل معكم جميعاً.',
        message_type: 'announcement',
        priority: 'high',
        is_read: true,
        is_archived: false,
        is_pinned: true,
        attachments: [],
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-01-20T09:00:00Z'
      },
      {
        id: '2',
        project_id: projectId,
        sender_user_id: 'user2',
        sender_name: 'سارة أحمد',
        recipient_user_id: null,
        subject: 'تحديث التصميم',
        content: 'تم الانتهاء من تصميم واجهة المستخدم الأولية. يرجى مراجعتها وإبداء الملاحظات.',
        message_type: 'update',
        priority: 'normal',
        is_read: false,
        is_archived: false,
        is_pinned: false,
        attachments: [{ name: 'UI_Design_v1.pdf', size: '2.5MB' }],
        created_at: '2024-01-20T14:30:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        project_id: projectId,
        sender_user_id: 'user3',
        sender_name: 'محمد علي',
        recipient_user_id: 'user1',
        subject: 'استفسار حول المتطلبات',
        content: 'لدي بعض الاستفسارات حول متطلبات النظام. هل يمكننا ترتيب اجتماع لمناقشتها؟',
        message_type: 'question',
        priority: 'normal',
        is_read: false,
        is_archived: false,
        is_pinned: false,
        attachments: [],
        created_at: '2024-01-20T16:15:00Z',
        updated_at: '2024-01-20T16:15:00Z'
      },
      {
        id: '4',
        project_id: projectId,
        sender_user_id: 'user1',
        sender_name: 'أحمد محمد',
        recipient_user_id: 'user3',
        content: 'بالطبع! يمكننا ترتيب اجتماع غداً في الساعة 2 ظهراً. سأرسل لك رابط الاجتماع.',
        message_type: 'general',
        priority: 'normal',
        is_read: true,
        is_archived: false,
        is_pinned: false,
        reply_to_message_id: '3',
        attachments: [],
        created_at: '2024-01-20T16:45:00Z',
        updated_at: '2024-01-20T16:45:00Z'
      },
      {
        id: '5',
        project_id: projectId,
        sender_user_id: 'user4',
        sender_name: 'فاطمة الزهراء',
        recipient_user_id: null,
        subject: 'مشكلة تقنية عاجلة',
        content: 'هناك مشكلة في الخادم تحتاج لحل عاجل. يرجى التواصل معي فوراً.',
        message_type: 'issue',
        priority: 'urgent',
        is_read: false,
        is_archived: false,
        is_pinned: false,
        attachments: [],
        created_at: '2024-01-20T18:00:00Z',
        updated_at: '2024-01-20T18:00:00Z'
      }
    ];
    
    setMessages(mockMessages);
    setLoading(false);
  };

  const loadChannels = async () => {
    // محاكاة تحميل القنوات
    const mockChannels: ProjectChannel[] = [
      {
        id: '1',
        project_id: projectId,
        name: 'عام',
        description: 'قناة المناقشات العامة للمشروع',
        channel_type: 'general',
        is_private: false,
        is_archived: false,
        created_by: 'user1',
        created_at: '2024-01-15T10:00:00Z',
        member_count: 8
      },
      {
        id: '2',
        project_id: projectId,
        name: 'الإعلانات',
        description: 'قناة الإعلانات والتحديثات المهمة',
        channel_type: 'announcements',
        is_private: false,
        is_archived: false,
        created_by: 'user1',
        created_at: '2024-01-15T10:00:00Z',
        member_count: 8
      },
      {
        id: '3',
        project_id: projectId,
        name: 'التقني',
        description: 'مناقشات تقنية ومطورين',
        channel_type: 'technical',
        is_private: false,
        is_archived: false,
        created_by: 'user2',
        created_at: '2024-01-15T10:00:00Z',
        member_count: 4
      },
      {
        id: '4',
        project_id: projectId,
        name: 'العميل',
        description: 'تواصل مع العميل',
        channel_type: 'client',
        is_private: true,
        is_archived: false,
        created_by: 'user1',
        created_at: '2024-01-15T10:00:00Z',
        member_count: 3
      }
    ];
    
    setChannels(mockChannels);
  };

  const loadNotifications = async () => {
    // محاكاة تحميل الإشعارات
    const mockNotifications: ProjectNotification[] = [
      {
        id: '1',
        project_id: projectId,
        user_id: 'current_user',
        notification_type: 'message',
        title: 'رسالة جديدة من سارة أحمد',
        content: 'تحديث التصميم',
        is_read: false,
        is_dismissed: false,
        created_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        project_id: projectId,
        user_id: 'current_user',
        notification_type: 'deadline',
        title: 'اقتراب موعد التسليم',
        content: 'موعد تسليم التصميم بعد يومين',
        is_read: false,
        is_dismissed: false,
        created_at: '2024-01-20T16:00:00Z'
      },
      {
        id: '3',
        project_id: projectId,
        user_id: 'current_user',
        notification_type: 'review',
        title: 'مراجعة جديدة مطلوبة',
        content: 'لديك مراجعة جديدة لقاعدة البيانات',
        is_read: true,
        is_dismissed: false,
        created_at: '2024-01-20T12:00:00Z'
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال محتوى الرسالة",
        variant: "destructive"
      });
      return;
    }

    const messageData: ProjectMessage = {
      id: Date.now().toString(),
      project_id: projectId,
      sender_user_id: 'current_user',
      sender_name: 'المستخدم الحالي',
      recipient_user_id: newMessage.recipient_user_id || null,
      recipient_name: newMessage.recipient_user_id ? 'مستلم محدد' : null,
      subject: newMessage.subject,
      content: newMessage.content,
      message_type: newMessage.message_type,
      priority: newMessage.priority,
      is_read: false,
      is_archived: false,
      is_pinned: false,
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMessages([messageData, ...messages]);
    setShowComposeDialog(false);
    setNewMessage({
      recipient_user_id: '',
      subject: '',
      content: '',
      message_type: 'general',
      priority: 'normal'
    });

    toast({
      title: "تم إرسال الرسالة",
      description: "تم إرسال الرسالة بنجاح",
    });
  };

  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم القناة",
        variant: "destructive"
      });
      return;
    }

    const channelData: ProjectChannel = {
      id: Date.now().toString(),
      project_id: projectId,
      name: newChannel.name,
      description: newChannel.description,
      channel_type: newChannel.channel_type,
      is_private: newChannel.is_private,
      is_archived: false,
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      member_count: 1
    };

    setChannels([...channels, channelData]);
    setShowChannelDialog(false);
    setNewChannel({
      name: '',
      description: '',
      channel_type: 'general',
      is_private: false
    });

    toast({
      title: "تم إنشاء القناة",
      description: "تم إنشاء القناة بنجاح",
    });
  };

  const handleMarkAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, is_read: true } : msg
    );
    setMessages(updatedMessages);
  };

  const handlePinMessage = (messageId: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, is_pinned: !msg.is_pinned } : msg
    );
    setMessages(updatedMessages);
    
    const message = messages.find(m => m.id === messageId);
    toast({
      title: message?.is_pinned ? "تم إلغاء التثبيت" : "تم التثبيت",
      description: message?.is_pinned ? "تم إلغاء تثبيت الرسالة" : "تم تثبيت الرسالة",
    });
  };

  const handleArchiveMessage = (messageId: string) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, is_archived: !msg.is_archived } : msg
    );
    setMessages(updatedMessages);
    
    const message = messages.find(m => m.id === messageId);
    toast({
      title: message?.is_archived ? "تم إلغاء الأرشفة" : "تم الأرشفة",
      description: message?.is_archived ? "تم إلغاء أرشفة الرسالة" : "تم أرشفة الرسالة",
    });
  };

  const handleDismissNotification = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, is_dismissed: true } : notif
    );
    setNotifications(updatedNotifications);
  };

  const getMessageTypeColor = (type: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      urgent: 'bg-red-100 text-red-800',
      announcement: 'bg-blue-100 text-blue-800',
      question: 'bg-yellow-100 text-yellow-800',
      update: 'bg-green-100 text-green-800',
      issue: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: <Clock className="h-4 w-4" />,
      normal: <MessageSquare className="h-4 w-4" />,
      high: <AlertCircle className="h-4 w-4" />,
      urgent: <AlertCircle className="h-4 w-4 text-red-600" />
    };
    return icons[priority as keyof typeof icons] || <MessageSquare className="h-4 w-4" />;
  };

  const getChannelIcon = (type: string) => {
    const icons = {
      general: <Hash className="h-4 w-4" />,
      announcements: <Bell className="h-4 w-4" />,
      technical: <Hash className="h-4 w-4" />,
      client: <Users className="h-4 w-4" />,
      team: <Users className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Hash className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = messageFilter === 'all' || 
      (messageFilter === 'unread' && !message.is_read) ||
      (messageFilter === 'pinned' && message.is_pinned) ||
      (messageFilter === 'archived' && message.is_archived) ||
      message.message_type === messageFilter;
    
    return matchesSearch && matchesFilter;
  });

  const unreadNotifications = notifications.filter(n => !n.is_read && !n.is_dismissed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">مركز التواصل</h2>
          <p className="text-gray-600 mt-1">
            {projectName ? `مشروع: ${projectName}` : 'إدارة التواصل والرسائل'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowChannelDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            إنشاء قناة
          </Button>
          <Button onClick={() => setShowComposeDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            رسالة جديدة
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            الرسائل
            {messages.filter(m => !m.is_read).length > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {messages.filter(m => !m.is_read).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            القنوات
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
            {unreadNotifications.length > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في الرسائل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الرسائل</SelectItem>
                  <SelectItem value="unread">غير مقروءة</SelectItem>
                  <SelectItem value="pinned">مثبتة</SelectItem>
                  <SelectItem value="archived">مؤرشفة</SelectItem>
                  <SelectItem value="announcement">إعلانات</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                  <SelectItem value="question">استفسارات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Messages List */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">جاري تحميل الرسائل...</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد رسائل</h3>
                    <p className="text-gray-600 mb-4">ابدأ بإرسال رسالة جديدة</p>
                    <Button onClick={() => setShowComposeDialog(true)}>
                      <Send className="h-4 w-4 mr-2" />
                      رسالة جديدة
                    </Button>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <Card key={message.id} className={cn(
                      "transition-all hover:shadow-md",
                      !message.is_read && "border-l-4 border-l-blue-500 bg-blue-50/30",
                      message.is_pinned && "border-t-2 border-t-yellow-400",
                      message.is_archived && "opacity-60"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {getPriorityIcon(message.priority)}
                                <span className="font-medium text-gray-900">
                                  {message.sender_name}
                                </span>
                              </div>
                              
                              {message.recipient_name && (
                                <span className="text-sm text-gray-500">
                                  → {message.recipient_name}
                                </span>
                              )}
                              
                              <Badge className={getMessageTypeColor(message.message_type)}>
                                {message.message_type === 'general' && 'عام'}
                                {message.message_type === 'urgent' && 'عاجل'}
                                {message.message_type === 'announcement' && 'إعلان'}
                                {message.message_type === 'question' && 'استفسار'}
                                {message.message_type === 'update' && 'تحديث'}
                                {message.message_type === 'issue' && 'مشكلة'}
                              </Badge>
                              
                              {message.is_pinned && (
                                <Pin className="h-4 w-4 text-yellow-600" />
                              )}
                              
                              {!message.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            {message.subject && (
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {message.subject}
                              </h4>
                            )}
                            
                            <p className="text-gray-700 mb-2 line-clamp-2">
                              {message.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(message.created_at)}</span>
                              </div>
                              
                              {message.attachments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{message.attachments.length} مرفق</span>
                                </div>
                              )}
                              
                              {message.reply_to_message_id && (
                                <div className="flex items-center gap-1">
                                  <Reply className="h-3 w-3" />
                                  <span>رد</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            {!message.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(message.id)}
                                title="تحديد كمقروء"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePinMessage(message.id)}
                              title={message.is_pinned ? "إلغاء التثبيت" : "تثبيت"}
                            >
                              <Pin className={cn("h-4 w-4", message.is_pinned && "text-yellow-600")} />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveMessage(message.id)}
                              title={message.is_archived ? "إلغاء الأرشفة" : "أرشفة"}
                            >
                              <Archive className={cn("h-4 w-4", message.is_archived && "text-gray-600")} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.channel_type)}
                      <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                      {channel.is_private && (
                        <Badge variant="outline" className="text-xs">خاص</Badge>
                      )}
                    </div>
                  </div>
                  
                  {channel.description && (
                    <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{channel.member_count} عضو</span>
                    </div>
                    <span>{formatDate(channel.created_at)}</span>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      دخول
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.filter(n => !n.is_dismissed).length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
                  <p className="text-gray-600">ستظهر الإشعارات الجديدة هنا</p>
                </div>
              ) : (
                notifications
                  .filter(n => !n.is_dismissed)
                  .map((notification) => (
                    <Card key={notification.id} className={cn(
                      "transition-all hover:shadow-md",
                      !notification.is_read && "border-l-4 border-l-blue-500 bg-blue-50/30"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">
                                {notification.notification_type === 'message' && 'رسالة'}
                                {notification.notification_type === 'mention' && 'إشارة'}
                                {notification.notification_type === 'review' && 'مراجعة'}
                                {notification.notification_type === 'deadline' && 'موعد'}
                                {notification.notification_type === 'assignment' && 'مهمة'}
                                {notification.notification_type === 'update' && 'تحديث'}
                              </Badge>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            
                            {notification.content && (
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.content}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(notification.created_at)}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissNotification(notification.id)}
                            title="إخفاء"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>رسالة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المستلم</Label>
                <Select value={newMessage.recipient_user_id} onValueChange={(value) => setNewMessage({...newMessage, recipient_user_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستلم (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع أعضاء المشروع</SelectItem>
                    <SelectItem value="user1">أحمد محمد</SelectItem>
                    <SelectItem value="user2">سارة أحمد</SelectItem>
                    <SelectItem value="user3">محمد علي</SelectItem>
                    <SelectItem value="user4">فاطمة الزهراء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>نوع الرسالة</Label>
                <Select value={newMessage.message_type} onValueChange={(value: any) => setNewMessage({...newMessage, message_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="announcement">إعلان</SelectItem>
                    <SelectItem value="question">استفسار</SelectItem>
                    <SelectItem value="update">تحديث</SelectItem>
                    <SelectItem value="issue">مشكلة</SelectItem>
                    <SelectItem value="urgent">عاجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select value={newMessage.priority} onValueChange={(value: any) => setNewMessage({...newMessage, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="normal">عادية</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع (اختياري)</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                placeholder="موضوع الرسالة..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">المحتوى *</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                placeholder="اكتب رسالتك هنا..."
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              إرسال
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Channel Dialog */}
      <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>إنشاء قناة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">اسم القناة *</Label>
              <Input
                id="channel-name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                placeholder="مثال: التطوير"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-description">الوصف</Label>
              <Textarea
                id="channel-description"
                value={newChannel.description}
                onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                placeholder="وصف القناة..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع القناة</Label>
                <Select value={newChannel.channel_type} onValueChange={(value: any) => setNewChannel({...newChannel, channel_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="announcements">إعلانات</SelectItem>
                    <SelectItem value="technical">تقني</SelectItem>
                    <SelectItem value="client">عميل</SelectItem>
                    <SelectItem value="team">فريق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>الخصوصية</Label>
                <Select value={newChannel.is_private ? 'private' : 'public'} onValueChange={(value) => setNewChannel({...newChannel, is_private: value === 'private'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">عامة</SelectItem>
                    <SelectItem value="private">خاصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowChannelDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateChannel}>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء القناة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectCommunicationCenter;