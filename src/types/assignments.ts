// Assignment status types
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

// Priority levels
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'urgent';

// Assignment types
export type AssignmentType = 'task' | 'milestone' | 'deliverable' | 'review' | 'approval';

// User role in assignment
export type AssignmentRole = 'assignee' | 'reviewer' | 'approver' | 'observer';

// File attachment interface
export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Comment interface
export interface AssignmentComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: AssignmentAttachment[];
}

// Time tracking interface
export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  createdAt: Date;
}

// Assignment participant interface
export interface AssignmentParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  role: AssignmentRole;
  assignedAt: Date;
  assignedBy: string;
}

// Progress tracking interface
export interface AssignmentProgress {
  percentage: number;
  lastUpdated: Date;
  updatedBy: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
    weight: number;
  }[];
}

// Assignment dependencies
export interface AssignmentDependency {
  id: string;
  dependsOnId: string;
  dependsOnTitle: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag?: number; // in days
}

// Main assignment interface
export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Assignment details
  estimatedHours?: number;
  actualHours?: number;
  weight: number; // for progress calculation
  
  // People
  createdBy: string;
  participants: AssignmentParticipant[];
  
  // Project association
  projectId: string;
  phaseId?: string;
  parentAssignmentId?: string;
  
  // Progress and tracking
  progress: AssignmentProgress;
  timeEntries: TimeEntry[];
  
  // Communication
  comments: AssignmentComment[];
  attachments: AssignmentAttachment[];
  
  // Dependencies
  dependencies: AssignmentDependency[];
  
  // Additional metadata
  tags: string[];
  customFields?: Record<string, any>;
}

// Assignment creation/update DTOs
export interface CreateAssignmentDto {
  title: string;
  description: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  weight: number;
  projectId: string;
  phaseId?: string;
  parentAssignmentId?: string;
  participantIds: string[];
  dependencies?: Omit<AssignmentDependency, 'id'>[];
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {
  id: string;
  status?: AssignmentStatus;
  progress?: number;
}

// Assignment filters and search
export interface AssignmentFilters {
  status?: AssignmentStatus[];
  priority?: AssignmentPriority[];
  type?: AssignmentType[];
  assigneeId?: string;
  projectId?: string;
  phaseId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  tags?: string[];
  search?: string;
}

// Assignment sorting options
export type AssignmentSortField = 'title' | 'dueDate' | 'priority' | 'status' | 'progress' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface AssignmentSort {
  field: AssignmentSortField;
  direction: SortDirection;
}

// Assignment statistics
export interface AssignmentStats {
  total: number;
  byStatus: Record<AssignmentStatus, number>;
  byPriority: Record<AssignmentPriority, number>;
  byType: Record<AssignmentType, number>;
  overdue: number;
  completedThisWeek: number;
  completedThisMonth: number;
  averageCompletionTime: number; // in days
  totalEstimatedHours: number;
  totalActualHours: number;
}

// Assignment notification types
export type AssignmentNotificationType = 
  | 'assigned'
  | 'due_soon'
  | 'overdue'
  | 'completed'
  | 'comment_added'
  | 'status_changed'
  | 'dependency_completed';

export interface AssignmentNotification {
  id: string;
  type: AssignmentNotificationType;
  assignmentId: string;
  assignmentTitle: string;
  message: string;
  recipientId: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Assignment template for recurring tasks
export interface AssignmentTemplate {
  id: string;
  name: string;
  description: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  estimatedHours?: number;
  weight: number;
  defaultParticipantRoles: AssignmentRole[];
  tags: string[];
  customFields?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

// Bulk operations
export interface BulkAssignmentOperation {
  assignmentIds: string[];
  operation: 'update_status' | 'assign_user' | 'set_priority' | 'add_tags' | 'delete';
  data: any;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

// Assignment calendar event
export interface AssignmentCalendarEvent {
  id: string;
  assignmentId: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
}

// Assignment report data
export interface AssignmentReport {
  id: string;
  name: string;
  type: 'productivity' | 'timeline' | 'workload' | 'completion_rate';
  filters: AssignmentFilters;
  dateRange: {
    from: Date;
    to: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

// Assignment workflow state
export interface AssignmentWorkflow {
  id: string;
  name: string;
  states: {
    status: AssignmentStatus;
    allowedTransitions: AssignmentStatus[];
    requiredRole?: AssignmentRole;
    autoTransitionConditions?: any;
  }[];
  isDefault: boolean;
  projectId?: string;
}

// Assignment activity log
export interface AssignmentActivity {
  id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress?: string;
}

// Assignment export options
export interface AssignmentExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  filters: AssignmentFilters;
  fields: string[];
  includeComments: boolean;
  includeAttachments: boolean;
  includeTimeEntries: boolean;
}