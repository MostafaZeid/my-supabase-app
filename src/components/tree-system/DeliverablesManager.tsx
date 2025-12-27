import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Target,
  Weight,
  BarChart3,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import CreateDeliverableDialog from "@/components/tree-system/CreateDeliverableDialog";
import CreatePartDialog from "@/components/tree-system/CreatePartDialog";
import EditDeliverableDialog from "@/components/tree-system/EditDeliverableDialog";

interface Part {
  id: string;
  name: string;
  description?: string;
  weight: number;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  weight: number;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string;
  dueDate?: string;
  parts: Part[];
  createdAt: string;
  updatedAt: string;
  expanded?: boolean;
}

const DeliverablesManager: React.FC = () => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showCreateDeliverable, setShowCreateDeliverable] = useState(false);
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [showEditDeliverable, setShowEditDeliverable] = useState(false);
  const [parentDeliverableId, setParentDeliverableId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load deliverables from localStorage on component mount
  useEffect(() => {
    const savedDeliverables = localStorage.getItem('deliverables');
    if (savedDeliverables) {
      try {
        const parsed = JSON.parse(savedDeliverables);
        setDeliverables(parsed);
      } catch (error) {
        console.error('Error parsing saved deliverables:', error);
      }
    }
  }, []);

  // Save deliverables to localStorage whenever deliverables change
  useEffect(() => {
    localStorage.setItem('deliverables', JSON.stringify(deliverables));
  }, [deliverables]);

  const calculateDeliverableProgress = (deliverable: Deliverable): number => {
    if (deliverable.parts.length === 0) return deliverable.progress;
    
    const totalWeight = deliverable.parts.reduce((sum, part) => sum + part.weight, 0);
    if (totalWeight === 0) return 0;
    
    const weightedProgress = deliverable.parts.reduce((sum, part) => 
      sum + (part.progress * part.weight), 0
    );
    
    return Math.round(weightedProgress / totalWeight);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in-progress':
        return 'قيد التنفيذ';
      case 'overdue':
        return 'متأخر';
      default:
        return 'في الانتظار';
    }
  };

  const handleCreateDeliverable = (deliverableData: any) => {
    const newDeliverable: Deliverable = {
      id: Date.now().toString(),
      name: deliverableData.name,
      description: deliverableData.description,
      weight: deliverableData.weight || 100,
      progress: 0,
      status: 'pending',
      assignedTo: deliverableData.assignedTo,
      dueDate: deliverableData.dueDate,
      parts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expanded: false
    };

    setDeliverables(prev => [...prev, newDeliverable]);
    setShowCreateDeliverable(false);
    
    toast({
      title: "تم إنشاء المخرج بنجاح",
      description: `تم إنشاء المخرج "${newDeliverable.name}" بنجاح`,
    });
  };

  const handleCreatePart = (partData: any) => {
    if (!parentDeliverableId) return;

    const newPart: Part = {
      id: Date.now().toString(),
      name: partData.name,
      description: partData.description,
      weight: partData.weight || 100,
      progress: 0,
      status: 'pending',
      assignedTo: partData.assignedTo,
      dueDate: partData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === parentDeliverableId
        ? {
            ...deliverable,
            parts: [...deliverable.parts, newPart],
            updatedAt: new Date().toISOString()
          }
        : deliverable
    ));

    setShowCreatePart(false);
    setParentDeliverableId(null);
    
    toast({
      title: "تم إنشاء الجزء بنجاح",
      description: `تم إنشاء الجزء "${newPart.name}" بنجاح`,
    });
  };

  const handleEditDeliverable = (deliverableData: any) => {
    if (!selectedDeliverable) return;

    setDeliverables(prev => prev.map(deliverable =>
      deliverable.id === selectedDeliverable.id
        ? {
            ...deliverable,
            ...deliverableData,
            updatedAt: new Date().toISOString()
          }
        : deliverable
    ));

    setShowEditDeliverable(false);
    setSelectedDeliverable(null);
    
    toast({
      title: "تم تحديث المخرج بنجاح",
      description: `تم تحديث المخرج "${deliverableData.name}" بنجاح`,
    });
  };

  const handleDeleteDeliverable = (deliverableId: string) => {
    const deliverable = deliverables.find(d => d.id === deliverableId);
    if (!deliverable) return;

    if (window.confirm(`هل أنت متأكد من حذف المخرج "${deliverable.name}"؟`)) {
      setDeliverables(prev => prev.filter(d => d.id !== deliverableId));
      
      toast({
        title: "تم حذف المخرج",
        description: `تم حذف المخرج "${deliverable.name}" بنجاح`,
        variant: "destructive"
      });
    }
  };

  const handleDeletePart = (deliverableId: string, partId: string) => {
    const deliverable = deliverables.find(d => d.id === deliverableId);
    const part = deliverable?.parts.find(p => p.id === partId);
    if (!deliverable || !part) return;

    if (window.confirm(`هل أنت متأكد من حذف الجزء "${part.name}"؟`)) {
      setDeliverables(prev => prev.map(d =>
        d.id === deliverableId
          ? {
              ...d,
              parts: d.parts.filter(p => p.id !== partId),
              updatedAt: new Date().toISOString()
            }
          : d
      ));
      
      toast({
        title: "تم حذف الجزء",
        description: `تم حذف الجزء "${part.name}" بنجاح`,
        variant: "destructive"
      });
    }
  };

  const toggleDeliverableExpansion = (deliverableId: string) => {
    setDeliverables(prev => prev.map(deliverable =>
      deliverable.id === deliverableId
        ? { ...deliverable, expanded: !deliverable.expanded }
        : deliverable
    ));
  };

  const totalWeight = deliverables.reduce((sum, deliverable) => sum + deliverable.weight, 0);
  const overallProgress = totalWeight > 0 
    ? Math.round(deliverables.reduce((sum, deliverable) => 
        sum + (calculateDeliverableProgress(deliverable) * deliverable.weight), 0
      ) / totalWeight)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            إدارة المخرجات
          </h2>
          <p className="text-gray-600 mt-1">
            إدارة المخرجات والأجزاء مع نظام الأوزان المتقدم
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDeliverable(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة مخرج جديد
        </Button>
      </div>

      {/* Overall Progress */}
      {deliverables.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                التقدم الإجمالي
              </h3>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>إجمالي المخرجات: {deliverables.length}</span>
              <span>إجمالي الوزن: {totalWeight}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliverables List */}
      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد مخرجات بعد
              </h3>
              <p className="text-gray-600 mb-6">
                ابدأ بإنشاء أول مخرج لمشروعك
              </p>
              <Button 
                onClick={() => setShowCreateDeliverable(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة مخرج جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          deliverables.map((deliverable) => {
            const calculatedProgress = calculateDeliverableProgress(deliverable);
            
            return (
              <Card key={deliverable.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDeliverableExpansion(deliverable.id)}
                          className="p-1 h-auto"
                        >
                          {deliverable.expanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {deliverable.name}
                        </h3>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                          getStatusColor(deliverable.status)
                        )}>
                          {getStatusIcon(deliverable.status)}
                          {getStatusText(deliverable.status)}
                        </div>
                      </div>
                      
                      {deliverable.description && (
                        <p className="text-gray-600 text-sm mb-3 mr-8">
                          {deliverable.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mr-8">
                        <div className="flex items-center gap-1">
                          <Weight className="w-4 h-4" />
                          <span>الوزن: {deliverable.weight}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>التقدم: {calculatedProgress}%</span>
                        </div>
                        {deliverable.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{deliverable.assignedTo}</span>
                          </div>
                        )}
                        {deliverable.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(deliverable.dueDate).toLocaleDateString('ar-SA')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>الأجزاء: {deliverable.parts.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setParentDeliverableId(deliverable.id);
                          setShowCreatePart(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDeliverable(deliverable);
                          setShowEditDeliverable(true);
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDeliverable(deliverable.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mr-8">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculatedProgress}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                {/* Parts List */}
                {deliverable.expanded && deliverable.parts.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="mr-8 space-y-3">
                      {deliverable.parts.map((part) => (
                        <div 
                          key={part.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {part.name}
                                </h4>
                                <div className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                                  getStatusColor(part.status)
                                )}>
                                  {getStatusIcon(part.status)}
                                  {getStatusText(part.status)}
                                </div>
                              </div>
                              
                              {part.description && (
                                <p className="text-gray-600 text-sm mb-2">
                                  {part.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Weight className="w-3 h-3" />
                                  <span>الوزن: {part.weight}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  <span>التقدم: {part.progress}%</span>
                                </div>
                                {part.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{part.assignedTo}</span>
                                  </div>
                                )}
                                {part.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(part.dueDate).toLocaleDateString('ar-SA')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePart(deliverable.id, part.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {/* Part Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${part.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
                
                {deliverable.expanded && deliverable.parts.length === 0 && (
                  <CardContent className="pt-0">
                    <div className="mr-8 text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">لا توجد أجزاء في هذا المخرج</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setParentDeliverableId(deliverable.id);
                          setShowCreatePart(true);
                        }}
                        className="mt-2 text-blue-600"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        إضافة جزء
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <CreateDeliverableDialog
        open={showCreateDeliverable}
        onOpenChange={setShowCreateDeliverable}
        onSubmit={handleCreateDeliverable}
      />

      <CreatePartDialog
        open={showCreatePart}
        onOpenChange={setShowCreatePart}
        onSubmit={handleCreatePart}
      />

      {selectedDeliverable && (
        <EditDeliverableDialog
          open={showEditDeliverable}
          onOpenChange={setShowEditDeliverable}
          deliverable={selectedDeliverable}
          onSubmit={handleEditDeliverable}
        />
      )}
    </div>
  );
};

export default DeliverablesManager;