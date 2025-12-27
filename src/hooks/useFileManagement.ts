import { useState, useCallback } from 'react';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  uploadDate: Date;
  url?: string;
  parentId?: string;
  mimeType?: string;
  description?: string;
}

export interface FileUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
}

export interface UseFileManagementReturn {
  files: FileItem[];
  uploadProgress: FileUploadProgress[];
  isUploading: boolean;
  selectedFiles: string[];
  currentFolder: string | null;
  uploadFiles: (files: FileList, parentId?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteMultipleFiles: (fileIds: string[]) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  moveFiles: (fileIds: string[], targetFolderId: string) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  downloadMultipleFiles: (fileIds: string[]) => Promise<void>;
  selectFile: (fileId: string) => void;
  selectMultipleFiles: (fileIds: string[]) => void;
  clearSelection: () => void;
  navigateToFolder: (folderId: string | null) => void;
  getFilesByFolder: (folderId?: string) => FileItem[];
  getFolderPath: (folderId?: string) => FileItem[];
  searchFiles: (query: string) => FileItem[];
  getFileSize: (size: number) => string;
  getFileIcon: (file: FileItem) => string;
  validateFile: (file: File) => { isValid: boolean; error?: string };
  cancelUpload: (fileId: string) => void;
  retryUpload: (fileId: string) => Promise<void>;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed'
];

export const useFileManagement = (): UseFileManagementReturn => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const validateFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح هو 50 ميجابايت'
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'نوع الملف غير مدعوم'
      };
    }

    return { isValid: true };
  }, []);

  const getFileSize = useCallback((size: number): string => {
    if (size < 1024) return `${size} بايت`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} كيلوبايت`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} ميجابايت`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} جيجابايت`;
  }, []);

  const getFileIcon = useCallback((file: FileItem): string => {
    if (file.type === 'folder') return '📁';
    
    if (!file.mimeType) return '📄';

    if (file.mimeType.startsWith('image/')) return '🖼️';
    if (file.mimeType === 'application/pdf') return '📕';
    if (file.mimeType.includes('word')) return '📘';
    if (file.mimeType.includes('excel') || file.mimeType.includes('sheet')) return '📗';
    if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) return '🗜️';
    if (file.mimeType === 'text/plain') return '📝';
    
    return '📄';
  }, []);

  const simulateUpload = useCallback(async (file: File, fileId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === fileId 
              ? { ...p, progress: Math.min(progress, 100) }
              : p
          )
        );

        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(prev => 
            prev.map(p => 
              p.fileId === fileId 
                ? { ...p, progress: 100, status: 'completed' }
                : p
            )
          );
          resolve(`/uploads/${fileId}_${file.name}`);
        }
      }, 200);

      // Simulate potential error
      if (Math.random() < 0.1) {
        setTimeout(() => {
          clearInterval(interval);
          setUploadProgress(prev => 
            prev.map(p => 
              p.fileId === fileId 
                ? { ...p, status: 'error', error: 'فشل في رفع الملف' }
                : p
            )
          );
          reject(new Error('فشل في رفع الملف'));
        }, 1000);
      }
    });
  }, []);

  const uploadFiles = useCallback(async (fileList: FileList, parentId?: string) => {
    const filesToUpload = Array.from(fileList);
    
    // Validate all files first
    for (const file of filesToUpload) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(`خطأ في الملف ${file.name}: ${validation.error}`);
        return;
      }
    }

    setIsUploading(true);

    const newProgressItems: FileUploadProgress[] = filesToUpload.map(file => ({
      fileId: generateId(),
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newProgressItems]);

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const fileId = newProgressItems[index].fileId;
        
        try {
          const url = await simulateUpload(file, fileId);
          
          const newFile: FileItem = {
            id: fileId,
            name: file.name,
            type: 'file',
            size: file.size,
            uploadDate: new Date(),
            url,
            parentId: parentId || currentFolder || undefined,
            mimeType: file.type,
            description: ''
          };

          setFiles(prev => [...prev, newFile]);
        } catch (error) {
          console.error(`فشل في رفع الملف ${file.name}:`, error);
        }
      });

      await Promise.allSettled(uploadPromises);
    } finally {
      setIsUploading(false);
      // Clear completed uploads after 3 seconds
      setTimeout(() => {
        setUploadProgress(prev => 
          prev.filter(p => !newProgressItems.some(n => n.fileId === p.fileId))
        );
      }, 3000);
    }
  }, [validateFile, generateId, simulateUpload, currentFolder]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles(prev => prev.filter(file => file.id !== fileId && file.parentId !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error('فشل في حذف الملف:', error);
      throw error;
    }
  }, []);

  const deleteMultipleFiles = useCallback(async (fileIds: string[]) => {
    try {
      await Promise.all(fileIds.map(id => deleteFile(id)));
    } catch (error) {
      console.error('فشل في حذف الملفات:', error);
      throw error;
    }
  }, [deleteFile]);

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    try {
      const newFolder: FileItem = {
        id: generateId(),
        name,
        type: 'folder',
        uploadDate: new Date(),
        parentId: parentId || currentFolder || undefined
      };

      setFiles(prev => [...prev, newFolder]);
    } catch (error) {
      console.error('فشل في إنشاء المجلد:', error);
      throw error;
    }
  }, [generateId, currentFolder]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId ? { ...file, name: newName } : file
        )
      );
    } catch (error) {
      console.error('فشل في إعادة تسمية الملف:', error);
      throw error;
    }
  }, []);

  const moveFiles = useCallback(async (fileIds: string[], targetFolderId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles(prev => 
        prev.map(file => 
          fileIds.includes(file.id) 
            ? { ...file, parentId: targetFolderId || undefined }
            : file
        )
      );
      
      setSelectedFiles([]);
    } catch (error) {
      console.error('فشل في نقل الملفات:', error);
      throw error;
    }
  }, []);

  const downloadFile = useCallback(async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file || !file.url) {
        throw new Error('الملف غير موجود');
      }

      // Simulate download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('فشل في تحميل الملف:', error);
      throw error;
    }
  }, [files]);

  const downloadMultipleFiles = useCallback(async (fileIds: string[]) => {
    try {
      // In a real implementation, this would create a zip file
      for (const fileId of fileIds) {
        await downloadFile(fileId);
        // Add delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('فشل في تحميل الملفات:', error);
      throw error;
    }
  }, [downloadFile]);

  const selectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const selectMultipleFiles = useCallback((fileIds: string[]) => {
    setSelectedFiles(fileIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
    clearSelection();
  }, [clearSelection]);

  const getFilesByFolder = useCallback((folderId?: string) => {
    return files.filter(file => file.parentId === folderId);
  }, [files]);

  const getFolderPath = useCallback((folderId?: string): FileItem[] => {
    if (!folderId) return [];
    
    const path: FileItem[] = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = files.find(f => f.id === currentId && f.type === 'folder');
      if (!folder) break;
      
      path.unshift(folder);
      currentId = folder.parentId;
    }
    
    return path;
  }, [files]);

  const searchFiles = useCallback((query: string): FileItem[] => {
    if (!query.trim()) return files;
    
    const lowercaseQuery = query.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(lowercaseQuery) ||
      file.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, [files]);

  const cancelUpload = useCallback((fileId: string) => {
    setUploadProgress(prev => 
      prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'cancelled' }
          : p
      )
    );
  }, []);

  const retryUpload = useCallback(async (fileId: string) => {
    setUploadProgress(prev => 
      prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'uploading', progress: 0, error: undefined }
          : p
      )
    );
    
    // In a real implementation, you would retry the actual upload
    // For now, we'll simulate it
    try {
      const file = new File([''], 'retry-file', { type: 'text/plain' });
      await simulateUpload(file, fileId);
    } catch (error) {
      console.error('فشل في إعادة المحاولة:', error);
    }
  }, [simulateUpload]);

  return {
    files,
    uploadProgress,
    isUploading,
    selectedFiles,
    currentFolder,
    uploadFiles,
    deleteFile,
    deleteMultipleFiles,
    createFolder,
    renameFile,
    moveFiles,
    downloadFile,
    downloadMultipleFiles,
    selectFile,
    selectMultipleFiles,
    clearSelection,
    navigateToFolder,
    getFilesByFolder,
    getFolderPath,
    searchFiles,
    getFileSize,
    getFileIcon,
    validateFile,
    cancelUpload,
    retryUpload
  };
};