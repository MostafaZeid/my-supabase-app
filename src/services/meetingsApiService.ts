import { supabase } from '@/integrations/supabase/client';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  meeting_url?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  organizer?: string;
  participants?: string[];
  agenda?: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingsResponse {
  success: boolean;
  data: Meeting[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MeetingResponse {
  success: boolean;
  data: Meeting;
}

export const meetingsApiService = {
  async getMeetings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<MeetingsResponse> {
    try {
      let query = supabase
        .from('meetings_2025_12_17_09_00')
        .select('*', { count: 'exact' });

      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,organizer.ilike.%${params.search}%`);
      }

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;

      const { data, error, count } = await query
        .order('start_time', { ascending: false })
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
      console.error('Error fetching meetings:', error);
      return { success: false, data: [] };
    }
  },

  async getMeeting(id: string): Promise<MeetingResponse> {
    try {
      const { data, error } = await supabase
        .from('meetings_2025_12_17_09_00')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching meeting:', error);
      return { success: false, data: {} as Meeting };
    }
  },

  async createMeeting(meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>): Promise<MeetingResponse> {
    try {
      const { data, error } = await supabase
        .from('meetings_2025_12_17_09_00')
        .insert([meetingData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating meeting:', error);
      return { success: false, data: {} as Meeting };
    }
  },

  async updateMeeting(id: string, meetingData: Partial<Meeting>): Promise<MeetingResponse> {
    try {
      const { data, error } = await supabase
        .from('meetings_2025_12_17_09_00')
        .update(meetingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating meeting:', error);
      return { success: false, data: {} as Meeting };
    }
  },

  async deleteMeeting(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('meetings_2025_12_17_09_00')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Meeting deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return { success: false };
    }
  }
};