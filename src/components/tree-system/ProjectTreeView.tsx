import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  FolderTree, 
  BarChart3, 
  Plus, 
  Minus,
  RefreshCw,
  Upload,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectTree } from "@/hooks/useProjectTree";
import { PhaseNode, ActivityNode, DeliverableNode } from "@/types/tree-system";

interface ProjectTreeViewProps {
  projectId?: string;
  projectName?: string;
}

const ProjectTreeView: React.FC<ProjectTreeViewProps> = ({ 
  projectId = "1", 
  projectName = "مشروع تجريبي" 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"phases" | "deliverables">("phases");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // استخدام البيانات الحقيقية من useProjectTree hook
  const {
    phases,
    deliverables,
    loading,
    error,
    refreshData,
    createPhase,
    updatePhase,
    deletePhase,
    createActivity,
    updateActivity,
    deleteActivity,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable
  } = useProjectTree(projectId);

  // إحصائيات التقدم
  const progressStats = useMemo(() => {
    const totalPhases = phases.length;
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalDeliverables = deliverables.length;
    const completedDeliverables = deliverables.filter(d => d.status === 'completed').length;
    
    return {
      phases: {
        total: totalPhases,
        completed: completedPhases,
        progress: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0
      },
      deliverables: {
        total: totalDeliverables,
        completed: completedDeliverables,
        progress: totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0
      }
    };
  }, [phases, deliverables]);

  // تصفية البيانات حسب البحث
  const filteredPhases = useMemo(() => {
    if (!searchTerm) return phases;
    return phases.filter(phase => 
      phase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phase.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [phases, searchTerm]);

  const filteredDeliverables = useMemo(() => {
    if (!searchTerm) return deliverables;
    return deliverables.filter(deliverable => 
      deliverable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverable.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deliverables, searchTerm]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set([
      ...phases.map(p => p.id),
      ...phases.flatMap(p => p.activities?.map(a => a.id) || []),
      ...deliverables.map(d => d.id)
    ]);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'not_started': { label: 'لم تبدأ', color: 'bg-gray-100 text-gray-800' },
      'in_progress': { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'مكتملة', color: 'bg-green-100 text-green-800' },
      'on_hold': { label: 'معلقة', color: 'bg-yellow-100 text-yellow-800' },
      'cancelled': { label: 'ملغية', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['not_started'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const renderPhaseNode = (phase: PhaseNode) => {
    const isExpanded = expandedNodes.has(phase.id);
    const hasActivities = phase.activities && phase.activities.length > 0;

    return (
      <div key={phase.id} className="border rounded-lg p-3 mb-2 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasActivities && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNode(phase.id)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <Folder className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{phase.name}</span>
            {getStatusBadge(phase.status)}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-1">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-1">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {phase.description && (
          <p className="text-sm text-gray-600 mt-1 mr-8">{phase.description}</p>
        )}
        
        {isExpanded && hasActivities && (
          <div className="mt-3 mr-6 space-y-2">
            {phase.activities?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <File className="h-3 w-3 text-green-600" />
                  <span className="text-sm">{activity.name}</span>
                  {getStatusBadge(activity.status)}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDeliverableNode = (deliverable: DeliverableNode) => {
    return (
      <div key={deliverable.id} className="border rounded-lg p-3 mb-2 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-purple-600" />
            <span className="font-medium">{deliverable.name}</span>
            {getStatusBadge(deliverable.status)}
            {deliverable.weight_value && (
              <Badge variant="outline" className="text-xs">
                الوزن: {deliverable.weight_value} {deliverable.weight_unit}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-1">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-1">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {deliverable.description && (
          <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل بيانات الشجرة...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <span>خطأ في تحميل بيانات الشجرة: {error}</span>
        <Button onClick={refreshData} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with project info and controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6" />
            شجرة المشروع: {projectName}
          </h2>
          <p className="text-gray-600 mt-1">إدارة مراحل ومخرجات المشروع</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={expandAll} variant="outline" size="sm">
            توسيع الكل
          </Button>
          <Button onClick={collapseAll} variant="outline" size="sm">
            طي الكل
          </Button>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">المراحل</span>
                  <span className="text-sm text-gray-600">
                    {progressStats.phases.completed} / {progressStats.phases.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressStats.phases.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{progressStats.phases.progress}% مكتمل</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <File className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">المخرجات</span>
                  <span className="text-sm text-gray-600">
                    {progressStats.deliverables.completed} / {progressStats.deliverables.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressStats.deliverables.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{progressStats.deliverables.progress}% مكتمل</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في المراحل والمخرجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Tree View Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "phases" | "deliverables")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phases" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                المراحل ({filteredPhases.length})
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                المخرجات ({filteredDeliverables.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phases" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">مراحل المشروع</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة مرحلة
                  </Button>
                </div>
                
                <ScrollArea className="h-[500px]">
                  {filteredPhases.length > 0 ? (
                    <div className="space-y-2">
                      {filteredPhases.map(renderPhaseNode)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <Folder className="h-8 w-8 mb-2" />
                      <span>لا توجد مراحل متاحة</span>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="deliverables" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">مخرجات المشروع</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة مخرج
                  </Button>
                </div>
                
                <ScrollArea className="h-[500px]">
                  {filteredDeliverables.length > 0 ? (
                    <div className="space-y-2">
                      {filteredDeliverables.map(renderDeliverableNode)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <File className="h-8 w-8 mb-2" />
                      <span>لا توجد مخرجات متاحة</span>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTreeView;