import { supabase } from '@/integrations/supabase/client';

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report';
  client_id?: string;
  project_id?: string;
  assigned_to?: string;
  reporter_email?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    name_en?: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    name_en?: string;
  };
}

export interface TicketsResponse {
  success: boolean;
  data: Ticket[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TicketResponse {
  success: boolean;
  data: Ticket;
}

export const ticketsApiService = {
  async getTickets(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<TicketsResponse> {
    try {
      let query = supabase
        .from('tickets_2025_12_17_09_00')
        .select(`
          *,
          client:clients_2025_12_17_09_00(id, name, name_en, email),
          project:projects_2025_12_17_09_00(id, name, name_en)
        `, { count: 'exact' });

      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,reporter_email.ilike.%${params.search}%`);
      }

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params?.priority && params.priority !== 'all') {
        query = query.eq('priority', params.priority);
      }

      if (params?.category && params.category !== 'all') {
        query = query.eq('category', params.category);
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
      console.error('Error fetching tickets:', error);
      return { success: false, data: [] };
    }
  },

  async getTicket(id: string): Promise<TicketResponse> {
    try {
      const { data, error } = await supabase
        .from('tickets_2025_12_17_09_00')
        .select(`
          *,
          client:clients_2025_12_17_09_00(id, name, name_en, email),
          project:projects_2025_12_17_09_00(id, name, name_en)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return { success: false, data: {} as Ticket };
    }
  },

  async createTicket(ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'client' | 'project'>): Promise<TicketResponse> {
    try {
      const { data, error } = await supabase
        .from('tickets_2025_12_17_09_00')
        .insert([ticketData])
        .select(`
          *,
          client:clients_2025_12_17_09_00(id, name, name_en, email),
          project:projects_2025_12_17_09_00(id, name, name_en)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      return { success: false, data: {} as Ticket };
    }
  },

  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<TicketResponse> {
    try {
      const { data, error } = await supabase
        .from('tickets_2025_12_17_09_00')
        .update(ticketData)
        .eq('id', id)
        .select(`
          *,
          client:clients_2025_12_17_09_00(id, name, name_en, email),
          project:projects_2025_12_17_09_00(id, name, name_en)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating ticket:', error);
      return { success: false, data: {} as Ticket };
    }
  },

  async deleteTicket(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('tickets_2025_12_17_09_00')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Ticket deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return { success: false };
    }
  }
};