import { supabase } from '@/integrations/supabase/client';
import { PhaseNode, ActivityNode } from '@/types/tree-system';

export class PhasesApiService {
  private static instance: PhasesApiService;

  public static getInstance(): PhasesApiService {
    if (!PhasesApiService.instance) {
      PhasesApiService.instance = new PhasesApiService();
    }
    return PhasesApiService.instance;
  }

  /**
   * إنشاء مرحلة جديدة
   */
  async createPhase(phaseData: {
    project_id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PhaseNode> {
    try {
      const { data, error } = await supabase.functions.invoke('phases_management_real_2025_12_16_23_00/phases', {
        body: phaseData,
        method: 'POST'
      });

      if (error) {
        console.error('Error creating phase:', error);
        throw new Error('Failed to create phase');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return this.formatPhaseData(data.data);
    } catch (error) {
      console.error('PhasesApiService.createPhase error:', error);
      throw error;
    }
  }

  /**
   * تحديث مرحلة
   */
  async updatePhase(phaseId: string, updates: {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<PhaseNode> {
    try {
      const { data, error } = await supabase.functions.invoke('phases_management_real_2025_12_16_23_00/phase', {
        body: updates,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error updating phase:', error);
        throw new Error('Failed to update phase');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return this.formatPhaseData(data.data);
    } catch (error) {
      console.error('PhasesApiService.updatePhase error:', error);
      throw error;
    }
  }

  /**
   * حذف مرحلة
   */
  async deletePhase(phaseId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('phases_management_real_2025_12_16_23_00/phase', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error deleting phase:', error);
        throw new Error('Failed to delete phase');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('PhasesApiService.deletePhase error:', error);
      throw error;
    }
  }

  /**
   * إنشاء نشاط جديد
   */
  async createActivity(activityData: {
    phase_id: string;
    name: string;
    description?: string;
    owner_id?: string;
    planned_start_date?: string;
    planned_end_date?: string;
  }): Promise<ActivityNode> {
    try {
      const { data, error } = await supabase.functions.invoke('phases_management_real_2025_12_16_23_00/activities', {
        body: activityData,
        method: 'POST'
      });

      if (error) {
        console.error('Error creating activity:', error);
        throw new Error('Failed to create activity');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return this.formatActivityData(data.data);
    } catch (error) {
      console.error('PhasesApiService.createActivity error:', error);
      throw error;
    }
  }

  /**
   * تحديث نشاط
   */
  async updateActivity(activityId: string, updates: {
    name?: string;
    description?: string;
    owner_id?: string;
    status?: string;
    progress_percentage?: number;
    planned_start_date?: string;
    planned_end_date?: string;
    actual_start_date?: string;
    actual_end_date?: string;
  }): Promise<ActivityNode> {
    try {
      const { data, error } = await supabase.functions.invoke('phases_management_real_2025_12_16_23_00/activity', {
        body: updates,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error updating activity:', error);
        throw new Error('Failed to update activity');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return this.formatActivityData(data.data);
    } catch (error) {
      console.error('PhasesApiService.updateActivity error:', error);
      throw error;
    }
  }

  /**
   * حذف نشاط
   */
  async deleteActivity(activityId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('phases_management_real_2025_12_16_23_00/activity', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error deleting activity:', error);
        throw new Error('Failed to delete activity');
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('PhasesApiService.deleteActivity error:', error);
      throw error;
    }
  }

  /**
   * تحديث تقدم النشاط
   */
  async updateActivityProgress(activityId: string, progress: number): Promise<ActivityNode> {
    return this.updateActivity(activityId, { 
      progress_percentage: progress,
      status: progress === 100 ? 'done' : progress > 0 ? 'in_progress' : 'not_started'
    });
  }

  /**
   * تحديث حالة النشاط
   */
  async updateActivityStatus(activityId: string, status: string): Promise<ActivityNode> {
    const updates: any = { status };
    
    // تحديث التواريخ الفعلية حسب الحالة
    if (status === 'in_progress') {
      updates.actual_start_date = new Date().toISOString();
    } else if (status === 'done') {
      updates.actual_end_date = new Date().toISOString();
      updates.progress_percentage = 100;
    }

    return this.updateActivity(activityId, updates);
  }

  /**
   * تنسيق بيانات المرحلة
   */
  private formatPhaseData(rawData: any): PhaseNode {
    return {
      id: rawData.id,
      name: rawData.name,
      type: 'phase',
      status: rawData.status,
      description: rawData.description,
      startDate: rawData.start_date,
      endDate: rawData.end_date,
      progress: 0, // سيتم حسابه من الأنشطة
      canEdit: true,
      canDelete: true,
      children: []
    };
  }

  /**
   * تنسيق بيانات النشاط
   */
  private formatActivityData(rawData: any): ActivityNode {
    return {
      id: rawData.id,
      name: rawData.name,
      type: 'activity',
      status: rawData.status,
      description: rawData.description,
      progress: rawData.progress_percentage,
      owner: rawData.owner_id,
      plannedStartDate: rawData.planned_start_date,
      plannedEndDate: rawData.planned_end_date,
      actualStartDate: rawData.actual_start_date,
      actualEndDate: rawData.actual_end_date,
      canEdit: true,
      canDelete: true
    };
  }

  /**
   * حساب تقدم المرحلة من الأنشطة
   */
  calculatePhaseProgress(activities: ActivityNode[]): number {
    if (activities.length === 0) return 0;
    
    const totalProgress = activities.reduce((sum, activity) => sum + (activity.progress || 0), 0);
    return Math.round(totalProgress / activities.length);
  }

  /**
   * التحقق من إمكانية حذف المرحلة
   */
  canDeletePhase(phase: PhaseNode): boolean {
    return !phase.children || phase.children.length === 0;
  }

  /**
   * الحصول على الأنشطة المتأخرة
   */
  getOverdueActivities(activities: ActivityNode[]): ActivityNode[] {
    const now = new Date();
    return activities.filter(activity => {
      if (!activity.plannedEndDate || activity.status === 'done') return false;
      return new Date(activity.plannedEndDate) < now;
    });
  }

  /**
   * الحصول على الأنشطة القادمة
   */
  getUpcomingActivities(activities: ActivityNode[], days: number = 7): ActivityNode[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return activities.filter(activity => {
      if (!activity.plannedStartDate || activity.status !== 'not_started') return false;
      const startDate = new Date(activity.plannedStartDate);
      return startDate >= now && startDate <= futureDate;
    });
  }
}