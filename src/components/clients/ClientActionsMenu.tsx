import { useState } from 'react';
import { InvoiceModal } from './InvoiceModal';
import { ClientReportsModal } from './ClientReportsModal';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Mail,
  Phone,
  Download,
  Archive,
  Trash2,
  BarChart3,
  FolderOpen,
  MessageSquare,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
  industry: string;
  industryEn: string;
  contactPerson: {
    name: string;
    nameEn: string;
    position: string;
    positionEn: string;
    email: string;
    phone: string;
    avatar: string;
  };
  address: {
    city: string;
    cityEn: string;
    country: string;
    countryEn: string;
  };
  establishedDate: string;
  clientSince: string;
  status: string;
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  totalValue: number;
  paidValue: number;
  satisfaction: number;
  lastActivity: string;
  tags: string[];
  tagsEn: string[];
}

interface ClientActionsMenuProps {
  client: Client;
  onViewDetails: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onViewProjects: (client: Client) => void;
}

export function ClientActionsMenu({ client, onViewDetails, onEditClient, onViewProjects }: ClientActionsMenuProps) {
  const { language, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleAction = (action: string) => {
    setIsOpen(false);
    
    switch (action) {
      case 'view':
        onViewDetails(client);
        break;
      case 'edit':
        onEditClient(client);
        break;
      case 'projects':
        onViewProjects(client);
        break;
      case 'reports':
        setShowReportsModal(true);
        break;
      case 'invoices':
        setShowInvoiceModal(true);
        break;
      case 'email':
        window.open(`mailto:${client.contactPerson.email}`, '_blank');
        break;
      case 'call':
        window.open(`tel:${client.contactPerson.phone}`, '_blank');
        break;
      case 'schedule':
        setShowScheduleModal(true);
        break;
      case 'export':
        alert(`${dir === 'rtl' ? 'تصدير بيانات العميل:' : 'Export client data:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'archive':
        if (confirm(`${dir === 'rtl' ? 'هل تريد أرشفة العميل:' : 'Archive client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم أرشفة العميل' : 'Client archived'}`);
        }
        break;
      case 'delete':
        if (confirm(`${dir === 'rtl' ? 'هل تريد حذف العميل:' : 'Delete client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم حذف العميل' : 'Client deleted'}`);
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{dir === 'rtl' ? 'فتح القائمة' : 'Open menu'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" dir={dir}>
          <DropdownMenuLabel>
            {dir === 'rtl' ? 'عمليات العميل' : 'Client Actions'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* View Actions */}
          <DropdownMenuItem onClick={() => handleAction('view')} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('projects')} className="cursor-pointer">
            <FolderOpen className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('reports')} className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'التقارير' : 'Reports'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('invoices')} className="cursor-pointer">
            <DollarSign className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'الفواتير' : 'Invoices'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Communication Actions */}
          <DropdownMenuItem onClick={() => handleAction('email')} className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'إرسال بريد إلكتروني' : 'Send Email'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('call')} className="cursor-pointer">
            <Phone className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'إجراء مكالمة' : 'Make Call'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('schedule')} className="cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Management Actions */}
          <DropdownMenuItem onClick={() => handleAction('edit')} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'تحرير البيانات' : 'Edit Information'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('export')} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'تصدير البيانات' : 'Export Data'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Archive/Delete Actions */}
          <DropdownMenuItem onClick={() => handleAction('archive')} className="cursor-pointer">
            <Archive className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'أرشفة العميل' : 'Archive Client'}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleAction('delete')} 
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {dir === 'rtl' ? 'حذف العميل' : 'Delete Client'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Modals */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        client={client}
      />
      
      <ClientReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        client={client}
      />
      
      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        client={client}
      />
    </>
  );
}