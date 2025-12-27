import { ApiResponse, PaginatedResponse } from '../types/api';

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  phaseId: string;
  assignmentId?: string;
  weight: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  completedDate?: string;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: DeliverableAttachment[];
  dependencies: string[];
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface DeliverableAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CreateDeliverableRequest {
  name: string;
  description?: string;
  phaseId: string;
  assignmentId?: string;
  weight: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  dependencies?: string[];
  assignedTo?: string;
  order?: number;
}

export interface UpdateDeliverableRequest {
  name?: string;
  description?: string;
  weight?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
  assignedTo?: string;
  order?: number;
}

export interface DeliverableFilters {
  phaseId?: string;
  assignmentId?: string;
  status?: string[];
  priority?: string[];
  assignedTo?: string;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface DeliverableStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  totalWeight: number;
  completedWeight: number;
  averageProgress: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

export interface BulkUpdateDeliverableRequest {
  deliverableIds: string[];
  updates: {
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: string;
    tags?: string[];
    dueDate?: string;
  };
}

export interface ReorderDeliverableRequest {
  deliverableId: string;
  newOrder: number;
  phaseId: string;
}

class DeliverablesApiService {
  private baseUrl = '/api/deliverables';

  // Get all deliverables with filters and pagination
  async getDeliverables(
    filters?: DeliverableFilters,
    page = 1,
    limit = 20,
    sortBy = 'order',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<Deliverable>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('فشل في جلب المخرجات');
    }
    return response.json();
  }

  // Get deliverable by ID
  async getDeliverable(id: string): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('فشل في جلب المخرج');
    }
    return response.json();
  }

  // Get deliverables by phase ID
  async getDeliverablesByPhase(phaseId: string): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/phase/${phaseId}`);
    if (!response.ok) {
      throw new Error('فشل في جلب مخرجات المرحلة');
    }
    return response.json();
  }

  // Get deliverables by assignment ID
  async getDeliverablesByAssignment(assignmentId: string): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/assignment/${assignmentId}`);
    if (!response.ok) {
      throw new Error('فشل في جلب مخرجات المهمة');
    }
    return response.json();
  }

  // Create new deliverable
  async createDeliverable(data: CreateDeliverableRequest): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('فشل في إنشاء المخرج');
    }
    return response.json();
  }

  // Update deliverable
  async updateDeliverable(id: string, data: UpdateDeliverableRequest): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('فشل في تحديث المخرج');
    }
    return response.json();
  }

  // Delete deliverable
  async deleteDeliverable(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('فشل في حذف المخرج');
    }
    return response.json();
  }

  // Bulk update deliverables
  async bulkUpdateDeliverables(data: BulkUpdateDeliverableRequest): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/bulk-update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('فشل في التحديث المجمع للمخرجات');
    }
    return response.json();
  }

  // Bulk delete deliverables
  async bulkDeleteDeliverables(deliverableIds: string[]): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliverableIds }),
    });

    if (!response.ok) {
      throw new Error('فشل في الحذف المجمع للمخرجات');
    }
    return response.json();
  }

  // Reorder deliverable
  async reorderDeliverable(data: ReorderDeliverableRequest): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('فشل في إعادة ترتيب المخرج');
    }
    return response.json();
  }

  // Update deliverable progress
  async updateProgress(id: string, progress: number): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });

    if (!response.ok) {
      throw new Error('فشل في تحديث تقدم المخرج');
    }
    return response.json();
  }

  // Update deliverable status
  async updateStatus(id: string, status: Deliverable['status']): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('فشل في تحديث حالة المخرج');
    }
    return response.json();
  }

  // Get deliverable statistics
  async getDeliverableStats(filters?: DeliverableFilters): Promise<ApiResponse<DeliverableStats>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/stats?${params}`);
    if (!response.ok) {
      throw new Error('فشل في جلب إحصائيات المخرجات');
    }
    return response.json();
  }

  // Upload attachment to deliverable
  async uploadAttachment(deliverableId: string, file: File): Promise<ApiResponse<DeliverableAttachment>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/${deliverableId}/attachments`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('فشل في رفع المرفق');
    }
    return response.json();
  }

  // Delete attachment from deliverable
  async deleteAttachment(deliverableId: string, attachmentId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${deliverableId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('فشل في حذف المرفق');
    }
    return response.json();
  }

  // Get deliverable dependencies
  async getDeliverableDependencies(id: string): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/${id}/dependencies`);
    if (!response.ok) {
      throw new Error('فشل في جلب تبعيات المخرج');
    }
    return response.json();
  }

  // Add dependency to deliverable
  async addDependency(id: string, dependencyId: string): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}/dependencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dependencyId }),
    });

    if (!response.ok) {
      throw new Error('فشل في إضافة التبعية');
    }
    return response.json();
  }

  // Remove dependency from deliverable
  async removeDependency(id: string, dependencyId: string): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('فشل في إزالة التبعية');
    }
    return response.json();
  }

  // Duplicate deliverable
  async duplicateDeliverable(id: string, data?: Partial<CreateDeliverableRequest>): Promise<ApiResponse<Deliverable>> {
    const response = await fetch(`${this.baseUrl}/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      throw new Error('فشل في نسخ المخرج');
    }
    return response.json();
  }

  // Get overdue deliverables
  async getOverdueDeliverables(): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/overdue`);
    if (!response.ok) {
      throw new Error('فشل في جلب المخرجات المتأخرة');
    }
    return response.json();
  }

  // Get deliverables by user
  async getDeliverablesByUser(userId: string): Promise<ApiResponse<Deliverable[]>> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`);
    if (!response.ok) {
      throw new Error('فشل في جلب مخرجات المستخدم');
    }
    return response.json();
  }

  // Export deliverables
  async exportDeliverables(filters?: DeliverableFilters, format: 'csv' | 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/export?${params}`);
    if (!response.ok) {
      throw new Error('فشل في تصدير المخرجات');
    }
    return response.blob();
  }
}

export const deliverablesApiService = new DeliverablesApiService();
export default deliverablesApiService;