// File upload and management types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  uploadedBy: string;
  status: 'uploading' | 'completed' | 'failed' | 'processing';
  progress: number;
  url?: string;
  thumbnailUrl?: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for video/audio files
  pages?: number; // for PDF files
  encoding?: string;
  checksum?: string;
  tags?: string[];
  description?: string;
}

// File categories and organization
export interface FileCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  allowedTypes: string[];
  maxSize: number; // in bytes
  description?: string;
}

export interface FileFolder {
  id: string;
  name: string;
  parentId?: string;
  projectId: string;
  phaseId?: string;
  deliverableId?: string;
  createdAt: Date;
  createdBy: string;
  permissions: FolderPermissions;
  fileCount: number;
  totalSize: number;
}

export interface FolderPermissions {
  canRead: string[];
  canWrite: string[];
  canDelete: string[];
  isPublic: boolean;
}

// File operations and actions
export interface FileOperation {
  id: string;
  type: 'upload' | 'download' | 'delete' | 'move' | 'copy' | 'rename' | 'share';
  fileId: string;
  userId: string;
  timestamp: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface FileBatch {
  id: string;
  name: string;
  files: FileUpload[];
  totalSize: number;
  uploadProgress: number;
  status: 'preparing' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

// File sharing and permissions
export interface FileShare {
  id: string;
  fileId: string;
  sharedBy: string;
  sharedWith: string[];
  shareType: 'view' | 'edit' | 'download' | 'full';
  expiresAt?: Date;
  password?: string;
  downloadLimit?: number;
  downloadCount: number;
  isActive: boolean;
  createdAt: Date;
  accessLog: FileAccessLog[];
}

export interface FileAccessLog {
  id: string;
  userId: string;
  action: 'view' | 'download' | 'edit' | 'share';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// File versioning
export interface FileVersion {
  id: string;
  fileId: string;
  version: string;
  size: number;
  uploadDate: Date;
  uploadedBy: string;
  changeLog?: string;
  url: string;
  isActive: boolean;
  checksum: string;
}

// File search and filtering
export interface FileSearchCriteria {
  query?: string;
  category?: string;
  type?: string[];
  size?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  uploadedBy?: string[];
  tags?: string[];
  projectId?: string;
  phaseId?: string;
  deliverableId?: string;
}

export interface FileSearchResult {
  files: FileUpload[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    types: { name: string; count: number }[];
    uploaders: { name: string; count: number }[];
    tags: { name: string; count: number }[];
  };
}

// File storage and cloud integration
export interface StorageProvider {
  id: string;
  name: string;
  type: 'local' | 'aws-s3' | 'google-drive' | 'dropbox' | 'onedrive';
  isActive: boolean;
  config: StorageConfig;
  quota: StorageQuota;
}

export interface StorageConfig {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKey?: string;
  secretKey?: string;
  folder?: string;
}

export interface StorageQuota {
  total: number; // in bytes
  used: number;
  available: number;
  lastUpdated: Date;
}

// File management settings
export interface FileManagementSettings {
  maxFileSize: number;
  allowedTypes: string[];
  autoDeleteAfterDays?: number;
  enableVersioning: boolean;
  maxVersions: number;
  enableThumbnails: boolean;
  enableVirusScan: boolean;
  compressionEnabled: boolean;
  compressionQuality: number;
  watermarkEnabled: boolean;
  watermarkText?: string;
  defaultPermissions: FolderPermissions;
}

// File preview and viewer
export interface FilePreview {
  fileId: string;
  type: 'image' | 'pdf' | 'video' | 'audio' | 'document' | 'code' | 'text';
  previewUrl?: string;
  thumbnailUrl?: string;
  canPreview: boolean;
  requiresConversion: boolean;
  pages?: number;
  currentPage?: number;
}

// File comments and annotations
export interface FileComment {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  position?: {
    x: number;
    y: number;
    page?: number;
  };
  replies: FileCommentReply[];
  isResolved: boolean;
}

export interface FileCommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

// File analytics and reporting
export interface FileAnalytics {
  fileId: string;
  views: number;
  downloads: number;
  shares: number;
  comments: number;
  lastAccessed: Date;
  popularityScore: number;
  accessPattern: {
    date: string;
    views: number;
    downloads: number;
  }[];
}

export interface FileReport {
  id: string;
  name: string;
  type: 'usage' | 'storage' | 'activity' | 'security';
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: Record<string, any>;
  data: any[];
  generatedAt: Date;
  generatedBy: string;
}

// File management context and state
export interface FileManagementState {
  files: FileUpload[];
  folders: FileFolder[];
  currentFolder?: string;
  selectedFiles: string[];
  uploadQueue: FileBatch[];
  searchResults?: FileSearchResult;
  isLoading: boolean;
  error?: string;
  viewMode: 'grid' | 'list' | 'tree';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  filters: FileSearchCriteria;
}

export interface FileManagementActions {
  uploadFiles: (files: File[], folderId?: string) => Promise<void>;
  deleteFiles: (fileIds: string[]) => Promise<void>;
  moveFiles: (fileIds: string[], targetFolderId: string) => Promise<void>;
  copyFiles: (fileIds: string[], targetFolderId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  shareFiles: (fileIds: string[], shareConfig: Partial<FileShare>) => Promise<void>;
  searchFiles: (criteria: FileSearchCriteria) => Promise<void>;
  setViewMode: (mode: 'grid' | 'list' | 'tree') => void;
  setSortBy: (field: string, order: 'asc' | 'desc') => void;
  selectFiles: (fileIds: string[]) => void;
  clearSelection: () => void;
}

// File management hooks and utilities
export interface UseFileManagementOptions {
  projectId?: string;
  phaseId?: string;
  deliverableId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileProcessingJob {
  id: string;
  fileId: string;
  type: 'thumbnail' | 'preview' | 'conversion' | 'compression' | 'virus-scan';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

// Export all types
export type {
  FileUpload,
  FileMetadata,
  FileCategory,
  FileFolder,
  FolderPermissions,
  FileOperation,
  FileBatch,
  FileShare,
  FileAccessLog,
  FileVersion,
  FileSearchCriteria,
  FileSearchResult,
  StorageProvider,
  StorageConfig,
  StorageQuota,
  FileManagementSettings,
  FilePreview,
  FileComment,
  FileCommentReply,
  FileAnalytics,
  FileReport,
  FileManagementState,
  FileManagementActions,
  UseFileManagementOptions,
  FileValidationResult,
  FileProcessingJob
};