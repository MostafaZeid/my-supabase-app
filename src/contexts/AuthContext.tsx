import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from './LanguageContext';

export type UserRole = 'system_admin' | 'project_manager' | 'project_consultant' | 'main_client' | 'sub_client';

// Advanced role mapping based on OpenAPI specification
export const RoleMapping = {
  SYSTEM_ADMIN: 'system_admin',
  PROJECT_MANAGER: 'project_manager', 
  PROJECT_CONSULTANT: 'project_consultant',
  CLIENT_MAIN: 'main_client',
  CLIENT_SUB: 'sub_client'
} as const;

// Role display names in Arabic
export const RoleDisplayNames = {
  system_admin: 'مدير النظام',
  project_manager: 'مدير المشروع',
  project_consultant: 'مستشار المشروع',
  main_client: 'عميل رئيسي',
  sub_client: 'عميل فرعي'
} as const;

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  organization: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; role: UserRole; organization: string }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: any; error: any }>;
  hasPermission: (permission: string) => boolean;
  canAccessSection: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions
const rolePermissions: Record<UserRole, string[]> = {
  system_admin: [
    'projects.create', 'projects.edit', 'projects.delete', 'projects.view', 'projects.activate', 'projects.close',
    'deliverables.create', 'deliverables.edit', 'deliverables.delete', 'deliverables.view', 'deliverables.upload', 'deliverables.review', 'deliverables.approve', 'deliverables.request_changes', 'deliverables.reopen',
    'clients.create', 'clients.edit', 'clients.delete', 'clients.view',
    'consultants.create', 'consultants.edit', 'consultants.delete', 'consultants.view', 'consultants.assign',
    'tickets.create', 'tickets.edit', 'tickets.delete', 'tickets.view', 'tickets.respond',
    'reports.view', 'reports.export', 'reports.project_status', 'reports.time_tracking', 'reports.audit_trail',
    'meetings.create', 'meetings.edit', 'meetings.view', 'meetings.minutes',
    'communication.send', 'communication.view', 'communication.moderate',
    'users.create', 'users.edit', 'users.delete', 'users.view',
    'system.manage_users', 'system.manage_roles', 'system.settings'
  ],
  project_manager: [
    'projects.create', 'projects.edit', 'projects.view', 'projects.activate', 'projects.close',
    'deliverables.create', 'deliverables.edit', 'deliverables.view', 'deliverables.review', 'deliverables.reopen',
    'consultants.view', 'consultants.assign',
    'clients.view',
    'reports.view', 'reports.export', 'reports.project_status', 'reports.time_tracking', 'reports.audit_trail',
    'meetings.create', 'meetings.edit', 'meetings.view', 'meetings.minutes',
    'communication.send', 'communication.view', 'communication.moderate'
  ],
  lead_consultant: [
    'projects.view', 'projects.edit',
    'deliverables.create', 'deliverables.edit', 'deliverables.view', 'deliverables.upload',
    'consultants.view', 'consultants.edit',
    'clients.view',
    'reports.view', 'reports.project_status',
    'meetings.view', 'meetings.minutes',
    'communication.send', 'communication.view'
  ],
  sub_consultant: [
    'projects.view',
    'deliverables.view', 'deliverables.upload',
    'consultants.view',
    'reports.view',
    'meetings.view',
    'communication.send', 'communication.view'
  ],
  main_client: [
    'projects.view',
    'deliverables.view', 'deliverables.review', 'deliverables.approve', 'deliverables.request_changes',
    'reports.view', 'reports.project_status',
    'meetings.view',
    'communication.send', 'communication.view'
  ],
  sub_client: [
    'projects.view',
    'deliverables.view', 'deliverables.review',
    'reports.view',
    'meetings.view',
    'communication.view'
  ]
};

// Advanced permissions catalog based on OpenAPI specification
const AdvancedPermissions = {
  // Admin permissions
  SIGNUP_REQUEST_READ: 'signup.request.read',
  SIGNUP_REQUEST_DECIDE: 'signup.request.decide',
  USER_INVITE_CREATE: 'user.invite.create',
  USER_INVITE_RESEND: 'user.invite.resend',
  RBAC_SEED: 'rbac.seed',
  
  // Project permissions
  PROJECT_MEMBER_ADD: 'project.member.add',
  PROJECT_VIEW: 'project.view',
  PROJECT_MANAGE: 'project.manage',
  
  // Deliverable permissions
  DELIVERABLE_ASSIGN_CREATE: 'deliverable.assign.create',
  DELIVERABLE_VIEW: 'deliverable.view',
  DELIVERABLE_MANAGE: 'deliverable.manage',
  
  // Grant permissions
  GRANT_CREATE: 'grant.create',
  GRANT_MANAGE: 'grant.manage',
  
  // Notification permissions
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_MARK_READ: 'notification.mark.read',
  
  // Event permissions
  EVENT_READ: 'event.read',
  EVENT_MANAGE: 'event.manage'
} as const;

// Role-based permissions mapping (OpenAPI specification)
const roleAdvancedPermissions: Record<UserRole, string[]> = {
  system_admin: [
    '*', // Full access
    AdvancedPermissions.SIGNUP_REQUEST_READ,
    AdvancedPermissions.SIGNUP_REQUEST_DECIDE,
    AdvancedPermissions.USER_INVITE_CREATE,
    AdvancedPermissions.USER_INVITE_RESEND,
    AdvancedPermissions.RBAC_SEED,
    AdvancedPermissions.PROJECT_MEMBER_ADD,
    AdvancedPermissions.DELIVERABLE_ASSIGN_CREATE,
    AdvancedPermissions.GRANT_CREATE,
    AdvancedPermissions.NOTIFICATION_READ,
    AdvancedPermissions.NOTIFICATION_MARK_READ,
    AdvancedPermissions.EVENT_READ
  ],
  project_manager: [
    AdvancedPermissions.PROJECT_MEMBER_ADD,
    AdvancedPermissions.DELIVERABLE_ASSIGN_CREATE,
    AdvancedPermissions.GRANT_CREATE,
    AdvancedPermissions.NOTIFICATION_READ,
    AdvancedPermissions.NOTIFICATION_MARK_READ,
    AdvancedPermissions.EVENT_READ
  ],
  project_consultant: [
    AdvancedPermissions.NOTIFICATION_READ,
    AdvancedPermissions.NOTIFICATION_MARK_READ,
    AdvancedPermissions.DELIVERABLE_VIEW
  ],
  main_client: [
    AdvancedPermissions.GRANT_CREATE,
    AdvancedPermissions.NOTIFICATION_READ,
    AdvancedPermissions.NOTIFICATION_MARK_READ,
    AdvancedPermissions.PROJECT_VIEW
  ],
  sub_client: [
    AdvancedPermissions.NOTIFICATION_READ,
    AdvancedPermissions.NOTIFICATION_MARK_READ
  ]
};

// Section access based on roles (updated)
const sectionAccess: Record<UserRole, string[]> = {
  system_admin: ['dashboard', 'projects', 'consultants', 'clients', 'tickets', 'reports', 'users', 'rbac', 'notifications', 'events', 'assignments'],
  project_manager: ['dashboard', 'projects', 'consultants', 'clients', 'reports', 'rbac', 'notifications', 'events', 'assignments'],
  project_consultant: ['dashboard', 'projects', 'reports', 'notifications'],
  main_client: ['dashboard', 'projects', 'reports', 'notifications', 'assignments'],
  sub_client: ['dashboard', 'projects', 'reports', 'notifications']
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate sign in
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine role based on email for demo purposes
      let role: UserRole = 'system_admin';
      let organization = 'شركة البيان للاستشارات';
      
      if (email === 'admin@system.com') {
        role = 'system_admin';
        organization = 'شركة البيان للاستشارات';
      } else if (email === 'manager@project.com') {
        role = 'project_manager';
        organization = 'شركة البيان للاستشارات';
      } else if (email === 'consultant@project.com') {
        role = 'project_consultant';
        organization = 'شركة البيان للاستشارات';
      } else if (email === 'main@client.com') {
        role = 'main_client';
        organization = 'شركة التقنية المتقدمة';
      } else if (email === 'sub@client.com') {
        role = 'sub_client';
        organization = 'شركة التقنية المتقدمة';
      }

      const mockUser = {
        id: 'mock-user-id',
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        confirmation_sent_at: null,
        recovery_sent_at: null,
        email_change_sent_at: null,
        new_email: null,
        invited_at: null,
        action_link: null,
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        phone: null,
        email_change: null,
        email_change_confirm_status: 0,
        banned_until: null,
        identities: []
      } as User;

      const mockProfile = {
        id: 'mock-profile-id',
        user_id: 'mock-user-id',
        full_name: role === 'system_admin' ? 'د. فهد السعدي - مدير النظام' :
                   role === 'project_manager' ? 'م. عبدالله القحطاني - مدير المشروع' :
                   role === 'project_consultant' ? 'محمد رشاد - مستشار المشروع' :
                   role === 'main_client' ? 'سلطان منصور - عميل رئيسي' : 'عبدالعزيز العتيبي - عميل فرعي',
        role,
        organization,
        phone: '+966500000000',
        avatar_url: null,
        is_active: true,
        permissions: roleAdvancedPermissions[role]
      };

      setUser(mockUser);
      setUserProfile(mockProfile);
      
      return { data: { user: mockUser }, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: UserRole; organization: string }) => {
    try {
      setLoading(true);
      
      // Simulate sign up
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'mock-user-id',
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: userData,
        aud: 'authenticated',
        confirmation_sent_at: null,
        recovery_sent_at: null,
        email_change_sent_at: null,
        new_email: null,
        invited_at: null,
        action_link: null,
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        phone: null,
        email_change: null,
        email_change_confirm_status: 0,
        banned_until: null,
        identities: []
      } as User;

      // تحويل الأدوار القديمة للجديدة
      const normalizedRole = userData.role === 'lead_consultant' ? 'system_admin' : userData.role;
      
      const mockProfile = {
        id: 'mock-profile-id',
        user_id: 'mock-user-id',
        full_name: userData.full_name,
        role: normalizedRole,
        organization: userData.organization,
        phone: null,
        avatar_url: null,
        is_active: true,
        permissions: rolePermissions[normalizedRole] || []
      };

      setUser(mockUser);
      setUserProfile(mockProfile);
      
      return { data: { user: mockUser }, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...updates };
        setUserProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }
      return { data: null, error: new Error('No user profile found') };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    return userProfile.permissions.includes(permission);
  };

  const canAccessSection = (section: string): boolean => {
    if (!userProfile) return false;
    return sectionAccess[userProfile.role]?.includes(section) || false;
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    canAccessSection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}