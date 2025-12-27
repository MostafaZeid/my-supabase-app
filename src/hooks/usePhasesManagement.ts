import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Phase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  weight: number;
  progress: number;
  parentId?: string;
  order: number;
  color: string;
  assignedTo: string[];
  dependencies: string[];
  milestones: Milestone[];
  budget?: number;
  actualCost?: number;
  estimatedHours?: number;
  actualHours?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isCollapsed?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  weight: number;
}

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  phases: Omit<Phase, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[];
}

export interface PhaseFilter {
  status?: Phase['status'][];
  priority?: Phase['priority'][];
  assignedTo?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export interface PhaseStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  onHold: number;
  overdue: number;
  totalWeight: number;
  completedWeight: number;
  averageProgress: number;
  totalBudget: number;
  totalActualCost: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

const PHASE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const DEFAULT_PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    id: 'template-1',
    name: 'مشروع تطوير برمجي',
    description: 'قالب لمشاريع تطوير البرمجيات',
    phases: [
      {
        name: 'مرحلة التخطيط',
        description: 'تحليل المتطلبات والتخطيط',
        startDate: '',
        endDate: '',
        status: 'pending',
        weight: 20,
        progress: 0,
        order: 1,
        color: PHASE_COLORS[0],
        assignedTo: [],
        dependencies: [],
        milestones: [],
        priority: 'high',
        tags: ['تخطيط', 'تحليل'],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      },
      {
        name: 'مرحلة التصميم',
        description: 'تصميم واجهة المستخدم والنظام',
        startDate: '',
        endDate: '',
        status: 'pending',
        weight: 25,
        progress: 0,
        order: 2,
        color: PHASE_COLORS[1],
        assignedTo: [],
        dependencies: [],
        milestones: [],
        priority: 'high',
        tags: ['تصميم', 'واجهة'],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      },
      {
        name: 'مرحلة التطوير',
        description: 'تطوير وبرمجة النظام',
        startDate: '',
        endDate: '',
        status: 'pending',
        weight: 40,
        progress: 0,
        order: 3,
        color: PHASE_COLORS[2],
        assignedTo: [],
        dependencies: [],
        milestones: [],
        priority: 'critical',
        tags: ['تطوير', 'برمجة'],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      },
      {
        name: 'مرحلة الاختبار',
        description: 'اختبار وضمان الجودة',
        startDate: '',
        endDate: '',
        status: 'pending',
        weight: 15,
        progress: 0,
        order: 4,
        color: PHASE_COLORS[3],
        assignedTo: [],
        dependencies: [],
        milestones: [],
        priority: 'high',
        tags: ['اختبار', 'جودة'],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      }
    ]
  }
];

