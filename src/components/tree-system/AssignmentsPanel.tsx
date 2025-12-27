import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Users, 
  UserPlus, 
  Gift, 
  Calendar, 
  DollarSign, 
  User,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search
} from "lucide-react";
import CreateAssignmentDialog from "@/components/tree-system/CreateAssignmentDialog";
import CreateGrantDialog from "@/components/tree-system/CreateGrantDialog";

interface Assignment {
  id: string;
  consultantName: string;
  clientName: string;
  projectName: string;
  assignmentDate: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  description: string;
}

interface Grant {
  id: string;
  clientName: string;
  grantAmount: number;
  grantDate: string;
  purpose: string;
  status: 'approved' | 'pending' | 'rejected';
  expiryDate: string;
}

const AssignmentsPanel: React.FC = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'grants'>('assignments');
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isCreateGrantOpen, setIsCreateGrantOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data initialization
  useEffect(() => {
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        consultantName: 'أحمد محمد',
        clientName: 'شركة التقنية المتقدمة',
        projectName: 'تطوير نظام إدارة المشاريع',
        assignmentDate: '2024-01-15',
        status: 'active',
        budget: 50000,
        description: 'تطوير نظام شامل لإدارة المشاريع مع واجهة مستخدم متقدمة'
      },
      {
        id: '2',
        consultantName: 'فاطمة علي',
        clientName: 'مؤسسة الابتكار',
        projectName: 'استشارات تقنية',
        assignmentDate: '2024-02-01',
        status: 'completed',
        budget: 30000,
        description: 'تقديم استشارات تقنية متخصصة في مجال الذكاء الاصطناعي'
      },
      {
        id: '3',
        consultantName: 'محمد حسن',
        clientName: 'شركة الحلول الذكية',
        projectName: 'تحليل البيانات',
        assignmentDate: '2024-02-10',
        status: 'pending',
        budget: 40000,
        description: 'تحليل البيانات الضخمة وإعداد التقارير التحليلية'
      }
    ];

    const mockGrants: Grant[] = [
      {
        id: '1',
        clientName: 'شركة التقنية المتقدمة',
        grantAmount: 100000,
        grantDate: '2024-01-10',
        purpose: 'تمويل مشروع التطوير التقني',
        status: 'approved',
        expiryDate: '2024-12-31'
      },
      {
        id: '2',
        clientName: 'مؤسسة الابتكار',
        grantAmount: 75000,
        grantDate: '2024-01-25',
        purpose: 'دعم مشاريع الذكاء الاصطناعي',
        status: 'pending',
        expiryDate: '2024-11-30'
      },
      {
        id: '3',
        clientName: 'شركة الحلول الذكية',
        grantAmount: 60000,
        grantDate: '2024-02-05',
        purpose: 'تمويل مشروع تحليل البيانات',
        status: 'approved',
        expiryDate: '2024-10-31'
      }
    ];

    setAssignments(mockAssignments);
    setGrants(mockGrants);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.consultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGrants = grants.filter(grant => {
    const matchesSearch = grant.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || grant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    toast({
      title: "تم حذف التكليف",
      description: "تم حذف التكليف بنجاح",
    });
  };

  const handleDeleteGrant = (id: string) => {
    setGrants(prev => prev.filter(grant => grant.id !== id));
    toast({
      title: "تم حذف المنحة",
      description: "تم حذف المنحة بنجاح",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">إدارة التكليفات والمنح</h1>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              onClick={() => setIsCreateAssignmentOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              تكليف جديد
            </Button>
            <Button
              onClick={() => setIsCreateGrantOpen(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Gift className="w-4 h-4 ml-2" />
              منحة جديدة
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-4 space-x-reverse border-b">
          <button
            onClick={() => setActiveTab('assignments')}
            className={cn(
              "pb-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'assignments'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Users className="w-4 h-4 inline ml-2" />
            التكليفات ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('grants')}
            className={cn(
              "pb-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'grants'
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Gift className="w-4 h-4 inline ml-2" />
            المنح ({grants.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              {activeTab === 'assignments' ? (
                <>
                  <option value="active">نشط</option>
                  <option value="completed">مكتمل</option>
                  <option value="pending">قيد الانتظار</option>
                </>
              ) : (
                <>
                  <option value="approved">موافق عليه</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="rejected">مرفوض</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'assignments' ? (
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تكليفات</h3>
                <p className="text-gray-500 text-center mb-4">
                  لم يتم العثور على أي تكليفات تطابق معايير البحث
                </p>
                <Button
                  onClick={() => setIsCreateAssignmentOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  إنشاء تكليف جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="w-full max-w-4xl mx-auto">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.projectName}
                        </h3>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(assignment.status)
                        )}>
                          {getStatusText(assignment.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                      <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <User className="w-4 h-4" />
                          <span>المستشار: {assignment.consultantName}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(assignment.assignmentDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <DollarSign className="w-4 h-4" />
                          <span>{assignment.budget.toLocaleString()} ريال</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 space-x-reverse text-sm">
                      <span className="font-medium text-gray-700">العميل:</span>
                      <span className="text-gray-600">{assignment.clientName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGrants.length === 0 ? (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منح</h3>
                <p className="text-gray-500 text-center mb-4">
                  لم يتم العثور على أي منح تطابق معايير البحث
                </p>
                <Button
                  onClick={() => setIsCreateGrantOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Gift className="w-4 h-4 ml-2" />
                  إنشاء منحة جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredGrants.map((grant) => (
              <Card key={grant.id} className="w-full max-w-4xl mx-auto">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {grant.clientName}
                        </h3>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(grant.status)
                        )}>
                          {getStatusText(grant.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{grant.purpose}</p>
                      <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <DollarSign className="w-4 h-4" />
                          <span>المبلغ: {grant.grantAmount.toLocaleString()} ريال</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Calendar className="w-4 h-4" />
                          <span>تاريخ المنح: {new Date(grant.grantDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Calendar className="w-4 h-4" />
                          <span>تاريخ الانتهاء: {new Date(grant.expiryDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteGrant(grant.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreateAssignmentDialog
        open={isCreateAssignmentOpen}
        onOpenChange={setIsCreateAssignmentOpen}
      />
      
      <CreateGrantDialog
        open={isCreateGrantOpen}
        onOpenChange={setIsCreateGrantOpen}
      />
    </div>
  );
};

export default AssignmentsPanel;