import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Calendar, Target, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";
import ProgressBar from "@/components/tree-system/ProgressBar";
import { cn } from "@/lib/utils";

interface ProjectStats {
  totalPhases: number;
  completedPhases: number;
  totalDeliverables: number;
  completedDeliverables: number;
  totalActivities: number;
  completedActivities: number;
  overallProgress: number;
  daysRemaining: number;
  teamMembers: number;
  budget: number;
  budgetUsed: number;
}

const ProjectSummaryCard: React.FC = () => {
  // Mock data - in real app this would come from props or context
  const projectStats: ProjectStats = {
    totalPhases: 4,
    completedPhases: 2,
    totalDeliverables: 12,
    completedDeliverables: 7,
    totalActivities: 45,
    completedActivities: 28,
    overallProgress: 62,
    daysRemaining: 45,
    teamMembers: 8,
    budget: 500000,
    budgetUsed: 310000
  };

  const budgetProgress = (projectStats.budgetUsed / projectStats.budget) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    progress?: number;
    color?: 'blue' | 'green' | 'orange' | 'purple';
  }> = ({ icon, title, value, subtitle, progress, color = 'blue' }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200'
    };

    return (
      <div className={cn(
        "p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
        colorClasses[color]
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-white/50">
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm text-gray-700">{title}</h4>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <ProgressBar progress={progress} size="sm" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-sm md:max-w-4xl lg:max-w-6xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">ملخص المشروع</h2>
            <p className="text-gray-600">نظرة عامة على حالة المشروع والتقدم المحرز</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700">{projectStats.overallProgress}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">التقدم الإجمالي</h3>
            <span className="text-2xl font-bold text-blue-600">{projectStats.overallProgress}%</span>
          </div>
          <ProgressBar progress={projectStats.overallProgress} size="lg" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>مكتمل</span>
            <span>متبقي {100 - projectStats.overallProgress}%</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5" />}
              title="المراحل"
              value={`${projectStats.completedPhases}/${projectStats.totalPhases}`}
              subtitle="مرحلة مكتملة"
              progress={(projectStats.completedPhases / projectStats.totalPhases) * 100}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="المخرجات"
              value={`${projectStats.completedDeliverables}/${projectStats.totalDeliverables}`}
              subtitle="مخرج مكتمل"
              progress={(projectStats.completedDeliverables / projectStats.totalDeliverables) * 100}
              color="green"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              title="الأنشطة"
              value={`${projectStats.completedActivities}/${projectStats.totalActivities}`}
              subtitle="نشاط مكتمل"
              progress={(projectStats.completedActivities / projectStats.totalActivities) * 100}
              color="orange"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              title="أعضاء الفريق"
              value={projectStats.teamMembers.toString()}
              subtitle="عضو نشط"
              color="purple"
            />
          </div>
        </div>

        {/* Timeline and Budget */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">الجدول الزمني</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{projectStats.daysRemaining}</p>
                <p className="text-sm text-gray-600">يوم متبقي</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">حالة الجدول</p>
                <p className="font-semibold text-green-600">في الموعد المحدد</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">الميزانية</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المستخدم</span>
                <span className="font-semibold">{formatCurrency(projectStats.budgetUsed)}</span>
              </div>
              <ProgressBar progress={budgetProgress} size="md" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">الإجمالي: {formatCurrency(projectStats.budget)}</span>
                <span className={cn(
                  "font-semibold",
                  budgetProgress > 80 ? "text-red-600" : budgetProgress > 60 ? "text-orange-600" : "text-green-600"
                )}>
                  {budgetProgress.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">إجراءات سريعة</h4>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              عرض التقرير التفصيلي
            </button>
            <button className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              تصدير البيانات
            </button>
            <button className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
              إعدادات المشروع
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSummaryCard;