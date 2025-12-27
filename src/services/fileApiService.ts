import { ApiResponse, PaginatedResponse } from '../types/api';

export interface FileUpload {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  entityType: 'project' | 'phase' | 'deliverable' | 'assignment';
  entityId: string;
  tags?: string[];
  description?: string;
  version: number;
  isActive: boolean;
}

export interface FileUploadRequest {
  file: File;
  entityType: 'project' | 'phase' | 'deliverable' | 'assignment';
  entityId: string;
  description?: string;
  tags?: string[];
}

export interface FileUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface FileSearchParams {
  entityType?: 'project' | 'phase' | 'deliverable' | 'assignment';
  entityId?: string;
  mimeType?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'version';
  sortOrder?: 'asc' | 'desc';
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  filesByEntity: Record<string, number>;
  recentUploads: number;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  changeLog?: string;
}

class FileApiService {
  private baseUrl = '/api/files';

  // Upload file
  async uploadFile(request: FileUploadRequest): Promise<ApiResponse<FileUpload>> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('entityType', request.entityType);
      formData.append('entityId', request.entityId);
      
      if (request.description) {
        formData.append('description', request.description);
      }
      
      if (request.tags && request.tags.length > 0) {
        formData.append('tags', JSON.stringify(request.tags));
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في رفع الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('فشل في رفع الملف');
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(requests: FileUploadRequest[]): Promise<ApiResponse<FileUpload[]>> {
    try {
      const formData = new FormData();
      
      requests.forEach((request, index) => {
        formData.append(`files`, request.file);
        formData.append(`entityTypes`, request.entityType);
        formData.append(`entityIds`, request.entityId);
        
        if (request.description) {
          formData.append(`descriptions`, request.description);
        }
        
        if (request.tags && request.tags.length > 0) {
          formData.append(`tags`, JSON.stringify(request.tags));
        }
      });

      const response = await fetch(`${this.baseUrl}/upload/multiple`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في رفع الملفات: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error('فشل في رفع الملفات');
    }
  }

  // Get file by ID
  async getFile(id: string): Promise<ApiResponse<FileUpload>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في جلب الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching file:', error);
      throw new Error('فشل في جلب الملف');
    }
  }

  // Get files with search and pagination
  async getFiles(params?: FileSearchParams): Promise<PaginatedResponse<FileUpload>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              searchParams.append(key, JSON.stringify(value));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في جلب الملفات: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching files:', error);
      throw new Error('فشل في جلب الملفات');
    }
  }

  // Get files by entity
  async getFilesByEntity(entityType: string, entityId: string): Promise<ApiResponse<FileUpload[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/entity/${entityType}/${entityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في جلب ملفات الكيان: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching entity files:', error);
      throw new Error('فشل في جلب ملفات الكيان');
    }
  }

  // Update file metadata
  async updateFile(id: string, request: FileUpdateRequest): Promise<ApiResponse<FileUpload>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`خطأ في تحديث الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating file:', error);
      throw new Error('فشل في تحديث الملف');
    }
  }

  // Delete file
  async deleteFile(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في حذف الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('فشل في حذف الملف');
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في حذف الملفات: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw new Error('فشل في حذف الملفات');
    }
  }

  // Download file
  async downloadFile(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`خطأ في تحميل الملف: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('فشل في تحميل الملف');
    }
  }

  // Download multiple files as zip
  async downloadMultipleFiles(ids: string[]): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/download/zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في تحميل الملفات: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading multiple files:', error);
      throw new Error('فشل في تحميل الملفات');
    }
  }

  // Get file statistics
  async getFileStats(entityType?: string, entityId?: string): Promise<ApiResponse<FileStats>> {
    try {
      const searchParams = new URLSearchParams();
      if (entityType) searchParams.append('entityType', entityType);
      if (entityId) searchParams.append('entityId', entityId);

      const response = await fetch(`${this.baseUrl}/stats?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في جلب إحصائيات الملفات: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching file stats:', error);
      throw new Error('فشل في جلب إحصائيات الملفات');
    }
  }

  // Get file versions
  async getFileVersions(fileId: string): Promise<ApiResponse<FileVersion[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${fileId}/versions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في جلب إصدارات الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching file versions:', error);
      throw new Error('فشل في جلب إصدارات الملف');
    }
  }

  // Upload new version of file
  async uploadFileVersion(fileId: string, file: File, changeLog?: string): Promise<ApiResponse<FileVersion>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (changeLog) {
        formData.append('changeLog', changeLog);
      }

      const response = await fetch(`${this.baseUrl}/${fileId}/versions`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في رفع إصدار الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file version:', error);
      throw new Error('فشل في رفع إصدار الملف');
    }
  }

  // Restore file version
  async restoreFileVersion(fileId: string, versionId: string): Promise<ApiResponse<FileUpload>> {
    try {
      const response = await fetch(`${this.baseUrl}/${fileId}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في استعادة إصدار الملف: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error restoring file version:', error);
      throw new Error('فشل في استعادة إصدار الملف');
    }
  }

  // Search files
  async searchFiles(query: string, filters?: Partial<FileSearchParams>): Promise<PaginatedResponse<FileUpload>> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('search', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              searchParams.append(key, JSON.stringify(value));
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`خطأ في البحث عن الملفات: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching files:', error);
      throw new Error('فشل في البحث عن الملفات');
    }
  }

  // Get file preview URL
  getFilePreviewUrl(id: string): string {
    return `${this.baseUrl}/${id}/preview`;
  }

  // Get file thumbnail URL
  getFileThumbnailUrl(id: string): string {
    return `${this.baseUrl}/${id}/thumbnail`;
  }

  // Check if file type is supported for preview
  isPreviewSupported(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
    ];
    
    return supportedTypes.includes(mimeType);
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on mime type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.startsWith('text/')) return '📃';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    
    return '📁';
  }
}

export const fileApiService = new FileApiService();
export default fileApiService;