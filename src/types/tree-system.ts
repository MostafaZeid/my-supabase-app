// Base interfaces for tree structure
export interface BaseTreeNode {
  id: string;
  name: string;
  description?: string;
  weight: number;
  progress: number;
  status: TreeNodeStatus;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  children?: string[];
  metadata?: Record<string, any>;
}

// Tree node status enumeration
export enum TreeNodeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  REVIEW = 'review'
}

// Tree node types
export enum TreeNodeType {
  PROJECT = 'project',
  PHASE = 'phase',
  MILESTONE = 'milestone',
  TASK = 'task',
  DELIVERABLE = 'deliverable',
  SUBTASK = 'subtask'
}

// Project node interface
export interface ProjectNode extends BaseTreeNode {
  type: TreeNodeType.PROJECT;
  startDate: Date;
  endDate: Date;
  budget?: number;
  currency?: string;
  manager: string;
  team: string[];
  priority: ProjectPriority;
  tags: string[];
  phases: string[];
}

// Phase node interface
export interface PhaseNode extends BaseTreeNode {
  type: TreeNodeType.PHASE;
  projectId: string;
  startDate: Date;
  endDate: Date;
  dependencies: string[];
  milestones: string[];
  deliverables: string[];
  resources: PhaseResource[];
}

// Milestone node interface
export interface MilestoneNode extends BaseTreeNode {
  type: TreeNodeType.MILESTONE;
  phaseId: string;
  dueDate: Date;
  isKeyMilestone: boolean;
  criteria: string[];
  dependencies: string[];
  deliverables: string[];
}

// Task node interface
export interface TaskNode extends BaseTreeNode {
  type: TreeNodeType.TASK;
  assignee?: string;
  assignees: string[];
  startDate: Date;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  priority: TaskPriority;
  labels: string[];
  dependencies: string[];
  subtasks: string[];
}

// Deliverable node interface
export interface DeliverableNode extends BaseTreeNode {
  type: TreeNodeType.DELIVERABLE;
  deliverableType: DeliverableType;
  format: string;
  size?: number;
  version: string;
  approver: string;
  dueDate: Date;
  submittedDate?: Date;
  approvedDate?: Date;
  rejectionReason?: string;
  attachments: DeliverableAttachment[];
}

// Subtask node interface
export interface SubtaskNode extends BaseTreeNode {
  type: TreeNodeType.SUBTASK;
  taskId: string;
  assignee?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  isCompleted: boolean;
  completedAt?: Date;
}

// Union type for all tree nodes
export type TreeNode = ProjectNode | PhaseNode | MilestoneNode | TaskNode | DeliverableNode | SubtaskNode;

// Project priority enumeration
export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Task priority enumeration
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Deliverable type enumeration
export enum DeliverableType {
  DOCUMENT = 'document',
  SOFTWARE = 'software',
  DESIGN = 'design',
  REPORT = 'report',
  PRESENTATION = 'presentation',
  DATA = 'data',
  OTHER = 'other'
}

// Phase resource interface
export interface PhaseResource {
  id: string;
  name: string;
  type: ResourceType;
  allocation: number; // percentage
  cost?: number;
  availability: ResourceAvailability[];
}

// Resource type enumeration
export enum ResourceType {
  HUMAN = 'human',
  EQUIPMENT = 'equipment',
  SOFTWARE = 'software',
  FACILITY = 'facility',
  BUDGET = 'budget'
}

// Resource availability interface
export interface ResourceAvailability {
  startDate: Date;
  endDate: Date;
  availability: number; // percentage
}

// Deliverable attachment interface
export interface DeliverableAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Tree structure interface
export interface TreeStructure {
  nodes: Map<string, TreeNode>;
  rootNodes: string[];
  relationships: TreeRelationship[];
}

// Tree relationship interface
export interface TreeRelationship {
  id: string;
  parentId: string;
  childId: string;
  relationshipType: RelationshipType;
  weight?: number;
}

// Relationship type enumeration
export enum RelationshipType {
  PARENT_CHILD = 'parent_child',
  DEPENDENCY = 'dependency',
  REFERENCE = 'reference',
  BLOCKING = 'blocking'
}

// Tree view configuration
export interface TreeViewConfig {
  showWeights: boolean;
  showProgress: boolean;
  showStatus: boolean;
  showDates: boolean;
  showAssignees: boolean;
  expandedNodes: Set<string>;
  selectedNodes: Set<string>;
  filterCriteria: TreeFilterCriteria;
  sortCriteria: TreeSortCriteria;
  viewMode: TreeViewMode;
}

// Tree view mode enumeration
export enum TreeViewMode {
  HIERARCHICAL = 'hierarchical',
  FLAT = 'flat',
  GANTT = 'gantt',
  KANBAN = 'kanban',
  TIMELINE = 'timeline'
}

// Tree filter criteria interface
export interface TreeFilterCriteria {
  status?: TreeNodeStatus[];
  type?: TreeNodeType[];
  assignee?: string[];
  priority?: (ProjectPriority | TaskPriority)[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  progressRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  searchQuery?: string;
}

// Tree sort criteria interface
export interface TreeSortCriteria {
  field: TreeSortField;
  direction: SortDirection;
  secondaryField?: TreeSortField;
}

// Tree sort field enumeration
export enum TreeSortField {
  NAME = 'name',
  PROGRESS = 'progress',
  WEIGHT = 'weight',
  STATUS = 'status',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority'
}

// Sort direction enumeration
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

// Tree operations interface
export interface TreeOperations {
  addNode: (node: Omit<TreeNode, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNode: (id: string, updates: Partial<TreeNode>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  moveNode: (nodeId: string, newParentId?: string, position?: number) => Promise<void>;
  duplicateNode: (nodeId: string, includeChildren?: boolean) => Promise<string>;
  bulkUpdateNodes: (updates: Array<{ id: string; updates: Partial<TreeNode> }>) => Promise<void>;
}

// Tree statistics interface
export interface TreeStatistics {
  totalNodes: number;
  nodesByType: Record<TreeNodeType, number>;
  nodesByStatus: Record<TreeNodeStatus, number>;
  overallProgress: number;
  weightedProgress: number;
  completionRate: number;
  averageProgress: number;
  criticalPath: string[];
  blockedNodes: string[];
  overdueNodes: string[];
}

// Tree validation result interface
export interface TreeValidationResult {
  isValid: boolean;
  errors: TreeValidationError[];
  warnings: TreeValidationWarning[];
}

// Tree validation error interface
export interface TreeValidationError {
  nodeId: string;
  type: ValidationErrorType;
  message: string;
  severity: ValidationSeverity;
}

// Tree validation warning interface
export interface TreeValidationWarning {
  nodeId: string;
  type: ValidationWarningType;
  message: string;
}

// Validation error type enumeration
export enum ValidationErrorType {
  CIRCULAR_DEPENDENCY = 'circular_dependency',
  INVALID_WEIGHT = 'invalid_weight',
  INVALID_PROGRESS = 'invalid_progress',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  INVALID_DATE_RANGE = 'invalid_date_range',
  ORPHANED_NODE = 'orphaned_node',
  DUPLICATE_ID = 'duplicate_id'
}

// Validation warning type enumeration
export enum ValidationWarningType {
  UNBALANCED_WEIGHTS = 'unbalanced_weights',
  OVERDUE_TASK = 'overdue_task',
  HIGH_PROGRESS_VARIANCE = 'high_progress_variance',
  MISSING_ASSIGNEE = 'missing_assignee',
  LONG_TASK_DURATION = 'long_task_duration'
}

// Validation severity enumeration
export enum ValidationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Tree export format enumeration
export enum TreeExportFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  GANTT_CHART = 'gantt_chart'
}

// Tree import result interface
export interface TreeImportResult {
  success: boolean;
  importedNodes: number;
  skippedNodes: number;
  errors: TreeImportError[];
  warnings: string[];
  mapping: Record<string, string>; // old ID to new ID mapping
}

// Tree import error interface
export interface TreeImportError {
  row?: number;
  field?: string;
  value?: any;
  message: string;
  type: ImportErrorType;
}

// Import error type enumeration
export enum ImportErrorType {
  INVALID_FORMAT = 'invalid_format',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  INVALID_VALUE = 'invalid_value',
  DUPLICATE_ENTRY = 'duplicate_entry',
  REFERENCE_ERROR = 'reference_error'
}

// Tree search result interface
export interface TreeSearchResult {
  nodes: TreeNode[];
  totalCount: number;
  searchTime: number;
  suggestions: string[];
  facets: SearchFacets;
}

// Search facets interface
export interface SearchFacets {
  types: Record<TreeNodeType, number>;
  statuses: Record<TreeNodeStatus, number>;
  assignees: Record<string, number>;
  tags: Record<string, number>;
}

// Tree notification interface
export interface TreeNotification {
  id: string;
  type: NotificationType;
  nodeId: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
}

// Notification type enumeration
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  MILESTONE_REACHED = 'milestone_reached',
  STATUS_CHANGED = 'status_changed',
  COMMENT_ADDED = 'comment_added',
  APPROVAL_REQUIRED = 'approval_required'
}

// Notification priority enumeration
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Tree audit log interface
export interface TreeAuditLog {
  id: string;
  nodeId: string;
  action: AuditAction;
  userId: string;
  timestamp: Date;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

// Audit action enumeration
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MOVE = 'move',
  STATUS_CHANGE = 'status_change',
  PROGRESS_UPDATE = 'progress_update',
  ASSIGNMENT_CHANGE = 'assignment_change'
}

// Tree template interface
export interface TreeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: Omit<TreeNode, 'id' | 'createdAt' | 'updatedAt'>[];
  relationships: Omit<TreeRelationship, 'id'>[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  rating: number;
  tags: string[];
}

// Tree collaboration interface
export interface TreeCollaboration {
  nodeId: string;
  collaborators: TreeCollaborator[];
  permissions: TreePermissions;
  shareSettings: TreeShareSettings;
}

// Tree collaborator interface
export interface TreeCollaborator {
  userId: string;
  role: CollaboratorRole;
  permissions: string[];
  addedAt: Date;
  addedBy: string;
}

// Collaborator role enumeration
export enum CollaboratorRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  COMMENTER = 'commenter'
}

// Tree permissions interface
export interface TreePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canManagePermissions: boolean;
  canExport: boolean;
  canComment: boolean;
}

// Tree share settings interface
export interface TreeShareSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowDownload: boolean;
  expiresAt?: Date;
  password?: string;
  shareUrl: string;
}