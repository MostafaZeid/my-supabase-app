import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  client_id?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  budget?: number;
  progress: number;
  project_manager?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    name_en?: string;
    email: string;
  };
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export const projectsApiService = {
  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    client_id?: string;
  }): Promise<ProjectsResponse> {
    try {
      // استخدام الاستعلام المباشر من قاعدة البيانات
      let query = supabase
        .from('projects_2025_12_17_00_00')
        .select(`
          *,
          client:clients_2025_12_17_00_00(id, name, name_en, email)
        `, { count: 'exact' });

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,project_manager.ilike.%${params.search}%`);
      }

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params?.client_id) {
        query = query.eq('client_id', params.client_id);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { success: false, data: [] };
    }
  },

  async getProject(id: string): Promise<ProjectResponse> {
    try {
      const { data, error } = await supabase
        .from('projects_2025_12_17_00_00')
        .select(`
          *,
          client:clients_2025_12_17_00_00(id, name, name_en, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { success: false, data: {} as Project };
    }
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client'>): Promise<ProjectResponse> {
    try {
      const { data, error } = await supabase
        .from('projects_2025_12_17_00_00')
        .insert([projectData])
        .select(`
          *,
          client:clients_2025_12_17_00_00(id, name, name_en, email)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, data: {} as Project };
    }
  },

  async updateProject(id: string, projectData: Partial<Project>): Promise<ProjectResponse> {
    try {
      const { data, error } = await supabase
        .from('projects_2025_12_17_00_00')
        .update(projectData)
        .eq('id', id)
        .select(`
          *,
          client:clients_2025_12_17_00_00(id, name, name_en, email)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, data: {} as Project };
    }
  },

  async deleteProject(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('projects_2025_12_17_00_00')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Project deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false };
    }
  }
};