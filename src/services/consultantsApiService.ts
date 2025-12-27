// Mock service for v131 - to ensure it works as in the original version
export interface Consultant {
  id: string;
  full_name: string;
  full_name_en?: string;
  email: string;
  phone?: string;
  position: string;
  position_en?: string;
  department?: string;
  department_en?: string;
  specialization?: string;
  specialization_en?: string;
  experience_years: number;
  biography?: string;
  biography_en?: string;
  location?: string;
  location_en?: string;
  consultant_code?: string;
  profile_image?: string;
  cv_document_url?: string;
  cv_document_name?: string;
  avatar_initials?: string;
  status: 'active' | 'inactive';
  join_date?: string;
  created_at: string;
  updated_at: string;
}

// Mock data for v131
const mockConsultants: Consultant[] = [
  {
    id: '1',
    full_name: 'أحمد محمد علي',
    full_name_en: 'Ahmed Mohammed Ali',
    email: 'ahmed.ali@company.com',
    phone: '+966501234567',
    position: 'مستشار أول',
    position_en: 'Senior Consultant',
    department: 'تقنية المعلومات',
    department_en: 'Information Technology',
    specialization: 'تطوير البرمجيات',
    specialization_en: 'Software Development',
    experience_years: 8,
    biography: 'مستشار متخصص في تطوير البرمجيات مع خبرة 8 سنوات',
    location: 'الرياض',
    consultant_code: 'CONS001',
    avatar_initials: 'أم',
    status: 'active',
    join_date: '2020-01-15',
    created_at: '2020-01-15T10:00:00Z',
    updated_at: '2024-12-17T10:00:00Z'
  },
  {
    id: '2',
    full_name: 'سارة أحمد محمد',
    full_name_en: 'Sarah Ahmed Mohammed',
    email: 'sarah.ahmed@company.com',
    phone: '+966507654321',
    position: 'مستشارة',
    position_en: 'Consultant',
    department: 'إدارة المشاريع',
    department_en: 'Project Management',
    specialization: 'إدارة المشاريع',
    specialization_en: 'Project Management',
    experience_years: 5,
    biography: 'مستشارة متخصصة في إدارة المشاريع مع خبرة 5 سنوات',
    location: 'جدة',
    consultant_code: 'CONS002',
    avatar_initials: 'سأ',
    status: 'active',
    join_date: '2021-03-10',
    created_at: '2021-03-10T10:00:00Z',
    updated_at: '2024-12-17T10:00:00Z'
  },
  {
    id: '3',
    full_name: 'محمد عبدالله الأحمد',
    full_name_en: 'Mohammed Abdullah Al-Ahmad',
    email: 'mohammed.ahmad@company.com',
    phone: '+966509876543',
    position: 'مستشار متقدم',
    position_en: 'Advanced Consultant',
    department: 'الاستشارات المالية',
    department_en: 'Financial Consulting',
    specialization: 'التحليل المالي',
    specialization_en: 'Financial Analysis',
    experience_years: 12,
    biography: 'مستشار متخصص في التحليل المالي مع خبرة 12 سنة',
    location: 'الدمام',
    consultant_code: 'CONS003',
    avatar_initials: 'مع',
    status: 'active',
    join_date: '2018-06-20',
    created_at: '2018-06-20T10:00:00Z',
    updated_at: '2024-12-17T10:00:00Z'
  },
  {
    id: '4',
    full_name: 'فاطمة علي حسن',
    full_name_en: 'Fatima Ali Hassan',
    email: 'fatima.hassan@company.com',
    phone: '+966502468135',
    position: 'مستشارة',
    position_en: 'Consultant',
    department: 'الموارد البشرية',
    department_en: 'Human Resources',
    specialization: 'تطوير الموارد البشرية',
    specialization_en: 'HR Development',
    experience_years: 6,
    biography: 'مستشارة متخصصة في تطوير الموارد البشرية مع خبرة 6 سنوات',
    location: 'الرياض',
    consultant_code: 'CONS004',
    avatar_initials: 'فع',
    status: 'inactive',
    join_date: '2020-09-15',
    created_at: '2020-09-15T10:00:00Z',
    updated_at: '2024-12-17T10:00:00Z'
  }
];

export interface ConsultantsResponse {
  success: boolean;
  data: Consultant[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConsultantResponse {
  success: boolean;
  data: Consultant;
}

export const consultantsApiService = {
  async getConsultants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
  }): Promise<ConsultantsResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredConsultants = [...mockConsultants];

      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredConsultants = filteredConsultants.filter(consultant => 
          consultant.full_name.toLowerCase().includes(searchLower) ||
          consultant.email.toLowerCase().includes(searchLower) ||
          consultant.position.toLowerCase().includes(searchLower) ||
          consultant.specialization?.toLowerCase().includes(searchLower)
        );
      }

      if (params?.status && params.status !== 'all') {
        filteredConsultants = filteredConsultants.filter(consultant => 
          consultant.status === params.status
        );
      }

      if (params?.department && params.department !== 'all') {
        filteredConsultants = filteredConsultants.filter(consultant => 
          consultant.department === params.department
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredConsultants.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredConsultants.length / limit);

      return {
        success: true,
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: filteredConsultants.length,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching consultants:', error);
      return { success: false, data: [] };
    }
  },

  async getConsultant(id: string): Promise<ConsultantResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const consultant = mockConsultants.find(c => c.id === id);
      if (!consultant) {
        throw new Error('Consultant not found');
      }

      return {
        success: true,
        data: consultant
      };
    } catch (error) {
      console.error('Error fetching consultant:', error);
      return { success: false, data: {} as Consultant };
    }
  },

  async createConsultant(consultantData: Omit<Consultant, 'id' | 'created_at' | 'updated_at'>): Promise<ConsultantResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newConsultant: Consultant = {
        ...consultantData,
        id: `${mockConsultants.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockConsultants.push(newConsultant);

      return {
        success: true,
        data: newConsultant
      };
    } catch (error) {
      console.error('Error creating consultant:', error);
      return { success: false, data: {} as Consultant };
    }
  },

  async updateConsultant(id: string, consultantData: Partial<Consultant>): Promise<ConsultantResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = mockConsultants.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Consultant not found');
      }

      mockConsultants[index] = {
        ...mockConsultants[index],
        ...consultantData,
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        data: mockConsultants[index]
      };
    } catch (error) {
      console.error('Error updating consultant:', error);
      return { success: false, data: {} as Consultant };
    }
  },

  async deleteConsultant(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const index = mockConsultants.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Consultant not found');
      }

      mockConsultants.splice(index, 1);

      return {
        success: true,
        message: 'Consultant deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting consultant:', error);
      return { success: false };
    }
  }
};