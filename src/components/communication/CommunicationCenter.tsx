import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Hash,
  Bell,
  BellOff,
  Star,
  Archive,
  Trash2,
  Edit,
  UserPlus,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  isEdited?: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean;
  avatar?: string;
  description?: string;
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  role: string;
  department: string;
}

const CommunicationCenter: React.FC = () => {
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      status: 'online',
      role: 'مدير المشروع',
      department: 'تطوير البرمجيات'
    },
    {
      id: '2',
      name: 'فاطمة علي',
      status: 'away',
      role: 'مطور واجهات',
      department: 'تطوير البرمجيات'
    },
    {
      id: '3',
      name: 'محمد حسن',
      status: 'busy',
      role: 'مصمم UI/UX',
      department: 'التصميم'
    },
    {
      id: '4',
      name: 'سارة أحمد',
      status: 'online',
      role: 'محلل أعمال',
      department: 'تحليل الأعمال'
    }
  ]);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      type: 'direct',
      participants: ['1', 'current-user'],
      unreadCount: 2,
      isOnline: true,
      isPinned: true,
      lastMessage: {
        id: '1',
        content: 'مرحباً، كيف حال المشروع؟',
        senderId: '1',
        senderName: 'أحمد محمد',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text'
      }
    },
    {
      id: '2',
      name: 'فريق التطوير',
      type: 'group',
      participants: ['1', '2', '3', 'current-user'],
      unreadCount: 0,
      lastMessage: {
        id: '2',
        content: 'تم رفع التحديث الجديد',
        senderId: '2',
        senderName: 'فاطمة علي',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text'
      }
    },
    {
      id: '3',
      name: 'إعلانات المشروع',
      type: 'channel',
      participants: ['1', '2', '3', '4', 'current-user'],
      unreadCount: 1,
      description: 'قناة للإعلانات والتحديثات المهمة',
      lastMessage: {
        id: '3',
        content: 'اجتماع الفريق غداً الساعة 10 صباحاً',
        senderId: '1',
        senderName: 'أحمد محمد',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text'
      }
    }
  ]);

  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({
    '1': [
      {
        id: '1',
        content: 'مرحباً، كيف حال المشروع؟',
        senderId: '1',
        senderName: 'أحمد محمد',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text'
      },
      {
        id: '2',
        content: 'المشروع يسير بشكل جيد، سنكمل المرحلة الأولى قريباً',
        senderId: 'current-user',
        senderName: 'أنت',
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        type: 'text'
      }
    ],
    '2': [
      {
        id: '1',
        content: 'تم رفع التحديث الجديد',
        senderId: '2',
        senderName: 'فاطمة علي',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text'
      }
    ],
    '3': [
      {
        id: '1',
        content: 'اجتماع الفريق غداً الساعة 10 صباحاً',
        senderId: '1',
        senderName: 'أحمد محمد',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text'
      }
    ]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      senderId: 'current-user',
      senderName: 'أنت',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));

    // Update last message in chat
    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, lastMessage: newMessage }
        : chat
    ));

    setMessage('');
    
    toast({
      title: "تم إرسال الرسالة",
      description: "تم إرسال رسالتك بنجاح"
    });
  };

  const handleCreateGroupChat = () => {
    if (!newChatName.trim() || selectedUsers.length === 0) return;

    const newChat: Chat = {
      id: Date.now().toString(),
      name: newChatName,
      type: 'group',
      participants: [...selectedUsers, 'current-user'],
      unreadCount: 0
    };

    setChats(prev => [...prev, newChat]);
    setNewChatName('');
    setSelectedUsers([]);
    setShowNewChatDialog(false);

    toast({
      title: "تم إنشاء المحادثة الجماعية",
      description: `تم إنشاء محادثة "${newChatName}" بنجاح`
    });
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;

    const newChannel: Chat = {
      id: Date.now().toString(),
      name: newChannelName,
      type: 'channel',
      participants: selectedUsers.length > 0 ? [...selectedUsers, 'current-user'] : ['current-user'],
      unreadCount: 0,
      description: newChannelDescription
    };

    setChats(prev => [...prev, newChannel]);
    setNewChannelName('');
    setNewChannelDescription('');
    setSelectedUsers([]);
    setShowChannelDialog(false);

    toast({
      title: "تم إنشاء القناة",
      description: `تم إنشاء قناة "${newChannelName}" بنجاح`
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleChatPin = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    ));
  };

  const toggleChatMute = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isMuted: !chat.isMuted }
        : chat
    ));
  };

  const archiveChat = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isArchived: true }
        : chat
    ));
    
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const filteredChats = chats.filter(chat => 
    !chat.isArchived && 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedChats = filteredChats.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    const aTime = a.lastMessage?.timestamp.getTime() || 0;
    const bTime = b.lastMessage?.timestamp.getTime() || 0;
    return bTime - aTime;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} د`;
    if (hours < 24) return `${hours} س`;
    if (days < 7) return `${days} ي`;
    return date.toLocaleDateString('ar-SA');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users className="h-4 w-4" />;
      case 'channel': return <Hash className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const activeChat_data = chats.find(chat => chat.id === activeChat);
  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">مركز التواصل</h1>
            <div className="flex items-center gap-2">
              <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Hash className="h-4 w-4 ml-2" />
                    قناة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إنشاء قناة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="اسم القناة"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                    />
                    <Textarea
                      placeholder="وصف القناة (اختياري)"
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                    />
                    <div>
                      <label className="text-sm font-medium mb-2 block">إضافة أعضاء</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {users.map(user => (
                          <div
                            key={user.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                              selectedUsers.includes(user.id) 
                                ? "bg-blue-50 border border-blue-200" 
                                : "hover:bg-gray-50"
                            )}
                            onClick={() => toggleUserSelection(user.id)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            {selectedUsers.includes(user.id) && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateChannel} className="flex-1">
                        إنشاء القناة
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowChannelDialog(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>محادثة جماعية جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="اسم المحادثة"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                    />
                    <div>
                      <label className="text-sm font-medium mb-2 block">اختيار الأعضاء</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {users.map(user => (
                          <div
                            key={user.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                              selectedUsers.includes(user.id) 
                                ? "bg-blue-50 border border-blue-200" 
                                : "hover:bg-gray-50"
                            )}
                            onClick={() => toggleUserSelection(user.id)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            {selectedUsers.includes(user.id) && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateGroupChat} 
                        disabled={!newChatName.trim() || selectedUsers.length === 0}
                        className="flex-1"
                      >
                        إنشاء المحادثة
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewChatDialog(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sortedChats.map(chat => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 group",
                  activeChat === chat.id 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-gray-50"
                )}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {chat.type === 'direct' ? chat.name.charAt(0) : getChatIcon(chat.type)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === 'direct' && chat.isOnline && (
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {chat.isPinned && (
                    <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-current" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{chat.name}</p>
                      {chat.isMuted && <BellOff className="h-3 w-3 text-gray-400" />}
                    </div>
                    <div className="flex items-center gap-1">
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {chat.lastMessage.senderId === 'current-user' ? 'أنت: ' : ''}
                      {chat.lastMessage.content}
                    </p>
                  )}
                  {chat.type === 'channel' && chat.description && !chat.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {chat.description}
                    </p>
                  )}
                </div>

                {/* Chat Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs">
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => toggleChatPin(chat.id)}
                        >
                          <Star className="h-4 w-4 ml-2" />
                          {chat.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => toggleChatMute(chat.id)}
                        >
                          {chat.isMuted ? (
                            <Bell className="h-4 w-4 ml-2" />
                          ) : (
                            <BellOff className="h-4 w-4 ml-2" />
                          )}
                          {chat.isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => archiveChat(chat.id)}
                        >
                          <Archive className="h-4 w-4 ml-2" />
                          أرشفة
                        </Button>
                        {chat.type !== 'direct' && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat_data ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeChat_data.avatar} />
                    <AvatarFallback>
                      {activeChat_data.type === 'direct' 
                        ? activeChat_data.name.charAt(0) 
                        : getChatIcon(activeChat_data.type)
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{activeChat_data.name}</h2>
                    <div className="flex items-center gap-2">
                      {activeChat_data.type === 'direct' && activeChat_data.isOnline && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-gray-500">متصل الآن</span>
                        </div>
                      )}
                      {activeChat_data.type !== 'direct' && (
                        <span className="text-xs text-gray-500">
                          {activeChat_data.participants.length} عضو
                        </span>
                      )}
                      {activeChat_data.description && (
                        <span className="text-xs text-gray-500">
                          • {activeChat_data.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeChat_data.type === 'direct' && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {activeChat_data.type !== 'direct' && (
                    <Button variant="ghost" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.senderId === 'current-user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.senderId !== 'current-user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-3",
                        msg.senderId === 'current-user'
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      {msg.senderId !== 'current-user' && activeChat_data.type !== 'direct' && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.isEdited && (
                          <span className="text-xs opacity-70">معدل</span>
                        )}
                      </div>
                    </div>

                    {msg.senderId === 'current-user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>أ</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="اكتب رسالتك..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                مرحباً بك في مركز التواصل
              </h3>
              <p className="text-gray-500 mb-4">
                اختر محادثة من القائمة للبدء في التواصل
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowNewChatDialog(true)}>
                  <Users className="h-4 w-4 ml-2" />
                  محادثة جماعية جديدة
                </Button>
                <Button variant="outline" onClick={() => setShowChannelDialog(true)}>
                  <Hash className="h-4 w-4 ml-2" />
                  إنشاء قناة
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationCenter;