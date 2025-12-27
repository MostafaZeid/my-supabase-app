import { useState, useCallback, useMemo } from 'react';

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  phaseId: string;
  weight: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  completedDate?: Date;
  assigneeId?: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  dependencies: string[];
  tags: string[];
  files: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverableFormData {
  name: string;
  description: string;
  phaseId: string;
  weight: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  assigneeId?: string;
  estimatedHours: number;
  dependencies: string[];
  tags: string[];
}

export interface DeliverableFilters {
  status?: Deliverable['status'][];
  priority?: Deliverable['priority'][];
  phaseId?: string;
  assigneeId?: string;
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  search?: string;
}

export interface DeliverableStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageProgress: number;
  totalWeight: number;
  completedWeight: number;
  weightedProgress: number;
}

export interface UseDeliverablesManagementReturn {
  deliverables: Deliverable[];
  filteredDeliverables: Deliverable[];
  stats: DeliverableStats;
  filters: DeliverableFilters;
  isLoading: boolean;
  error: string | null;
  
  // CRUD operations
  createDeliverable: (data: DeliverableFormData) => Promise<Deliverable>;
  updateDeliverable: (id: string, data: Partial<DeliverableFormData>) => Promise<void>;
  deleteDeliverable: (id: string) => Promise<void>;
  duplicateDeliverable: (id: string) => Promise<Deliverable>;
  
  // Status and progress management
  updateDeliverableStatus: (id: string, status: Deliverable['status']) => Promise<void>;
  updateDeliverableProgress: (id: string, progress: number) => Promise<void>;
  markDeliverableComplete: (id: string) => Promise<void>;
  
  // Filtering and sorting
  setFilters: (filters: Partial<DeliverableFilters>) => void;
  clearFilters: () => void;
  sortDeliverables: (field: keyof Deliverable, direction: 'asc' | 'desc') => void;
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: Deliverable['status']) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkAssign: (ids: string[], assigneeId: string) => Promise<void>;
  
  // Dependencies management
  addDependency: (deliverableId: string, dependencyId: string) => Promise<void>;
  removeDependency: (deliverableId: string, dependencyId: string) => Promise<void>;
  getDependencyChain: (deliverableId: string) => Deliverable[];
  validateDependencies: (deliverableId: string, newDependencies: string[]) => boolean;
  
  // Time tracking
  logTime: (deliverableId: string, hours: number, description?: string) => Promise<void>;
  getTimeEntries: (deliverableId: string) => any[];
  
  // Utility functions
  getDeliverableById: (id: string) => Deliverable | undefined;
  getDeliverablesByPhase: (phaseId: string) => Deliverable[];
  getOverdueDeliverables: () => Deliverable[];
  getUpcomingDeliverables: (days: number) => Deliverable[];
  calculatePhaseProgress: (phaseId: string) => number;
  
  // Export and import
  exportDeliverables: (format: 'csv' | 'excel' | 'json') => Promise<void>;
  importDeliverables: (file: File) => Promise<void>;
}

