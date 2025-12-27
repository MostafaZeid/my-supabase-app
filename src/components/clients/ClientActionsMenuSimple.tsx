import { useState } from 'react';
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
  status: 'active' | 'inactive' | 'prospect';
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
        alert(`${dir === 'rtl' ? 'عرض تقارير العميل:' : 'View client reports:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'invoices':
        alert(`${dir === 'rtl' ? 'عرض فواتير العميل:' : 'View client invoices:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'email':
        window.open(`mailto:${client.contactPerson.email}`, '_blank');
        break;
      case 'call':
        window.open(`tel:${client.contactPerson.phone}`, '_blank');
        break;
      case 'schedule':
        alert(`${dir === 'rtl' ? 'جدولة اجتماع مع:' : 'Schedule meeting with:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'export':
        alert(`${dir === 'rtl' ? 'تصدير بيانات العميل:' : 'Export client data:'} ${dir === 'rtl' ? client.organization : client.organizationEn}`);
        break;
      case 'archive':
        if (confirm(`${dir === 'rtl' ? 'هل أنت متأكد من أرشفة العميل:' : 'Are you sure you want to archive client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم أرشفة العميل' : 'Client archived'}`);
        }
        break;
      case 'delete':
        if (confirm(`${dir === 'rtl' ? 'هل أنت متأكد من حذف العميل:' : 'Are you sure you want to delete client:'} ${dir === 'rtl' ? client.organization : client.organizationEn}?`)) {
          alert(`${dir === 'rtl' ? 'تم حذف العميل' : 'Client deleted'}`);
        }
        break;
      default:
        break;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {dir === 'rtl' ? 'عمليات العميل' : 'Client Actions'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* View Section */}
        <DropdownMenuItem onClick={() => handleAction('view')}>
          <Eye className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('projects')}>
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('reports')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'التقارير' : 'Reports'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('invoices')}>
          <DollarSign className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'الفواتير' : 'Invoices'}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Communication Section */}
        <DropdownMenuItem onClick={() => handleAction('email')}>
          <Mail className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'إرسال بريد إلكتروني' : 'Send Email'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('call')}>
          <Phone className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'إجراء مكالمة' : 'Make Call'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('schedule')}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'جدولة اجتماع' : 'Schedule Meeting'}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Management Section */}
        <DropdownMenuItem onClick={() => handleAction('edit')}>
          <Edit className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'تحرير البيانات' : 'Edit Data'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('export')}>
          <Download className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'تصدير البيانات' : 'Export Data'}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Archive Section */}
        <DropdownMenuItem onClick={() => handleAction('archive')}>
          <Archive className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'أرشفة العميل' : 'Archive Client'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('delete')} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{dir === 'rtl' ? 'حذف العميل' : 'Delete Client'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}