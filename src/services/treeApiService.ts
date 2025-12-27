import { supabase } from '@/integrations/supabase/client';
import { ProjectTreeResponse, PhaseNode, DeliverableNode } from '@/types/tree-system';

export class TreeApiService {
  private static instance: TreeApiService;

  public static getInstance(): TreeApiService {
    if (!TreeApiService.instance) {
      TreeApiService.instance = new TreeApiService();
    }
    return TreeApiService.instance;
  }

  /**
   * جلب شجرة المشروع الكاملة
   */
  async getProjectTree(projectId: string): Promise<ProjectTreeResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('project_tree_api_updated_2025_12_16_23_00', {
        body: { project_id: projectId },
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching project tree:', error);
        throw new Error('Failed to fetch project tree');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return data.data;
    } catch (error) {
      console.error('TreeApiService.getProjectTree error:', error);
      throw error;
    }
  }

  /**
   * تحديث البيانات
   */
  async refreshProjectTree(projectId: string): Promise<ProjectTreeResponse> {
    return this.getProjectTree(projectId);
  }

  /**
   * حساب التقدم الإجمالي للمشروع
   */
  calculateOverallProgress(phases: PhaseNode[], deliverables: DeliverableNode[]): number {
    const phasesProgress = phases.length > 0 ? 
      phases.reduce((sum, p) => sum + (p.progress || 0), 0) / phases.length : 0;
    
    const deliverablesProgress = deliverables.length > 0 ?
      deliverables.reduce((sum, d) => sum + (d.progress || 0), 0) / deliverables.length : 0;
    
    return Math.round((phasesProgress + deliverablesProgress) / 2);
  }

  /**
   * حساب إحصائيات المشروع
   */
  calculateProjectStats(phases: PhaseNode[], deliverables: DeliverableNode[]) {
    const totalActivities = phases.reduce((sum, p) => sum + (p.children?.length || 0), 0);
    const completedActivities = phases.reduce((sum, p) => 
      sum + (p.children?.filter(a => a.status === 'done').length || 0), 0
    );

    const totalParts = deliverables.reduce((sum, d) => sum + (d.children?.length || 0), 0);
    const completedParts = deliverables.reduce((sum, d) => 
      sum + (d.children?.filter(p => p.status === 'approved').length || 0), 0
    );

    const totalWeight = deliverables.reduce((sum, d) => sum + (d.weight || 0), 0);
    const completedWeight = deliverables
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + (d.weight || 0), 0);

    return {
      phases: {
        total: phases.length,
        completed: phases.filter(p => p.status === 'done').length,
        inProgress: phases.filter(p => p.status === 'in_progress').length
      },
      activities: {
        total: totalActivities,
        completed: completedActivities,
        completionRate: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
      },
      deliverables: {
        total: deliverables.length,
        completed: deliverables.filter(d => d.status === 'approved').length,
        inProgress: deliverables.filter(d => d.status === 'in_progress').length
      },
      parts: {
        total: totalParts,
        completed: completedParts,
        completionRate: totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0
      },
      weight: {
        total: totalWeight,
        completed: completedWeight,
        completionRate: totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
      }
    };
  }

  /**
   * البحث في الشجرة
   */
  searchInTree(
    phases: PhaseNode[], 
    deliverables: DeliverableNode[], 
    searchTerm: string
  ): { phases: PhaseNode[], deliverables: DeliverableNode[] } {
    const term = searchTerm.toLowerCase();
    
    const filteredPhases = phases.filter(phase => {
      const phaseMatch = phase.name.toLowerCase().includes(term) ||
                        (phase.description && phase.description.toLowerCase().includes(term));
      
      const activityMatch = phase.children?.some(activity => 
        activity.name.toLowerCase().includes(term) ||
        (activity.description && activity.description.toLowerCase().includes(term))
      );
      
      return phaseMatch || activityMatch;
    });

    const filteredDeliverables = deliverables.filter(deliverable => {
      const deliverableMatch = deliverable.name.toLowerCase().includes(term) ||
                              (deliverable.description && deliverable.description.toLowerCase().includes(term));
      
      const partMatch = deliverable.children?.some(part => 
        part.name.toLowerCase().includes(term) ||
        (part.description && part.description.toLowerCase().includes(term))
      );
      
      return deliverableMatch || partMatch;
    });

    return { phases: filteredPhases, deliverables: filteredDeliverables };
  }

  /**
   * تصفية حسب الحالة
   */
  filterByStatus(
    phases: PhaseNode[], 
    deliverables: DeliverableNode[], 
    status: string
  ): { phases: PhaseNode[], deliverables: DeliverableNode[] } {
    const filteredPhases = phases.filter(phase => phase.status === status);
    const filteredDeliverables = deliverables.filter(deliverable => deliverable.status === status);
    
    return { phases: filteredPhases, deliverables: filteredDeliverables };
  }

  /**
   * تصفية حسب المستخدم المكلف
   */
  filterByAssignee(
    phases: PhaseNode[], 
    deliverables: DeliverableNode[], 
    userId: string
  ): { phases: PhaseNode[], deliverables: DeliverableNode[] } {
    const filteredPhases = phases.filter(phase => 
      phase.children?.some(activity => activity.owner === userId)
    );
    
    const filteredDeliverables = deliverables.filter(deliverable => 
      deliverable.children?.some(part => part.assignedTo === userId)
    );
    
    return { phases: filteredPhases, deliverables: filteredDeliverables };
  }
}