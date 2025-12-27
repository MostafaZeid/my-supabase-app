import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  LogOut,
  Globe,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function TopBar() {
  const { signOut, userProfile } = useAuth();
  const { language, setLanguage, dir, t } = useLanguage();

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-full bg-white border-b border-gray-200 z-40`}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* شعار المنصة */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ب</span>
          </div>
          <span className="font-semibold text-gray-900">
            {language === 'ar' ? 'منصة البيان' : 'Al-Bayan Platform'}
          </span>
        </div>

        {/* الأزرار العلوية */}
        <div className="flex items-center gap-2">
          {/* زر الإشعارات */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('openNotifications'))}
            className="relative gap-2"
            title={t('nav.notifications')}
          >
            <Bell className="w-4 h-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          
          {/* زر تغيير اللغة */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            className="gap-2"
            title={language === 'ar' ? 'English' : 'العربية'}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">
              {language === 'ar' ? 'EN' : 'عر'}
            </span>
          </Button>

          {/* زر الإعدادات */}
          {userProfile?.role === 'system_admin' && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title={t('nav.settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}

          {/* معلومات المستخدم */}
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {userProfile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm text-gray-700 max-w-32 truncate">
              {userProfile?.full_name || 'مستخدم'}
            </span>
          </div>

          {/* زر الخروج */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}