import { useMemo } from 'react';

export interface ProgressItem {
  id: string;
  name: string;
  weight: number;
  completionPercentage: number;
  type: 'phase' | 'deliverable' | 'assignment';
  parentId?: string;
  children?: ProgressItem[];
}

export interface ProgressCalculationResult {
  totalProgress: number;
  weightedProgress: number;
  completedItems: number;
  totalItems: number;
  phaseProgress: Record<string, number>;
  deliverableProgress: Record<string, number>;
  criticalPath: ProgressItem[];
  bottlenecks: ProgressItem[];
  progressTrend: 'improving' | 'declining' | 'stable';
  estimatedCompletion: Date | null;
}

export interface UseProgressCalculationProps {
  items: ProgressItem[];
  historicalData?: Array<{
    date: Date;
    progress: number;
  }>;
  targetCompletionDate?: Date;
}

export const useProgressCalculation = ({
  items,
  historicalData = [],
  targetCompletionDate
}: UseProgressCalculationProps) => {
  const progressCalculation = useMemo((): ProgressCalculationResult => {
    // Calculate total weighted progress
    const calculateWeightedProgress = (itemList: ProgressItem[]): number => {
      if (itemList.length === 0) return 0;

      const totalWeight = itemList.reduce((sum, item) => sum + item.weight, 0);
      if (totalWeight === 0) return 0;

      const weightedSum = itemList.reduce((sum, item) => {
        const itemProgress = item.children && item.children.length > 0
          ? calculateWeightedProgress(item.children)
          : item.completionPercentage;
        return sum + (itemProgress * item.weight);
      }, 0);

      return weightedSum / totalWeight;
    };

    // Calculate simple progress (unweighted)
    const calculateSimpleProgress = (itemList: ProgressItem[]): number => {
      if (itemList.length === 0) return 0;

      const flatItems = flattenItems(itemList);
      const leafItems = flatItems.filter(item => !item.children || item.children.length === 0);
      
      if (leafItems.length === 0) return 0;

      const totalProgress = leafItems.reduce((sum, item) => sum + item.completionPercentage, 0);
      return totalProgress / leafItems.length;
    };

    // Flatten nested items
    const flattenItems = (itemList: ProgressItem[]): ProgressItem[] => {
      const flattened: ProgressItem[] = [];
      
      const flatten = (items: ProgressItem[]) => {
        items.forEach(item => {
          flattened.push(item);
          if (item.children && item.children.length > 0) {
            flatten(item.children);
          }
        });
      };

      flatten(itemList);
      return flattened;
    };

    // Count completed and total items
    const countItems = (itemList: ProgressItem[]) => {
      const flatItems = flattenItems(itemList);
      const leafItems = flatItems.filter(item => !item.children || item.children.length === 0);
      
      const completed = leafItems.filter(item => item.completionPercentage >= 100).length;
      const total = leafItems.length;

      return { completed, total };
    };

    // Calculate progress by type
    const calculateProgressByType = (itemList: ProgressItem[], type: string) => {
      const typeItems = flattenItems(itemList).filter(item => item.type === type);
      const progressMap: Record<string, number> = {};

      typeItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          progressMap[item.id] = calculateWeightedProgress(item.children);
        } else {
          progressMap[item.id] = item.completionPercentage;
        }
      });

      return progressMap;
    };

    // Find critical path (items with lowest progress that affect overall completion)
    const findCriticalPath = (itemList: ProgressItem[]): ProgressItem[] => {
      const flatItems = flattenItems(itemList);
      const sortedByProgress = flatItems
        .filter(item => item.completionPercentage < 100)
        .sort((a, b) => {
          // Sort by weight (descending) then by progress (ascending)
          if (a.weight !== b.weight) {
            return b.weight - a.weight;
          }
          return a.completionPercentage - b.completionPercentage;
        });

      return sortedByProgress.slice(0, Math.min(5, sortedByProgress.length));
    };

    // Find bottlenecks (items significantly behind schedule)
    const findBottlenecks = (itemList: ProgressItem[]): ProgressItem[] => {
      const flatItems = flattenItems(itemList);
      const averageProgress = calculateSimpleProgress(itemList);
      
      return flatItems.filter(item => {
        const progressDifference = averageProgress - item.completionPercentage;
        return progressDifference > 20 && item.weight > 0; // More than 20% behind average
      });
    };

    // Calculate progress trend
    const calculateProgressTrend = (): 'improving' | 'declining' | 'stable' => {
      if (historicalData.length < 2) return 'stable';

      const sortedData = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());
      const recent = sortedData.slice(-3); // Last 3 data points

      if (recent.length < 2) return 'stable';

      const firstProgress = recent[0].progress;
      const lastProgress = recent[recent.length - 1].progress;
      const difference = lastProgress - firstProgress;

      if (difference > 2) return 'improving';
      if (difference < -2) return 'declining';
      return 'stable';
    };

    // Estimate completion date
    const estimateCompletion = (): Date | null => {
      if (historicalData.length < 2 || !targetCompletionDate) return null;

      const sortedData = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());
      const recent = sortedData.slice(-5); // Last 5 data points

      if (recent.length < 2) return null;

      // Calculate average progress rate per day
      const timeSpan = recent[recent.length - 1].date.getTime() - recent[0].date.getTime();
      const progressChange = recent[recent.length - 1].progress - recent[0].progress;
      
      if (timeSpan <= 0 || progressChange <= 0) return null;

      const progressPerDay = progressChange / (timeSpan / (1000 * 60 * 60 * 24));
      const currentProgress = calculateWeightedProgress(items);
      const remainingProgress = 100 - currentProgress;

      if (remainingProgress <= 0) return new Date(); // Already completed

      const daysToCompletion = remainingProgress / progressPerDay;
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(daysToCompletion));

      return estimatedDate;
    };

    const weightedProgress = calculateWeightedProgress(items);
    const totalProgress = calculateSimpleProgress(items);
    const { completed, total } = countItems(items);
    const phaseProgress = calculateProgressByType(items, 'phase');
    const deliverableProgress = calculateProgressByType(items, 'deliverable');
    const criticalPath = findCriticalPath(items);
    const bottlenecks = findBottlenecks(items);
    const progressTrend = calculateProgressTrend();
    const estimatedCompletion = estimateCompletion();

    return {
      totalProgress,
      weightedProgress,
      completedItems: completed,
      totalItems: total,
      phaseProgress,
      deliverableProgress,
      criticalPath,
      bottlenecks,
      progressTrend,
      estimatedCompletion
    };
  }, [items, historicalData, targetCompletionDate]);

  // Helper functions for components
  const getProgressStatus = (progress: number): 'خطر' | 'تحذير' | 'جيد' | 'ممتاز' => {
    if (progress >= 90) return 'ممتاز';
    if (progress >= 70) return 'جيد';
    if (progress >= 50) return 'تحذير';
    return 'خطر';
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return 'text-green-600 bg-green-100';
    if (progress >= 70) return 'text-blue-600 bg-blue-100';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendText = (trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving': return 'في تحسن';
      case 'declining': return 'في تراجع';
      case 'stable': return 'مستقر';
      default: return 'مستقر';
    }
  };

  const formatProgressPercentage = (progress: number): string => {
    return `${Math.round(progress * 100) / 100}%`;
  };

  const isOnTrack = (): boolean => {
    if (!targetCompletionDate) return true;

    const now = new Date();
    const target = new Date(targetCompletionDate);
    const timeElapsed = now.getTime() - new Date().setMonth(new Date().getMonth() - 1); // Assuming project started a month ago
    const totalTime = target.getTime() - new Date().setMonth(new Date().getMonth() - 1);
    
    if (totalTime <= 0) return false;

    const expectedProgress = (timeElapsed / totalTime) * 100;
    const actualProgress = progressCalculation.weightedProgress;

    return actualProgress >= expectedProgress * 0.9; // 10% tolerance
  };

  return {
    ...progressCalculation,
    getProgressStatus,
    getProgressColor,
    getTrendIcon,
    getTrendText,
    formatProgressPercentage,
    isOnTrack
  };
};

export default useProgressCalculation;