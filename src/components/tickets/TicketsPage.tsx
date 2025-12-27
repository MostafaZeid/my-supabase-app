import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Paperclip,
  Filter,
  Calendar,
  User,
  Building2,
  Tag,
  ArrowRight,
  Reply,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateTicketModal } from './CreateTicketModal';
import { ticketsApiService, Ticket } from '@/services/ticketsApiService';
import { toast } from '@/hooks/use-toast';

// Ticket interface is now imported from service

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketStats, setTicketStats] = useState<any>(null);
  
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const fetchTickets = async (page = 1, search = '', status = '', priority = '') => {
    try {
      setLoading(true);
      const response = await ticketsApiService.getTickets({
        page,
        limit: 10,
        search,
        status: status === 'all' ? undefined : status,
        priority: priority === 'all' ? undefined : priority
      });
      
      if (response.success) {
        setTickets(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
        if (response.stats) {
          setTicketStats(response.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: t('common.error'),
        description: 'فشل في تحميل بيانات التذاكر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage, searchTerm, statusFilter, priorityFilter);
  }, [currentPage, statusFilter, priorityFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTickets(1, searchTerm, statusFilter, priorityFilter);
  };

  const handleCreateTicket = async (ticketData: any) => {
    try {
      const response = await ticketsApiService.createTicket(ticketData);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم إنشاء التذكرة بنجاح'
        });
        setShowCreateModal(false);
        fetchTickets(currentPage, searchTerm, statusFilter, priorityFilter);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في إنشاء التذكرة',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTicket = async (ticketId: string, ticketData: any) => {
    try {
      const response = await ticketsApiService.updateTicket(ticketId, ticketData);
      if (response.success) {
        toast({
          title: t('common.success'),
          description: 'تم تحديث التذكرة بنجاح'
        });
        fetchTickets(currentPage, searchTerm, statusFilter, priorityFilter);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'فشل في تحديث التذكرة',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'OPEN': { label: 'مفتوحة', color: 'bg-red-100 text-red-800' },
      'IN_PROGRESS': { label: 'جاري العمل', color: 'bg-blue-100 text-blue-800' },
      'RESOLVED': { label: 'محلولة', color: 'bg-green-100 text-green-800' },
      'CLOSED': { label: 'مغلقة', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['OPEN'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'LOW': { label: 'منخفضة', color: 'bg-gray-100 text-gray-800' },
      'MEDIUM': { label: 'متوسطة', color: 'bg-yellow-100 text-yellow-800' },
      'HIGH': { label: 'عالية', color: 'bg-orange-100 text-orange-800' },
      'URGENT': { label: 'عاجلة', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['MEDIUM'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل التذاكر...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التذاكر</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة تذاكر الدعم والطلبات
          </p>
        </div>
        
        {hasPermission('create_ticket') && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة تذكرة
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {ticketStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التذاكر</p>
                  <p className="text-2xl font-bold">{ticketStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">مفتوحة</p>
                  <p className="text-2xl font-bold">{ticketStats.byStatus.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">جاري العمل</p>
                  <p className="text-2xl font-bold">{ticketStats.byStatus.in_progress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">محلولة</p>
                  <p className="text-2xl font-bold">{ticketStats.byStatus.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="بحث في التذاكر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="OPEN">مفتوحة</SelectItem>
                <SelectItem value="IN_PROGRESS">جاري العمل</SelectItem>
                <SelectItem value="RESOLVED">محلولة</SelectItem>
                <SelectItem value="CLOSED">مغلقة</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="LOW">منخفضة</SelectItem>
                <SelectItem value="MEDIUM">متوسطة</SelectItem>
                <SelectItem value="HIGH">عالية</SelectItem>
                <SelectItem value="URGENT">عاجلة</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} variant="outline">
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{ticket.title}</h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {ticket.project && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{ticket.project.name}</span>
                      </div>
                    )}
                    
                    {ticket.client && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{ticket.client.name}</span>
                      </div>
                    )}
                    
                    {ticket.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{ticket.category}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ticket.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {hasPermission('edit_ticket') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Handle edit ticket
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle reply to ticket
                    }}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
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

      {/* Create Ticket Modal */}
      <CreateTicketModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}