export const usePhasesManagement = (projectId: string) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [templates, setTemplates] = useState<PhaseTemplate[]>(DEFAULT_PHASE_TEMPLATES);
  const [filter, setFilter] = useState<PhaseFilter>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new phase
  const createPhase = useCallback(async (phaseData: Omit<Phase, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      setLoading(true);
      setError(null);

      const newPhase: Phase = {
        ...phaseData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user-id', // Replace with actual user ID
        color: phaseData.color || PHASE_COLORS[phases.length % PHASE_COLORS.length]
      };

      setPhases(prev => [...prev, newPhase].sort((a, b) => a.order - b.order));
      return newPhase;
    } catch (err) {
      setError('فشل في إنشاء المرحلة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phases.length]);

  // Update phase
  const updatePhase = useCallback(async (phaseId: string, updates: Partial<Phase>) => {
    try {
      setLoading(true);
      setError(null);

      setPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, ...updates, updatedAt: new Date().toISOString() }
          : phase
      ));
    } catch (err) {
      setError('فشل في تحديث المرحلة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete phase
  const deletePhase = useCallback(async (phaseId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Remove phase and its children
      setPhases(prev => prev.filter(phase => 
        phase.id !== phaseId && phase.parentId !== phaseId
      ));

      // Remove dependencies
      setPhases(prev => prev.map(phase => ({
        ...phase,
        dependencies: phase.dependencies.filter(dep => dep !== phaseId)
      })));
    } catch (err) {
      setError('فشل في حذف المرحلة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicate phase
  const duplicatePhase = useCallback(async (phaseId: string) => {
    try {
      setLoading(true);
      setError(null);

      const phaseToDuplicate = phases.find(p => p.id === phaseId);
      if (!phaseToDuplicate) {
        throw new Error('المرحلة غير موجودة');
      }

      const duplicatedPhase: Phase = {
        ...phaseToDuplicate,
        id: uuidv4(),
        name: `${phaseToDuplicate.name} - نسخة`,
        status: 'pending',
        progress: 0,
        order: Math.max(...phases.map(p => p.order)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dependencies: []
      };

      setPhases(prev => [...prev, duplicatedPhase]);
      return duplicatedPhase;
    } catch (err) {
      setError('فشل في نسخ المرحلة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phases]);

  // Reorder phases
  const reorderPhases = useCallback(async (phaseIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      setPhases(prev => {
        const reorderedPhases = [...prev];
        phaseIds.forEach((id, index) => {
          const phaseIndex = reorderedPhases.findIndex(p => p.id === id);
          if (phaseIndex !== -1) {
            reorderedPhases[phaseIndex].order = index + 1;
            reorderedPhases[phaseIndex].updatedAt = new Date().toISOString();
          }
        });
        return reorderedPhases.sort((a, b) => a.order - b.order);
      });
    } catch (err) {
      setError('فشل في إعادة ترتيب المراحل');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add milestone to phase
  const addMilestone = useCallback(async (phaseId: string, milestone: Omit<Milestone, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const newMilestone: Milestone = {
        ...milestone,
        id: uuidv4()
      };

      setPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              milestones: [...phase.milestones, newMilestone],
              updatedAt: new Date().toISOString()
            }
          : phase
      ));

      return newMilestone;
    } catch (err) {
      setError('فشل في إضافة المعلم');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update milestone
  const updateMilestone = useCallback(async (phaseId: string, milestoneId: string, updates: Partial<Milestone>) => {
    try {
      setLoading(true);
      setError(null);

      setPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              milestones: phase.milestones.map(milestone =>
                milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
              ),
              updatedAt: new Date().toISOString()
            }
          : phase
      ));
    } catch (err) {
      setError('فشل في تحديث المعلم');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete milestone
  const deleteMilestone = useCallback(async (phaseId: string, milestoneId: string) => {
    try {
      setLoading(true);
      setError(null);

      setPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              milestones: phase.milestones.filter(milestone => milestone.id !== milestoneId),
              updatedAt: new Date().toISOString()
            }
          : phase
      ));
    } catch (err) {
      setError('فشل في حذف المعلم');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create phase from template
  const createPhaseFromTemplate = useCallback(async (templateId: string, startDate: string) => {
    try {
      setLoading(true);
      setError(null);

      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('القالب غير موجود');
      }

      const baseOrder = Math.max(...phases.map(p => p.order), 0);
      const newPhases: Phase[] = template.phases.map((phaseTemplate, index) => ({
        ...phaseTemplate,
        id: uuidv4(),
        order: baseOrder + index + 1,
        startDate: startDate,
        endDate: startDate, // You might want to calculate this based on duration
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user-id'
      }));

      setPhases(prev => [...prev, ...newPhases].sort((a, b) => a.order - b.order));
      return newPhases;
    } catch (err) {
      setError('فشل في إنشاء المراحل من القالب');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phases, templates]);

  // Save as template
  const saveAsTemplate = useCallback(async (name: string, description: string, phaseIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const selectedPhases = phases.filter(p => phaseIds.includes(p.id));
      const templatePhases = selectedPhases.map(({ id, createdAt, updatedAt, createdBy, ...phase }) => phase);

      const newTemplate: PhaseTemplate = {
        id: uuidv4(),
        name,
        description,
        phases: templatePhases
      };

      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError('فشل في حفظ القالب');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [phases]);

  // Toggle phase collapse
  const togglePhaseCollapse = useCallback((phaseId: string) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, isCollapsed: !phase.isCollapsed }
        : phase
    ));
  }, []);

  // Filtered phases
  const filteredPhases = useMemo(() => {
    let filtered = [...phases];

    if (filter.status?.length) {
      filtered = filtered.filter(phase => filter.status!.includes(phase.status));
    }

    if (filter.priority?.length) {
      filtered = filtered.filter(phase => filter.priority!.includes(phase.priority));
    }

    if (filter.assignedTo?.length) {
      filtered = filtered.filter(phase => 
        phase.assignedTo.some(user => filter.assignedTo!.includes(user))
      );
    }

    if (filter.tags?.length) {
      filtered = filtered.filter(phase => 
        phase.tags.some(tag => filter.tags!.includes(tag))
      );
    }

    if (filter.dateRange) {
      filtered = filtered.filter(phase => {
        const phaseStart = new Date(phase.startDate);
        const phaseEnd = new Date(phase.endDate);
        const filterStart = new Date(filter.dateRange!.start);
        const filterEnd = new Date(filter.dateRange!.end);
        
        return phaseStart <= filterEnd && phaseEnd >= filterStart;
      });
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(phase => 
        phase.name.toLowerCase().includes(query) ||
        phase.description.toLowerCase().includes(query) ||
        phase.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => a.order - b.order);
  }, [phases, filter]);

  // Phase statistics
  const phaseStats = useMemo((): PhaseStats => {
    const total = phases.length;
    const completed = phases.filter(p => p.status === 'completed').length;
    const inProgress = phases.filter(p => p.status === 'in-progress').length;
    const pending = phases.filter(p => p.status === 'pending').length;
    const onHold = phases.filter(p => p.status === 'on-hold').length;
    
    const now = new Date();
    const overdue = phases.filter(p => 
      p.status !== 'completed' && new Date(p.endDate) < now
    ).length;

    const totalWeight = phases.reduce((sum, p) => sum + p.weight, 0);
    const completedWeight = phases
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.weight, 0);

    const averageProgress = total > 0 
      ? phases.reduce((sum, p) => sum + p.progress, 0) / total 
      : 0;

    const totalBudget = phases.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalActualCost = phases.reduce((sum, p) => sum + (p.actualCost || 0), 0);
    const totalEstimatedHours = phases.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
    const totalActualHours = phases.reduce((sum, p) => sum + (p.actualHours || 0), 0);

    return {
      total,
      completed,
      inProgress,
      pending,
      onHold,
      overdue,
      totalWeight,
      completedWeight,
      averageProgress,
      totalBudget,
      totalActualCost,
      totalEstimatedHours,
      totalActualHours
    };
  }, [phases]);

  // Get phase hierarchy
  const getPhaseHierarchy = useCallback(() => {
    const phaseMap = new Map(phases.map(phase => [phase.id, phase]));
    const rootPhases: Phase[] = [];
    const childrenMap = new Map<string, Phase[]>();

    phases.forEach(phase => {
      if (phase.parentId) {
        if (!childrenMap.has(phase.parentId)) {
          childrenMap.set(phase.parentId, []);
        }
        childrenMap.get(phase.parentId)!.push(phase);
      } else {
        rootPhases.push(phase);
      }
    });

    const buildHierarchy = (phase: Phase): Phase & { children: Phase[] } => ({
      ...phase,
      children: (childrenMap.get(phase.id) || [])
        .sort((a, b) => a.order - b.order)
        .map(buildHierarchy)
    });

    return rootPhases
      .sort((a, b) => a.order - b.order)
      .map(buildHierarchy);
  }, [phases]);

  return {
    // Data
    phases: filteredPhases,
    templates,
    phaseStats,
    loading,
    error,
    filter,

    // Actions
    createPhase,
    updatePhase,
    deletePhase,
    duplicatePhase,
    reorderPhases,
    
    // Milestones
    addMilestone,
    updateMilestone,
    deleteMilestone,
    
    // Templates
    createPhaseFromTemplate,
    saveAsTemplate,
    
    // UI
    togglePhaseCollapse,
    setFilter,
    
    // Utilities
    getPhaseHierarchy,
    
    // Constants
    PHASE_COLORS
  };
};

export default usePhasesManagement;