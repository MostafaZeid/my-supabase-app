import { useState, useCallback, useMemo } from 'react';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  assigneeAvatar?: string;
  deliverableId: string;
  phaseId: string;
  projectId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  startDate: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0-100
  tags: string[];
  attachments: string[];
  comments: AssignmentComment[];
  dependencies: string[]; // Assignment IDs that this assignment depends on
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AssignmentComment {
  id: string;
  assignmentId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentFilter {
  status?: Assignment['status'][];
  priority?: Assignment['priority'][];
  assigneeId?: string[];
  phaseId?: string[];
  deliverableId?: string[];
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  search?: string;
}

export interface AssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageProgress: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  assigneeId: string;
  deliverableId: string;
  phaseId: string;
  projectId: string;
  priority: Assignment['priority'];
  dueDate: Date;
  startDate: Date;
  estimatedHours: number;
  tags?: string[];
  dependencies?: string[];
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: Assignment['status'];
  priority?: Assignment['priority'];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  tags?: string[];
  dependencies?: string[];
}

export interface AssignmentNotification {
  id: string;
  type: 'assignment_created' | 'assignment_updated' | 'assignment_completed' | 'assignment_overdue' | 'comment_added';
  assignmentId: string;
  assignmentTitle: string;
  message: string;
  recipientId: string;
  isRead: boolean;
  createdAt: Date;
}

export const useAssignmentsManagement = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AssignmentFilter>({});
  const [sortBy, setSortBy] = useState<keyof Assignment>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Create new assignment
  const createAssignment = useCallback(async (data: CreateAssignmentData): Promise<Assignment> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      const newAssignment: Assignment = {
        id: `assignment_${Date.now()}`,
        ...data,
        assigneeName: '', // Will be populated from user data
        assigneeEmail: '', // Will be populated from user data
        status: 'pending',
        progress: 0,
        actualHours: 0,
        attachments: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current_user_id', // Will be populated from auth context
      };

      setAssignments(prev => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      const errorMessage = 'فشل في إنشاء المهمة';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update assignment
  const updateAssignment = useCallback(async (id: string, data: UpdateAssignmentData): Promise<Assignment> => {
    setLoading(true);
    setError(null);

    try {
      const updatedAssignment = assignments.find(a => a.id === id);
      if (!updatedAssignment) {
        throw new Error('المهمة غير موجودة');
      }

      const updated: Assignment = {
        ...updatedAssignment,
        ...data,
        updatedAt: new Date(),
        completedDate: data.status === 'completed' ? new Date() : updatedAssignment.completedDate,
      };

      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      const errorMessage = 'فشل في تحديث المهمة';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [assignments]);

  // Delete assignment
  const deleteAssignment = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      const errorMessage = 'فشل في حذف المهمة';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk update assignments
  const bulkUpdateAssignments = useCallback(async (
    ids: string[],
    data: Partial<UpdateAssignmentData>
  ): Promise<Assignment[]> => {
    setLoading(true);
    setError(null);

    try {
      const updatedAssignments: Assignment[] = [];

      setAssignments(prev => prev.map(assignment => {
        if (ids.includes(assignment.id)) {
          const updated = {
            ...assignment,
            ...data,
            updatedAt: new Date(),
            completedDate: data.status === 'completed' ? new Date() : assignment.completedDate,
          };
          updatedAssignments.push(updated);
          return updated;
        }
        return assignment;
      }));

      return updatedAssignments;
    } catch (err) {
      const errorMessage = 'فشل في تحديث المهام';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add comment to assignment
  const addComment = useCallback(async (
    assignmentId: string,
    content: string
  ): Promise<AssignmentComment> => {
    setLoading(true);
    setError(null);

    try {
      const newComment: AssignmentComment = {
        id: `comment_${Date.now()}`,
        assignmentId,
        authorId: 'current_user_id',
        authorName: 'المستخدم الحالي',
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId
          ? { ...assignment, comments: [...assignment.comments, newComment] }
          : assignment
      ));

      return newComment;
    } catch (err) {
      const errorMessage = 'فشل في إضافة التعليق';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update assignment progress
  const updateProgress = useCallback(async (id: string, progress: number): Promise<void> => {
    if (progress < 0 || progress > 100) {
      throw new Error('نسبة التقدم يجب أن تكون بين 0 و 100');
    }

    await updateAssignment(id, {
      progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending',
    });
  }, [updateAssignment]);

  // Get filtered and sorted assignments
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    // Apply filters
    if (filter.status?.length) {
      filtered = filtered.filter(a => filter.status!.includes(a.status));
    }

    if (filter.priority?.length) {
      filtered = filtered.filter(a => filter.priority!.includes(a.priority));
    }

    if (filter.assigneeId?.length) {
      filtered = filtered.filter(a => filter.assigneeId!.includes(a.assigneeId));
    }

    if (filter.phaseId?.length) {
      filtered = filtered.filter(a => filter.phaseId!.includes(a.phaseId));
    }

    if (filter.deliverableId?.length) {
      filtered = filtered.filter(a => filter.deliverableId!.includes(a.deliverableId));
    }

    if (filter.dueDateRange) {
      filtered = filtered.filter(a => 
        a.dueDate >= filter.dueDateRange!.start && 
        a.dueDate <= filter.dueDateRange!.end
      );
    }

    if (filter.tags?.length) {
      filtered = filtered.filter(a => 
        filter.tags!.some(tag => a.tags.includes(tag))
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.assigneeName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assignments, filter, sortBy, sortOrder]);

  // Get overdue assignments
  const overdueAssignments = useMemo(() => {
    const now = new Date();
    return assignments.filter(a => 
      a.status !== 'completed' && 
      a.status !== 'cancelled' && 
      a.dueDate < now
    );
  }, [assignments]);

  // Get assignments by status
  const getAssignmentsByStatus = useCallback((status: Assignment['status']) => {
    return assignments.filter(a => a.status === status);
  }, [assignments]);

  // Get assignments by assignee
  const getAssignmentsByAssignee = useCallback((assigneeId: string) => {
    return assignments.filter(a => a.assigneeId === assigneeId);
  }, [assignments]);

  // Get assignments by deliverable
  const getAssignmentsByDeliverable = useCallback((deliverableId: string) => {
    return assignments.filter(a => a.deliverableId === deliverableId);
  }, [assignments]);

  // Calculate assignment statistics
  const assignmentStats = useMemo((): AssignmentStats => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const overdue = overdueAssignments.length;
    const cancelled = assignments.filter(a => a.status === 'cancelled').length;

    const byPriority = {
      low: assignments.filter(a => a.priority === 'low').length,
      medium: assignments.filter(a => a.priority === 'medium').length,
      high: assignments.filter(a => a.priority === 'high').length,
      urgent: assignments.filter(a => a.priority === 'urgent').length,
    };

    const averageProgress = total > 0 
      ? assignments.reduce((sum, a) => sum + a.progress, 0) / total 
      : 0;

    const totalEstimatedHours = assignments.reduce((sum, a) => sum + a.estimatedHours, 0);
    const totalActualHours = assignments.reduce((sum, a) => sum + a.actualHours, 0);

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      cancelled,
      byPriority,
      averageProgress,
      totalEstimatedHours,
      totalActualHours,
    };
  }, [assignments, overdueAssignments]);

  // Check if assignment can be started (dependencies met)
  const canStartAssignment = useCallback((assignmentId: string): boolean => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return false;

    return assignment.dependencies.every(depId => {
      const dependency = assignments.find(a => a.id === depId);
      return dependency?.status === 'completed';
    });
  }, [assignments]);

  // Get assignment dependencies
  const getAssignmentDependencies = useCallback((assignmentId: string): Assignment[] => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return [];

    return assignment.dependencies
      .map(depId => assignments.find(a => a.id === depId))
      .filter(Boolean) as Assignment[];
  }, [assignments]);

  // Get assignments that depend on this assignment
  const getDependentAssignments = useCallback((assignmentId: string): Assignment[] => {
    return assignments.filter(a => a.dependencies.includes(assignmentId));
  }, [assignments]);

  return {
    // State
    assignments: filteredAssignments,
    allAssignments: assignments,
    loading,
    error,
    filter,
    sortBy,
    sortOrder,

    // Actions
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkUpdateAssignments,
    addComment,
    updateProgress,

    // Filters and sorting
    setFilter,
    setSortBy,
    setSortOrder,

    // Getters
    overdueAssignments,
    getAssignmentsByStatus,
    getAssignmentsByAssignee,
    getAssignmentsByDeliverable,
    assignmentStats,

    // Dependencies
    canStartAssignment,
    getAssignmentDependencies,
    getDependentAssignments,

    // Utilities
    clearError: () => setError(null),
    refreshAssignments: () => {
      // Implement refresh logic here
      setLoading(true);
      // Simulate API call
      setTimeout(() => setLoading(false), 1000);
    },
  };
};

export default useAssignmentsManagement;