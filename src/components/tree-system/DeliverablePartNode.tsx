import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Upload, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ProgressBar from '@/components/tree-system/ProgressBar';
import FileVersionIndicator from '@/components/tree-system/FileVersionIndicator';

interface FileVersion {
  id: string;
  version: string;
  fileName: string;
  uploadDate: string;
  size: string;
  uploadedBy: string;
  isLatest: boolean;
}

interface DeliverablePartData {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  files: FileVersion[];
  weight: number;
}

const mockDeliverablePart: DeliverablePartData = {
  id: 'part-1',
  name: 'التصميم المعماري الأولي',
  description: 'تصميم المخططات المعمارية الأساسية للمشروع',
  progress: 75,
  status: 'in-progress',
  dueDate: '2024-02-15',
  weight: 30,
  files: [
    {
      id: 'file-1',
      version: 'v2.1',
      fileName: 'architectural-design.dwg',
      uploadDate: '2024-01-20',
      size: '2.5 MB',
      uploadedBy: 'أحمد محمد',
      isLatest: true
    },
    {
      id: 'file-2',
      version: 'v2.0',
      fileName: 'architectural-design.dwg',
      uploadDate: '2024-01-15',
      size: '2.3 MB',
      uploadedBy: 'أحمد محمد',
      isLatest: false
    },
    {
      id: 'file-3',
      version: 'v1.0',
      fileName: 'architectural-design.dwg',
      uploadDate: '2024-01-10',
      size: '2.1 MB',
      uploadedBy: 'سارة أحمد',
      isLatest: false
    }
  ]
};

const DeliverablePartNode: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [deliverablePart] = useState<DeliverablePartData>(mockDeliverablePart);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const latestFile = deliverablePart.files.find(file => file.isLatest);
  const olderVersions = deliverablePart.files.filter(file => !file.isLatest);
  const displayedVersions = showAllVersions ? olderVersions : olderVersions.slice(0, 2);

  return (
    <div className="mr-6">
      <Card className="border-r-4 border-r-purple-400 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">{deliverablePart.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(deliverablePart.status)
                  )}>
                    {getStatusText(deliverablePart.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    الوزن: {deliverablePart.weight}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 ml-1" />
                رفع ملف
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">التقدم</span>
              <span className="text-sm font-medium">{deliverablePart.progress}%</span>
            </div>
            <ProgressBar progress={deliverablePart.progress} />
          </div>

          {/* Description */}
          {deliverablePart.description && (
            <p className="text-sm text-gray-600 mb-3">{deliverablePart.description}</p>
          )}

          {/* Due Date */}
          <div className="text-sm text-gray-500 mb-3">
            تاريخ الاستحقاق: {formatDate(deliverablePart.dueDate)}
          </div>

          {/* Latest File */}
          {latestFile && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">أحدث إصدار</h5>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{latestFile.fileName}</span>
                        <FileVersionIndicator version={latestFile.version} isLatest={true} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {latestFile.size} • {formatDate(latestFile.uploadDate)} • {latestFile.uploadedBy}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t">
              {/* File Versions */}
              {olderVersions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700">الإصدارات السابقة</h5>
                    {olderVersions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllVersions(!showAllVersions)}
                        className="text-xs"
                      >
                        {showAllVersions ? 'إخفاء' : `عرض الكل (${olderVersions.length})`}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {displayedVersions.map((file) => (
                      <div key={file.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{file.fileName}</span>
                                <FileVersionIndicator version={file.version} isLatest={false} />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {file.size} • {formatDate(file.uploadDate)} • {file.uploadedBy}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة ملاحظة
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 ml-1" />
                  تحديث التقدم
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverablePartNode;