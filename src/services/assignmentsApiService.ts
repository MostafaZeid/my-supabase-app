import { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest, AssignmentFilters } from '../types/assignment';

export interface AssignmentResponse {
  data: Assignment[];
  total: number;
  page: number;
  limit: number;
}

export interface AssignmentApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

class AssignmentsApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطأ في الطلب: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('حدث خطأ غير متوقع');
    }
  }

  // Get all assignments with optional filters
  async getAssignments(filters?: AssignmentFilters): Promise<AssignmentResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.projectId) queryParams.append('projectId', filters.projectId);
      if (filters.phaseId) queryParams.append('phaseId', filters.phaseId);
      if (filters.deliverableId) queryParams.append('deliverableId', filters.deliverableId);
      if (filters.assigneeId) queryParams.append('assigneeId', filters.assigneeId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.dueDateFrom) queryParams.append('dueDateFrom', filters.dueDateFrom);
      if (filters.dueDateTo) queryParams.append('dueDateTo', filters.dueDateTo);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    }

    const endpoint = `/assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<AssignmentResponse>(endpoint);
  }

  // Get assignment by ID
  async getAssignmentById(id: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}`);
  }

  // Create new assignment
  async createAssignment(assignmentData: CreateAssignmentRequest): Promise<Assignment> {
    return this.makeRequest<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  // Update assignment
  async updateAssignment(id: string, assignmentData: UpdateAssignmentRequest): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  // Delete assignment
  async deleteAssignment(id: string): Promise<void> {
    return this.makeRequest<void>(`/assignments/${id}`, {
      method: 'DELETE',
    });
  }

  // Update assignment status
  async updateAssignmentStatus(id: string, status: string, notes?: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Update assignment progress
  async updateAssignmentProgress(id: string, progress: number, notes?: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress, notes }),
    });
  }

  // Assign task to user
  async assignToUser(id: string, assigneeId: string, notes?: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId, notes }),
    });
  }

  // Unassign task
  async unassignTask(id: string, notes?: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/unassign`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  // Get assignments by project
  async getAssignmentsByProject(projectId: string): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>(`/projects/${projectId}/assignments`);
  }

  // Get assignments by phase
  async getAssignmentsByPhase(phaseId: string): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>(`/phases/${phaseId}/assignments`);
  }

  // Get assignments by deliverable
  async getAssignmentsByDeliverable(deliverableId: string): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>(`/deliverables/${deliverableId}/assignments`);
  }

  // Get assignments by user
  async getAssignmentsByUser(userId: string): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>(`/users/${userId}/assignments`);
  }

  // Get overdue assignments
  async getOverdueAssignments(): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>('/assignments/overdue');
  }

  // Get assignments due soon
  async getAssignmentsDueSoon(days: number = 7): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>(`/assignments/due-soon?days=${days}`);
  }

  // Bulk update assignments
  async bulkUpdateAssignments(
    assignmentIds: string[],
    updates: Partial<UpdateAssignmentRequest>
  ): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>('/assignments/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ assignmentIds, updates }),
    });
  }

  // Bulk delete assignments
  async bulkDeleteAssignments(assignmentIds: string[]): Promise<void> {
    return this.makeRequest<void>('/assignments/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ assignmentIds }),
    });
  }

  // Add comment to assignment
  async addComment(id: string, comment: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  // Get assignment comments
  async getComments(id: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/assignments/${id}/comments`);
  }

  // Add attachment to assignment
  async addAttachment(id: string, file: File, description?: string): Promise<Assignment> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    return this.makeRequest<Assignment>(`/assignments/${id}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Remove attachment from assignment
  async removeAttachment(id: string, attachmentId: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // Get assignment statistics
  async getAssignmentStats(projectId?: string): Promise<any> {
    const endpoint = projectId 
      ? `/assignments/stats?projectId=${projectId}`
      : '/assignments/stats';
    return this.makeRequest<any>(endpoint);
  }

  // Clone assignment
  async cloneAssignment(id: string, updates?: Partial<CreateAssignmentRequest>): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify(updates || {}),
    });
  }

  // Set assignment dependencies
  async setDependencies(id: string, dependencyIds: string[]): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/dependencies`, {
      method: 'PUT',
      body: JSON.stringify({ dependencyIds }),
    });
  }

  // Get assignment dependencies
  async getDependencies(id: string): Promise<Assignment[]> {
    return this.makeRequest<Assignment[]>(`/assignments/${id}/dependencies`);
  }

  // Set assignment priority
  async setPriority(id: string, priority: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  }

  // Set assignment due date
  async setDueDate(id: string, dueDate: string): Promise<Assignment> {
    return this.makeRequest<Assignment>(`/assignments/${id}/due-date`, {
      method: 'PATCH',
      body: JSON.stringify({ dueDate }),
    });
  }

  // Get assignment history
  async getAssignmentHistory(id: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/assignments/${id}/history`);
  }

  // Export assignments
  async exportAssignments(filters?: AssignmentFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/assignments/export?${queryParams.toString()}`, {
      headers: {
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
    });

    if (!response.ok) {
      throw new Error('فشل في تصدير المهام');
    }

    return response.blob();
  }
}

export default AssignmentsApiService;