export const useDeliverablesManagement = (): UseDeliverablesManagementReturn => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [filters, setFiltersState] = useState<DeliverableFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Deliverable>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate filtered deliverables
  const filteredDeliverables = useMemo(() => {
    let filtered = [...deliverables];

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(d => filters.status!.includes(d.status));
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(d => filters.priority!.includes(d.priority));
    }

    // Apply phase filter
    if (filters.phaseId) {
      filtered = filtered.filter(d => d.phaseId === filters.phaseId);
    }

    // Apply assignee filter
    if (filters.assigneeId) {
      filtered = filtered.filter(d => d.assigneeId === filters.assigneeId);
    }

    // Apply due date range filter
    if (filters.dueDateRange) {
      filtered = filtered.filter(d => 
        d.dueDate >= filters.dueDateRange!.start && 
        d.dueDate <= filters.dueDateRange!.end
      );
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(d => 
        filters.tags!.some(tag => d.tags.includes(tag))
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchLower) ||
        d.description.toLowerCase().includes(searchLower) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [deliverables, filters, sortField, sortDirection]);

  // Calculate statistics
  const stats = useMemo((): DeliverableStats => {
    const total = deliverables.length;
    const completed = deliverables.filter(d => d.status === 'completed').length;
    const inProgress = deliverables.filter(d => d.status === 'in-progress').length;
    const pending = deliverables.filter(d => d.status === 'pending').length;
    const overdue = deliverables.filter(d => 
      d.status !== 'completed' && d.dueDate < new Date()
    ).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const averageProgress = total > 0 
      ? deliverables.reduce((sum, d) => sum + d.progress, 0) / total 
      : 0;

    const totalWeight = deliverables.reduce((sum, d) => sum + d.weight, 0);
    const completedWeight = deliverables
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.weight, 0);
    
    const weightedProgress = totalWeight > 0 
      ? deliverables.reduce((sum, d) => sum + (d.progress * d.weight), 0) / totalWeight
      : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate,
      averageProgress,
      totalWeight,
      completedWeight,
      weightedProgress
    };
  }, [deliverables]);

  // CRUD operations
  const createDeliverable = useCallback(async (data: DeliverableFormData): Promise<Deliverable> => {
    setIsLoading(true);
    setError(null);

    try {
      const newDeliverable: Deliverable = {
        id: `deliverable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        status: 'pending',
        progress: 0,
        actualHours: 0,
        files: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedDate: undefined
      };

      setDeliverables(prev => [...prev, newDeliverable]);
      return newDeliverable;
    } catch (err) {
      setError('فشل في إنشاء المخرج');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDeliverable = useCallback(async (id: string, data: Partial<DeliverableFormData>): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setDeliverables(prev => prev.map(deliverable => 
        deliverable.id === id 
          ? { ...deliverable, ...data, updatedAt: new Date() }
          : deliverable
      ));
    } catch (err) {
      setError('فشل في تحديث المخرج');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDeliverable = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove dependencies referencing this deliverable
      setDeliverables(prev => prev
        .filter(d => d.id !== id)
        .map(d => ({
          ...d,
          dependencies: d.dependencies.filter(depId => depId !== id)
        }))
      );
    } catch (err) {
      setError('فشل في حذف المخرج');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateDeliverable = useCallback(async (id: string): Promise<Deliverable> => {
    const original = deliverables.find(d => d.id === id);
    if (!original) {
      throw new Error('المخرج غير موجود');
    }

    const duplicated: Deliverable = {
      ...original,
      id: `deliverable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${original.name} (نسخة)`,
      status: 'pending',
      progress: 0,
      actualHours: 0,
      completedDate: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setDeliverables(prev => [...prev, duplicated]);
    return duplicated;
  }, [deliverables]);

  // Status and progress management
  const updateDeliverableStatus = useCallback(async (id: string, status: Deliverable['status']): Promise<void> => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === id 
        ? { 
            ...deliverable, 
            status,
            progress: status === 'completed' ? 100 : deliverable.progress,
            completedDate: status === 'completed' ? new Date() : undefined,
            updatedAt: new Date()
          }
        : deliverable
    ));
  }, []);

  const updateDeliverableProgress = useCallback(async (id: string, progress: number): Promise<void> => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === id 
        ? { 
            ...deliverable, 
            progress: clampedProgress,
            status: clampedProgress === 100 ? 'completed' : 
                   clampedProgress > 0 ? 'in-progress' : 'pending',
            completedDate: clampedProgress === 100 ? new Date() : undefined,
            updatedAt: new Date()
          }
        : deliverable
    ));
  }, []);

  const markDeliverableComplete = useCallback(async (id: string): Promise<void> => {
    await updateDeliverableStatus(id, 'completed');
  }, [updateDeliverableStatus]);

  // Filtering and sorting
  const setFilters = useCallback((newFilters: Partial<DeliverableFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const sortDeliverables = useCallback((field: keyof Deliverable, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Bulk operations
  const bulkUpdateStatus = useCallback(async (ids: string[], status: Deliverable['status']): Promise<void> => {
    setDeliverables(prev => prev.map(deliverable => 
      ids.includes(deliverable.id)
        ? { 
            ...deliverable, 
            status,
            progress: status === 'completed' ? 100 : deliverable.progress,
            completedDate: status === 'completed' ? new Date() : undefined,
            updatedAt: new Date()
          }
        : deliverable
    ));
  }, []);

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    setDeliverables(prev => prev
      .filter(d => !ids.includes(d.id))
      .map(d => ({
        ...d,
        dependencies: d.dependencies.filter(depId => !ids.includes(depId))
      }))
    );
  }, []);

  const bulkAssign = useCallback(async (ids: string[], assigneeId: string): Promise<void> => {
    setDeliverables(prev => prev.map(deliverable => 
      ids.includes(deliverable.id)
        ? { ...deliverable, assigneeId, updatedAt: new Date() }
        : deliverable
    ));
  }, []);

  // Dependencies management
  const addDependency = useCallback(async (deliverableId: string, dependencyId: string): Promise<void> => {
    if (deliverableId === dependencyId) {
      throw new Error('لا يمكن للمخرج أن يعتمد على نفسه');
    }

    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId
        ? { 
            ...deliverable, 
            dependencies: [...new Set([...deliverable.dependencies, dependencyId])],
            updatedAt: new Date()
          }
        : deliverable
    ));
  }, []);

  const removeDependency = useCallback(async (deliverableId: string, dependencyId: string): Promise<void> => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId
        ? { 
            ...deliverable, 
            dependencies: deliverable.dependencies.filter(id => id !== dependencyId),
            updatedAt: new Date()
          }
        : deliverable
    ));
  }, []);

  const getDependencyChain = useCallback((deliverableId: string): Deliverable[] => {
    const visited = new Set<string>();
    const chain: Deliverable[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deliverable = deliverables.find(d => d.id === id);
      if (deliverable) {
        chain.push(deliverable);
        deliverable.dependencies.forEach(traverse);
      }
    };

    traverse(deliverableId);
    return chain;
  }, [deliverables]);

  const validateDependencies = useCallback((deliverableId: string, newDependencies: string[]): boolean => {
    // Check for circular dependencies
    const wouldCreateCycle = (targetId: string, depId: string, visited = new Set<string>()): boolean => {
      if (visited.has(depId)) return true;
      if (depId === targetId) return true;

      visited.add(depId);
      const dep = deliverables.find(d => d.id === depId);
      if (dep) {
        return dep.dependencies.some(subDepId => wouldCreateCycle(targetId, subDepId, visited));
      }
      return false;
    };

    return !newDependencies.some(depId => wouldCreateCycle(deliverableId, depId));
  }, [deliverables]);

  // Time tracking
  const logTime = useCallback(async (deliverableId: string, hours: number, description?: string): Promise<void> => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId
        ? { 
            ...deliverable, 
            actualHours: deliverable.actualHours + hours,
            updatedAt: new Date()
          }
        : deliverable
    ));
  }, []);

  const getTimeEntries = useCallback((deliverableId: string): any[] => {
    // This would typically fetch from a separate time entries store
    return [];
  }, []);

  // Utility functions
  const getDeliverableById = useCallback((id: string): Deliverable | undefined => {
    return deliverables.find(d => d.id === id);
  }, [deliverables]);

  const getDeliverablesByPhase = useCallback((phaseId: string): Deliverable[] => {
    return deliverables.filter(d => d.phaseId === phaseId);
  }, [deliverables]);

  const getOverdueDeliverables = useCallback((): Deliverable[] => {
    const now = new Date();
    return deliverables.filter(d => 
      d.status !== 'completed' && d.dueDate < now
    );
  }, [deliverables]);

  const getUpcomingDeliverables = useCallback((days: number): Deliverable[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return deliverables.filter(d => 
      d.status !== 'completed' && 
      d.dueDate >= now && 
      d.dueDate <= futureDate
    );
  }, [deliverables]);

  const calculatePhaseProgress = useCallback((phaseId: string): number => {
    const phaseDeliverables = deliverables.filter(d => d.phaseId === phaseId);
    if (phaseDeliverables.length === 0) return 0;

    const totalWeight = phaseDeliverables.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedProgress = phaseDeliverables.reduce((sum, d) => 
      sum + (d.progress * d.weight), 0
    );

    return weightedProgress / totalWeight;
  }, [deliverables]);

  // Export and import
  const exportDeliverables = useCallback(async (format: 'csv' | 'excel' | 'json'): Promise<void> => {
    // Implementation would depend on the specific export library used
    console.log(`تصدير المخرجات بصيغة ${format}`);
  }, []);

  const importDeliverables = useCallback(async (file: File): Promise<void> => {
    // Implementation would depend on the specific import library used
    console.log('استيراد المخرجات من الملف:', file.name);
  }, []);

  return {
    deliverables,
    filteredDeliverables,
    stats,
    filters,
    isLoading,
    error,
    
    // CRUD operations
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    duplicateDeliverable,
    
    // Status and progress management
    updateDeliverableStatus,
    updateDeliverableProgress,
    markDeliverableComplete,
    
    // Filtering and sorting
    setFilters,
    clearFilters,
    sortDeliverables,
    
    // Bulk operations
    bulkUpdateStatus,
    bulkDelete,
    bulkAssign,
    
    // Dependencies management
    addDependency,
    removeDependency,
    getDependencyChain,
    validateDependencies,
    
    // Time tracking
    logTime,
    getTimeEntries,
    
    // Utility functions
    getDeliverableById,
    getDeliverablesByPhase,
    getOverdueDeliverables,
    getUpcomingDeliverables,
    calculatePhaseProgress,
    
    // Export and import
    exportDeliverables,
    importDeliverables
  };
};