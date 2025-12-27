import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  name_en?: string;
  email: string;
  phone?: string;
  company?: string;
  company_en?: string;
  address?: string;
  address_en?: string;
  contact_person?: string;
  contact_person_en?: string;
  status: 'active' | 'inactive' | 'suspended';
  client_type: 'main_client' | 'sub_client';
  created_at: string;
  updated_at: string;
}

export interface ClientsResponse {
  success: boolean;
  data: Client[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientResponse {
  success: boolean;
  data: Client;
}

export const clientsApiService = {
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ClientsResponse> {
    try {
      let query = supabase
        .from('clients_2025_12_17_00_00')
        .select('*', { count: 'exact' });

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,company.ilike.%${params.search}%`);
      }

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
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
      console.error('Error fetching clients:', error);
      return { success: false, data: [] };
    }
  },

  async getClient(id: string): Promise<ClientResponse> {
    try {
      const { data, error } = await supabase
        .from('clients_2025_12_17_00_00')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching client:', error);
      return { success: false, data: {} as Client };
    }
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<ClientResponse> {
    try {
      const { data, error } = await supabase
        .from('clients_2025_12_17_00_00')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, data: {} as Client };
    }
  },

  async updateClient(id: string, clientData: Partial<Client>): Promise<ClientResponse> {
    try {
      const { data, error } = await supabase
        .from('clients_2025_12_17_00_00')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating client:', error);
      return { success: false, data: {} as Client };
    }
  },

  async deleteClient(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('clients_2025_12_17_00_00')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Client deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { success: false };
    }
  }
};