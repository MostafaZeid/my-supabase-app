import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TreeApiService } from '@/services/treeApiService';
import { PhasesApiService } from '@/services/phasesApiService';
import { ProjectTreeResponse, PhaseNode, DeliverableNode } from '@/types/tree-system';

interface UseProjectTreeReturn {
  // البيانات
  data: ProjectTreeResponse | null;
  phases: PhaseNode[];
  deliverables: DeliverableNode[];
  
  // حالة التحميل والأخطاء
  loading: boolean;
  error: string | null;
  
  // الإجراءات
  refreshData: () => Promise<void>;
  
  // إدارة المراحل
  createPhase: (phaseData: {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<void>;
  updatePhase: (phaseId: string, updates: any) => Promise<void>;
  deletePhase: (phaseId: string) => Promise<void>;
  
  // إدارة الأنشطة
  createActivity: (phaseId: string, activityData: {
    name: string;
    description?: string;
    owner_id?: string;
    planned_start_date?: string;
    planned_end_date?: string;
  }) => Promise<void>;
  updateActivity: (activityId: string, updates: any) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  
  // إدارة المخرجات
  createDeliverable: (deliverableData: {
    name: string;
    description?: string;
    weight_value: number;
    weight_unit: string;
  }) => Promise<void>;
  updateDeliverable: (deliverableId: string, updates: any) => Promise<void>;
  deleteDeliverable: (deliverableId: string) => Promise<void>;
  
  // إدارة الأجزاء
  createPart: (deliverableId: string, partData: {
    name: string;
    description?: string;
    weight_value: number;
    weight_unit: string;
  }) => Promise<void>;
  updatePart: (partId: string, updates: any) => Promise<void>;
  deletePart: (partId: string) => Promise<void>;
  
  // البحث والتصفية
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: { phases: PhaseNode[], deliverables: DeliverableNode[] };
  
  // إحصائيات
  stats: {
    phases: { total: number; completed: number; inProgress: number };
    activities: { total: number; completed: number; completionRate: number };
    deliverables: { total: number; completed: number; inProgress: number };
    parts: { total: number; completed: number; completionRate: number };
    weight: { total: number; completed: number; completionRate: number };
  };
}

export const useProjectTree = (projectId: string): UseProjectTreeReturn => {
  const { toast } = useToast();
  const [data, setData] = useState<ProjectTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const treeApiService = TreeApiService.getInstance();
  const phasesApiService = PhasesApiService.getInstance();

  // جلب البيانات
  const fetchData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await treeApiService.getProjectTree(projectId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, treeApiService, toast]);

  // تحديث البيانات
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // تحميل البيانات عند التهيئة
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // إدارة المراحل
  const createPhase = useCallback(async (phaseData: {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      await phasesApiService.createPhase({
        project_id: projectId,
        ...phaseData
      });
      
      toast({
        title: 'تم إنشاء المرحلة',
        description: `تم إنشاء المرحلة "${phaseData.name}" بنجاح`
      });
      
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء المرحلة';
      toast({
        title: 'خطأ في إنشاء المرحلة',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [projectId, phasesApiService, toast, refreshData]);

  const updatePhase = useCallback(async (phaseId: string, updates: any) => {
    try {
      await phasesApiService.updatePhase(phaseId, updates);
      
      toast({
        title: 'تم تحديث المرحلة',
        description: 'تم تحديث المرحلة بنجاح'
      });
      
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث المرحلة';
      toast({
        title: 'خطأ في تحديث المرحلة',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [phasesApiService, toast, refreshData]);

  const deletePhase = useCallback(async (phaseId: string) => {
    try {
      await phasesApiService.deletePhase(phaseId);
      
      toast({
        title: 'تم حذف المرحلة',
        description: 'تم حذف المرحلة بنجاح'
      });
      
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف المرحلة';
      toast({
        title: 'خطأ في حذف المرحلة',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [phasesApiService, toast, refreshData]);

  // إدارة الأنشطة
  const createActivity = useCallback(async (phaseId: string, activityData: {
    name: string;
    description?: string;
    owner_id?: string;
    planned_start_date?: string;
    planned_end_date?: string;
  }) => {
    try {
      await phasesApiService.createActivity({
        phase_id: phaseId,
        ...activityData
      });
      
      toast({
        title: 'تم إنشاء النشاط',
        description: `تم إنشاء النشاط "${activityData.name}" بنجاح`
      });
      
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء النشاط';
      toast({
        title: 'خطأ في إنشاء النشاط',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [phasesApiService, toast, refreshData]);

  const updateActivity = useCallback(async (activityId: string, updates: any) => {
    try {
      await phasesApiService.updateActivity(activityId, updates);
      
      toast({
        title: 'تم تحديث النشاط',
        description: 'تم تحديث النشاط بنجاح'
      });
      
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث النشاط';
      toast({
        title: 'خطأ في تحديث النشاط',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [phasesApiService, toast, refreshData]);

  const deleteActivity = useCallback(async (activityId: string) => {
    try {
      await phasesApiService.deleteActivity(activityId);
      
      toast({
        title: 'تم حذف النشاط',
        description: 'تم حذف النشاط بنجاح'
      });
      
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف النشاط';
      toast({
        title: 'خطأ في حذف النشاط',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [phasesApiService, toast, refreshData]);

  // إدارة المخرجات والأجزاء (سيتم تطبيقها لاحقاً)
  const createDeliverable = useCallback(async (deliverableData: any) => {
    // TODO: تطبيق API المخرجات
    toast({
      title: 'قيد التطوير',
      description: 'هذه الميزة قيد التطوير'
    });
  }, [toast]);

  const updateDeliverable = useCallback(async (deliverableId: string, updates: any) => {
    // TODO: تطبيق API المخرجات
    toast({
      title: 'قيد التطوير',
      description: 'هذه الميزة قيد التطوير'
    });
  }, [toast]);

  const deleteDeliverable = useCallback(async (deliverableId: string) => {
    // TODO: تطبيق API المخرجات
    toast({
      title: 'قيد التطوير',
      description: 'هذه الميزة قيد التطوير'
    });
  }, [toast]);

  const createPart = useCallback(async (deliverableId: string, partData: any) => {
    // TODO: تطبيق API الأجزاء
    toast({
      title: 'قيد التطوير',
      description: 'هذه الميزة قيد التطوير'
    });
  }, [toast]);

  const updatePart = useCallback(async (partId: string, updates: any) => {
    // TODO: تطبيق API الأجزاء
    toast({
      title: 'قيد التطوير',
      description: 'هذه الميزة قيد التطوير'
    });
  }, [toast]);

  const deletePart = useCallback(async (partId: string) => {
    // TODO: تطبيق API الأجزاء
    toast({
      title: 'قيد التطوير',
      description: 'هذه الميزة قيد التطوير'
    });
  }, [toast]);

  // البحث والتصفية
  const filteredData = useMemo(() => {
    if (!data || !searchTerm.trim()) {
      return {
        phases: data?.phases || [],
        deliverables: data?.deliverables || []
      };
    }
    
    return treeApiService.searchInTree(
      data.phases || [],
      data.deliverables || [],
      searchTerm
    );
  }, [data, searchTerm, treeApiService]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    if (!data) {
      return {
        phases: { total: 0, completed: 0, inProgress: 0 },
        activities: { total: 0, completed: 0, completionRate: 0 },
        deliverables: { total: 0, completed: 0, inProgress: 0 },
        parts: { total: 0, completed: 0, completionRate: 0 },
        weight: { total: 0, completed: 0, completionRate: 0 }
      };
    }
    
    return treeApiService.calculateProjectStats(data.phases || [], data.deliverables || []);
  }, [data, treeApiService]);

  return {
    // البيانات
    data,
    phases: data?.phases || [],
    deliverables: data?.deliverables || [],
    
    // حالة التحميل والأخطاء
    loading,
    error,
    
    // الإجراءات
    refreshData,
    
    // إدارة المراحل
    createPhase,
    updatePhase,
    deletePhase,
    
    // إدارة الأنشطة
    createActivity,
    updateActivity,
    deleteActivity,
    
    // إدارة المخرجات
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    
    // إدارة الأجزاء
    createPart,
    updatePart,
    deletePart,
    
    // البحث والتصفية
    searchTerm,
    setSearchTerm,
    filteredData,
    
    // إحصائيات
    stats
  };
};