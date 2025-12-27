import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  position?: string;
  role: 'ADMIN' | 'MANAGER' | 'CONSULTANT' | 'CLIENT' | 'VIEWER';
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  success: boolean;
  data: UserProfile[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: UserProfile;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    manager: number;
    consultant: number;
    client: number;
    viewer: number;
  };
  recentlyActive: number;
  newThisMonth: number;
}

export class UsersApiService {
  /**
   * تسجيل مستخدم جديد
   */
  async registerUser(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    department?: string;
    position?: string;
    role?: string;
  }): Promise<{ success: boolean; data: { user: any; profile: UserProfile } }> {
    try {
      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'POST',
        body: { action: 'register', ...userData }
      });

      if (error) {
        console.error('Error registering user:', error);
        throw new Error('Failed to register user');
      }

      return data;
    } catch (error) {
      console.error('Error in registerUser:', error);
      throw error;
    }
  }

  /**
   * جلب الملف الشخصي للمستخدم الحالي أو مستخدم محدد
   */
  async getUserProfile(userId?: string): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('action', 'profile');
      if (userId) queryParams.append('user_id', userId);

      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'GET',
        body: null
      });

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  /**
   * تحديث الملف الشخصي
   */
  async updateUserProfile(userId: string | undefined, profileData: Partial<UserProfile>): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('action', 'profile');
      if (userId) queryParams.append('user_id', userId);

      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'PUT',
        body: profileData
      });

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update user profile');
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }

  /**
   * جلب جميع المستخدمين (للإداريين)
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('action', 'users');
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);

      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'GET',
        body: null
      });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }

      return data;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  }

  /**
   * إلغاء تفعيل مستخدم
   */
  async deactivateUser(userId: string): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('action', 'users');
      queryParams.append('user_id', userId);

      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'PUT',
        body: { action: 'deactivate' }
      });

      if (error) {
        console.error('Error deactivating user:', error);
        throw new Error('Failed to deactivate user');
      }

      return data;
    } catch (error) {
      console.error('Error in deactivateUser:', error);
      throw error;
    }
  }

  /**
   * تغيير دور المستخدم
   */
  async changeUserRole(userId: string, role: string): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('action', 'users');
      queryParams.append('user_id', userId);

      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'PUT',
        body: { action: 'change_role', role }
      });

      if (error) {
        console.error('Error changing user role:', error);
        throw new Error('Failed to change user role');
      }

      return data;
    } catch (error) {
      console.error('Error in changeUserRole:', error);
      throw error;
    }
  }

  /**
   * جلب إحصائيات المستخدمين
   */
  async getUserStats(): Promise<{ success: boolean; data: UserStats }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('action', 'stats');

      const { data, error } = await supabase.functions.invoke('users_auth_management_api_2025_12_16_23_00', {
        method: 'GET',
        body: null
      });

      if (error) {
        console.error('Error fetching user stats:', error);
        throw new Error('Failed to fetch user stats');
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }
}

export const usersApiService = new UsersApiService();