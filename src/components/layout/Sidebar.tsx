import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Ticket, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Activity,
  UserCheck,
  Calendar,
  MessageSquare,
  FileSearch,
  Shield,
  Bell,
  Clock,
  UserCheck2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { userProfile, signOut, canAccessSection } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();

  const menuItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: BarChart3,
      section: 'dashboard'
    },
    {
      id: 'projects',
      label: t('nav.projects'),
      icon: FileText,
      section: 'projects'
    },
    {
      id: 'consultants',
      label: t('nav.consultants'),
      icon: UserCheck,
      section: 'consultants'
    },
    {
      id: 'clients',
      label: t('nav.clients'),
      icon: Users,
      section: 'clients'
    },
    {
      id: 'tickets',
      label: t('nav.tickets'),
      icon: Ticket,
      section: 'tickets'
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: BarChart3,
      section: 'reports'
    },
    {
      id: 'users',
      label: t('nav.users'),
      icon: Users,
      section: 'users'
    },
    {
      id: 'notifications',
      label: t('nav.notifications'),
      icon: Bell,
      section: 'notifications'
    },
    {
      id: 'assignments',
      label: t('nav.assignments'),
      icon: UserCheck2,
      section: 'assignments'
    },
    {
      id: 'events',
      label: t('nav.events'),
      icon: Clock,
      section: 'events'
    },
    {
      id: 'rbac',
      label: t('nav.rbac'),
      icon: Shield,
      section: 'rbac'
    }
  ];

  const visibleMenuItems = menuItems.filter(item => canAccessSection(item.section));



  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className={`p-4 border-b border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-modern-md bg-gradient-primary p-1">
              <img 
                src="/images/albayan-logo.jpg" 
                alt="شعار البيان" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {!isCollapsed && (
              <div className="text-sm">
                <div className="font-bold text-sidebar-foreground gradient-text-primary">
                  {language === 'ar' ? 'شركة البيان' : 'Al-Bayan'}
                </div>
                <div className="text-xs text-sidebar-foreground/70">
                  {language === 'ar' ? 'سياسات وإجراءات' : 'Policies & Procedures'}
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {dir === 'rtl' ? (
              isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b border-sidebar-border ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
              {userProfile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-sidebar-foreground truncate">
                {userProfile?.full_name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {t(`roles.${userProfile?.role}`)}
                </Badge>
              </div>
              <div className="text-xs text-sidebar-foreground/70 truncate mt-1">
                {userProfile?.organization}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} transition-all duration-200 ${
                isActive ? 'bg-gradient-primary text-white shadow-modern-md' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
              data-tab={item.id}
              onClick={() => {
                onPageChange(item.id);
                setIsMobileOpen(false);
              }}
            >
              <Icon className={`w-4 h-4 ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>


    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-20 left-4 z-45 lg:hidden"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-45 w-64 transform transition-transform duration-300 lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="pt-16">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}