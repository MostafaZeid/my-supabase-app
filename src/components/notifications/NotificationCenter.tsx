import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, CheckCheck, Clock, User, Folder, FileText, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  deep_link?: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface Event {
  id: string;
  type: string;
  actor_user_id: string;
  project_id?: string;
  deliverable_id?: string;
  payload: any;
  created_at: string;
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'ASSIGNED_TO_PROJECT':
      return <Folder className="w-4 h-4 text-blue-500" />;
    case 'ASSIGNED_TO_DELIVERABLE':
      return <FileText className="w-4 h-4 text-green-500" />;
    case 'MEETING_SCHEDULED':
      return <Calendar className="w-4 h-4 text-purple-500" />;
    case 'MESSAGE_RECEIVED':
      return <MessageSquare className="w-4 h-4 text-orange-500" />;
    case 'USER_INVITED':
      return <User className="w-4 h-4 text-indigo-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const EventIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'project.created':
    case 'project.updated':
      return <Folder className="w-4 h-4 text-blue-500" />;
    case 'deliverable.submitted':
    case 'deliverable.approved':
      return <FileText className="w-4 h-4 text-green-500" />;
    case 'meeting.scheduled':
      return <Calendar className="w-4 h-4 text-purple-500" />;
    case 'message.sent':
      return <MessageSquare className="w-4 h-4 text-orange-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

export function NotificationCenter() {
  const { userProfile, hasPermission } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data for notifications
  const mockNotifications: Notification[] = [
    {
      id: '1',
      user_id: 'current-user',
      type: 'ASSIGNED_TO_PROJECT',
      title: 'تم تكليفك بمشروع جديد',
      body: 'تم تكليفك بالعمل في مشروع تطوير نظام إدارة المحتوى',
      metadata: { project_id: 'proj-001', project_name: 'نظام إدارة المحتوى' },
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      user_id: 'current-user',
      type: 'DELIVERABLE_SUBMITTED',
      title: 'تم تسليم مخرج جديد',
      body: 'تم تسليم مخرج التصميم الأولي للمراجعة',
      metadata: { deliverable_id: 'del-001', deliverable_name: 'التصميم الأولي' },
      is_read: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      user_id: 'current-user',
      type: 'MEETING_SCHEDULED',
      title: 'اجتماع مجدول',
      body: 'تم جدولة اجتماع مراجعة المشروع غداً الساعة 10 صباحاً',
      metadata: { meeting_id: 'meet-001', meeting_time: '2025-12-17T10:00:00Z' },
      is_read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      user_id: 'current-user',
      type: 'MESSAGE_RECEIVED',
      title: 'رسالة جديدة',
      body: 'تم استلام رسالة جديدة من العميل حول المشروع',
      metadata: { sender: 'العميل الرئيسي', project_id: 'proj-001' },
      is_read: true,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Mock data for events
  const mockEvents: Event[] = [
    {
      id: '1',
      type: 'project.member.added',
      actor_user_id: 'admin-user',
      project_id: 'proj-001',
      payload: { member_id: 'user-123', role: 'consultant', member_name: 'محمد أحمد' },
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'deliverable.assignment.created',
      actor_user_id: 'pm-user',
      project_id: 'proj-001',
      deliverable_id: 'del-001',
      payload: { assignee_id: 'user-456', deliverable_name: 'التصميم الأولي' },
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'project.created',
      actor_user_id: 'admin-user',
      project_id: 'proj-002',
      payload: { project_name: 'نظام إدارة المخزون', client_name: 'شركة التقنية المتقدمة' },
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'deliverable.approved',
      actor_user_id: 'client-user',
      project_id: 'proj-001',
      deliverable_id: 'del-002',
      payload: { deliverable_name: 'المتطلبات الوظيفية', approver_name: 'سلطان منصور' },
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // Load notifications and events
    setNotifications(mockNotifications);
    setEvents(mockEvents);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    setLoading(false);
  }, []);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  const getEventDescription = (event: Event) => {
    switch (event.type) {
      case 'project.member.added':
        return `تم إضافة ${event.payload.member_name || 'عضو جديد'} للمشروع`;
      case 'deliverable.assignment.created':
        return `تم تكليف عضو بمخرج: ${event.payload.deliverable_name}`;
      case 'project.created':
        return `تم إنشاء مشروع جديد: ${event.payload.project_name}`;
      case 'deliverable.approved':
        return `تم اعتماد مخرج: ${event.payload.deliverable_name}`;
      case 'meeting.scheduled':
        return `تم جدولة اجتماع جديد`;
      case 'message.sent':
        return `تم إرسال رسالة جديدة`;
      default:
        return `حدث من نوع: ${event.type}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">مركز الإشعارات</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCheck className="w-4 h-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            سجل الأحداث
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الإشعارات الحديثة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد إشعارات حالياً
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.is_read 
                            ? 'bg-muted/30 border-muted' 
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <NotificationIcon type={notification.type} />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{notification.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                                {!notification.is_read && (
                                  <Button
                                    onClick={() => markAsRead(notification.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {notification.body && (
                              <p className="text-sm text-muted-foreground">
                                {notification.body}
                              </p>
                            )}
                            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(notification.metadata).map(([key, value]) => (
                                  <Badge key={key} variant="outline" className="text-xs">
                                    {String(value)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                سجل الأحداث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد أحداث مسجلة
                    </div>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border bg-muted/20"
                      >
                        <div className="flex items-start gap-3">
                          <EventIcon type={event.type} />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {getEventDescription(event)}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(event.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {event.type}
                              </Badge>
                              {event.project_id && (
                                <Badge variant="outline" className="text-xs">
                                  مشروع: {event.project_id.slice(0, 8)}...
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}