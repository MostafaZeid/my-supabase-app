import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Package, FileText, Weight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TreeNode from '@/components/tree-system/TreeNode';
import DeliverableNode from '@/components/tree-system/DeliverableNode';
import ProgressBar from '@/components/tree-system/ProgressBar';
import { cn } from '@/lib/utils';

interface DeliverablePart {
  id: string;
  name: string;
  weight: number;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  files: Array<{
    id: string;
    name: string;
    version: string;
    uploadDate: string;
  }>;
}

interface Deliverable {
  id: string;
  name: string;
  description: string;
  weight: number;
  totalProgress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  parts: DeliverablePart[];
  dueDate: string;
}

const DeliverablesTreeSection: React.FC = () => {
  const [expandedDeliverables, setExpandedDeliverables] = useState<Set<string>>(new Set());
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  // Mock data for deliverables
  const deliverables: Deliverable[] = [
    {
      id: 'del-1',
      name: 'تقرير دراسة الجدوى',
      description: 'تقرير شامل لدراسة الجدوى الاقتصادية والفنية للمشروع',
      weight: 25,
      totalProgress: 75,
      status: 'in-progress',
      dueDate: '2024-02-15',
      parts: [
        {
          id: 'part-1',
          name: 'الدراسة الاقتصادية',
          weight: 60,
          progress: 90,
          status: 'completed',
          files: [
            {
              id: 'file-1',
              name: 'economic-analysis.pdf',
              version: 'v2.1',
              uploadDate: '2024-01-20'
            }
          ]
        },
        {
          id: 'part-2',
          name: 'الدراسة الفنية',
          weight: 40,
          progress: 55,
          status: 'in-progress',
          files: [
            {
              id: 'file-2',
              name: 'technical-specs.docx',
              version: 'v1.3',
              uploadDate: '2024-01-18'
            }
          ]
        }
      ]
    },
    {
      id: 'del-2',
      name: 'خطة إدارة المشروع',
      description: 'خطة شاملة لإدارة وتنفيذ المشروع',
      weight: 20,
      totalProgress: 40,
      status: 'in-progress',
      dueDate: '2024-02-10',
      parts: [
        {
          id: 'part-3',
          name: 'الجدول الزمني',
          weight: 50,
          progress: 80,
          status: 'completed',
          files: [
            {
              id: 'file-3',
              name: 'project-timeline.xlsx',
              version: 'v1.0',
              uploadDate: '2024-01-15'
            }
          ]
        },
        {
          id: 'part-4',
          name: 'خطة إدارة المخاطر',
          weight: 50,
          progress: 0,
          status: 'pending',
          files: []
        }
      ]
    },
    {
      id: 'del-3',
      name: 'التصميم المعماري',
      description: 'التصاميم والمخططات المعمارية للمشروع',
      weight: 30,
      totalProgress: 20,
      status: 'overdue',
      dueDate: '2024-01-30',
      parts: [
        {
          id: 'part-5',
          name: 'المخططات الأولية',
          weight: 70,
          progress: 30,
          status: 'in-progress',
          files: [
            {
              id: 'file-4',
              name: 'initial-designs.dwg',
              version: 'v0.5',
              uploadDate: '2024-01-10'
            }
          ]
        },
        {
          id: 'part-6',
          name: 'المواصفات التقنية',
          weight: 30,
          progress: 0,
          status: 'pending',
          files: []
        }
      ]
    }
  ];

  const toggleDeliverable = (deliverableId: string) => {
    const newExpanded = new Set(expandedDeliverables);
    if (newExpanded.has(deliverableId)) {
      newExpanded.delete(deliverableId);
    } else {
      newExpanded.add(deliverableId);
    }
    setExpandedDeliverables(newExpanded);
  };

  const togglePart = (partId: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
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

  const totalWeight = deliverables.reduce((sum, del) => sum + del.weight, 0);
  const overallProgress = deliverables.reduce((sum, del) => sum + (del.totalProgress * del.weight / 100), 0) / totalWeight * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">المخرجات والأجزاء</h2>
              <p className="text-sm text-gray-600">عرض شجري للمخرجات مع نظام الأوزان</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Weight className="h-4 w-4" />
            <span>إجمالي الوزن: {totalWeight}%</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">التقدم الإجمالي</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(overallProgress)}%</span>
          </div>
          <ProgressBar progress={overallProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {deliverables.map((deliverable) => (
          <div key={deliverable.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Deliverable Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto hover:bg-gray-100"
                onClick={() => toggleDeliverable(deliverable.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  {expandedDeliverables.has(deliverable.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  
                  <Package className="h-5 w-5 text-blue-600" />
                  
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(deliverable.status)
                        )}>
                          {getStatusText(deliverable.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          الموعد النهائي: {deliverable.dueDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <h3 className="font-semibold text-gray-900">{deliverable.name}</h3>
                        <p className="text-sm text-gray-600">{deliverable.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">الوزن: {deliverable.weight}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{deliverable.totalProgress}%</span>
                        </div>
                        <ProgressBar progress={deliverable.totalProgress} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Deliverable Parts */}
            {expandedDeliverables.has(deliverable.id) && (
              <div className="bg-white">
                {deliverable.parts.map((part, index) => (
                  <div key={part.id} className={cn(
                    "border-r-4 border-r-blue-200",
                    index < deliverable.parts.length - 1 && "border-b border-gray-100"
                  )}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto hover:bg-gray-50"
                      onClick={() => togglePart(part.id)}
                    >
                      <div className="flex items-center gap-3 w-full mr-6">
                        {expandedParts.has(part.id) ? (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        )}
                        
                        <FileText className="h-4 w-4 text-green-600" />
                        
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium border",
                                getStatusColor(part.status)
                              )}>
                                {getStatusText(part.status)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {part.files.length} ملف
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-800">{part.name}</h4>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Weight className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">الوزن: {part.weight}%</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">{part.progress}%</span>
                              </div>
                              <ProgressBar progress={part.progress} className="h-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>

                    {/* Part Files */}
                    {expandedParts.has(part.id) && part.files.length > 0 && (
                      <div className="bg-gray-25 border-t border-gray-100 mr-12">
                        {part.files.map((file) => (
                          <div key={file.id} className="p-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {file.version}
                                </span>
                                <span className="text-xs text-gray-500">
                                  تم الرفع: {file.uploadDate}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DeliverablesTreeSection;