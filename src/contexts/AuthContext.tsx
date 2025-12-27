import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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
  project_consultant: [
    'projects.view', 'projects.edit',
    'deliverables.create', 'deliverables.edit', 'deliverables.view', 'deliverables.upload',
    'consultants.view', 'consultants.edit',
    'clients.view',
    'reports.view', 'reports.project_status',
    'meetings.view', 'meetings.minutes',
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Create default profile if none exists
        const defaultProfile: UserProfile = {
          id: userId,
          user_id: userId,
          full_name: 'User',
          role: 'sub_client',
          organization: '',
          is_active: true,
          permissions: roleAdvancedPermissions['sub_client']
        };
        setUserProfile(defaultProfile);
      } else if (data) {
        // Merge permissions from role mapping
        const profileWithPermissions = {
          ...data,
          permissions: roleAdvancedPermissions[data.role as UserRole] || []
        };
        setUserProfile(profileWithPermissions);
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { data: null, error };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role: UserRole; organization: string }) => {
    try {
      setLoading(true);
      
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            organization: userData.organization,
          },
        },
      });
      
      if (error) {
        return { data: null, error };
      }

      // Create user profile if signup was successful
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: userData.full_name,
            role: userData.role,
            organization: userData.organization,
            is_active: true,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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