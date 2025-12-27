import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { EditProjectModal } from './EditProjectModal';

interface ClientProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function ClientProjectsModal({ isOpen, onClose, client }: ClientProjectsModalProps) {
  const { dir } = useLanguage();
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  if (!client) return null;

  // Sample projects data
  const sampleProjects = [
    {
      id: '1',
      name: 'تطوير نظام إدارة الموارد البشرية',
      nameEn: 'HR Management System Development',
      description: 'نظام شامل لإدارة الموارد البشرية والرواتب والإجازات',
      descriptionEn: 'Comprehensive system for managing human resources, payroll, and leave management',
      status: 'active',
      priority: 'high',
      progress: 75,
      budget: 150000,
      spent: 112500,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      teamLeader: 'محمد أحمد العلي',
      teamLeaderEn: 'Mohammed Ahmed Al-Ali',
      teamSize: 8,
      deliverables: {
        total: 12,
        completed: 9
      }
    },
    {
      id: '2',
      name: 'تحديث البنية التحتية التقنية',
      nameEn: 'IT Infrastructure Upgrade',
      description: 'تحديث وتطوير البنية التحتية التقنية للشركة',
      descriptionEn: 'Upgrading and modernizing the company IT infrastructure',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      budget: 80000,
      spent: 78000,
      startDate: '2023-10-01',
      endDate: '2024-02-28',
      teamLeader: 'فاطمة محمد الزهراني',
      teamLeaderEn: 'Fatima Mohammed Al-Zahrani',
      teamSize: 5,
      deliverables: {
        total: 8,
        completed: 8
      }
    },
    {
      id: '3',
      name: 'تطوير تطبيق الهاتف المحمول',
      nameEn: 'Mobile Application Development',
      description: 'تطبيق محمول لخدمات العملاء وإدارة الحسابات',
      descriptionEn: 'Mobile application for customer services and account management',
      status: 'planning',
      priority: 'low',
      progress: 15,
      budget: 120000,
      spent: 18000,
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      teamLeader: 'عبدالله سعد القحطاني',
      teamLeaderEn: 'Abdullah Saad Al-Qahtani',
      teamSize: 6,
      deliverables: {
        total: 15,
        completed: 2
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: dir === 'rtl' ? 'نشط' : 'Active',
      completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
      planning: dir === 'rtl' ? 'تخطيط' : 'Planning'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle project actions
  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowEditProject(true);
  };

  const handleSaveProject = (projectData: any) => {
    console.log('حفظ بيانات المشروع:', projectData);
    // يمكن إضافة منطق حفظ البيانات هنا
    setShowEditProject(false);
    setSelectedProject(null);
  };

  const handleCloseModals = () => {
    setShowProjectDetails(false);
    setShowEditProject(false);
    setSelectedProject(null);
  };

  // Handle export report
  const handleExportReport = () => {
    try {
      // إنشاء محتوى التقرير
      const reportContent = generateReportContent();
      
      // إنشاء وتحميل ملف HTML
      const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dir === 'rtl' ? 'تقرير_مشاريع_العميل' : 'Client_Projects_Report'}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // إشعار بنجاح التصدير
      alert(dir === 'rtl' ? 'تم تصدير التقرير بنجاح!' : 'Report exported successfully!');
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
      alert(dir === 'rtl' ? 'حدث خطأ أثناء تصدير التقرير' : 'Error occurred while exporting report');
    }
  };

  // إنشاء محتوى التقرير
  const generateReportContent = () => {
    const clientName = dir === 'rtl' ? client.organization : client.organizationEn;
    const reportDate = new Date().toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
    const totalBudget = sampleProjects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = sampleProjects.reduce((sum, project) => sum + project.spent, 0);
    const totalProgress = Math.round(sampleProjects.reduce((sum, project) => sum + project.progress, 0) / sampleProjects.length);
    const totalDeliverables = sampleProjects.reduce((sum, project) => sum + project.deliverables.total, 0);
    const completedDeliverables = sampleProjects.reduce((sum, project) => sum + project.deliverables.completed, 0);

    return `
<!DOCTYPE html>
<html dir="${dir}" lang="${dir === 'rtl' ? 'ar' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dir === 'rtl' ? 'تقرير مشاريع العميل' : 'Client Projects Report'}</title>
    <style>
        body {
            font-family: ${dir === 'rtl' ? 'Tahoma, Arial' : 'Arial, sans-serif'};
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
            direction: ${dir};
        }
        .header {
            background: linear-gradient(135deg, #1B4FFF, #0A1E39);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 5px solid #1B4FFF;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #1B4FFF;
            font-size: 1.1em;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #0A1E39;
        }
        .projects-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .projects-section h2 {
            color: #0A1E39;
            border-bottom: 3px solid #1B4FFF;
            padding-bottom: 10px;
            margin-bottom: 25px;
        }
        .project {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background: #fafafa;
        }
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .project-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #0A1E39;
        }
        .project-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-completed { background: #cce7ff; color: #004085; }
        .status-planning { background: #fff3cd; color: #856404; }
        .project-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .detail-item {
            background: white;
            padding: 15px;
            border-radius: 5px;
            border-left: 3px solid #1B4FFF;
        }
        .detail-label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        .detail-value {
            font-weight: bold;
            color: #333;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 10px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #1B4FFF, #4CAF50);
            transition: width 0.3s ease;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f1f1f1;
            border-radius: 10px;
            color: #666;
        }
        @media print {
            body { background: white; }
            .header, .summary-card, .projects-section { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${dir === 'rtl' ? 'تقرير مشاريع العميل' : 'Client Projects Report'}</h1>
        <p>${clientName}</p>
        <p>${dir === 'rtl' ? 'تاريخ التقرير:' : 'Report Date:'} ${reportDate}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>${dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</h3>
            <div class="value">${sampleProjects.length}</div>
        </div>
        <div class="summary-card">
            <h3>${dir === 'rtl' ? 'إجمالي الميزانية' : 'Total Budget'}</h3>
            <div class="value">${formatCurrency(totalBudget)}</div>
        </div>
        <div class="summary-card">
            <h3>${dir === 'rtl' ? 'إجمالي المصروف' : 'Total Spent'}</h3>
            <div class="value">${formatCurrency(totalSpent)}</div>
        </div>
        <div class="summary-card">
            <h3>${dir === 'rtl' ? 'متوسط التقدم' : 'Average Progress'}</h3>
            <div class="value">${totalProgress}%</div>
        </div>
        <div class="summary-card">
            <h3>${dir === 'rtl' ? 'إجمالي المخرجات' : 'Total Deliverables'}</h3>
            <div class="value">${completedDeliverables}/${totalDeliverables}</div>
        </div>
    </div>

    <div class="projects-section">
        <h2>${dir === 'rtl' ? 'تفاصيل المشاريع' : 'Project Details'}</h2>
        ${sampleProjects.map(project => `
            <div class="project">
                <div class="project-header">
                    <div class="project-title">${dir === 'rtl' ? project.name : project.nameEn}</div>
                    <div class="project-status status-${project.status}">
                        ${getStatusLabel(project.status)}
                    </div>
                </div>
                <div class="project-details">
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'الوصف' : 'Description'}</div>
                        <div class="detail-value">${dir === 'rtl' ? project.description : project.descriptionEn}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'قائد الفريق' : 'Team Leader'}</div>
                        <div class="detail-value">${dir === 'rtl' ? project.teamLeader : project.teamLeaderEn}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'حجم الفريق' : 'Team Size'}</div>
                        <div class="detail-value">${project.teamSize} ${dir === 'rtl' ? 'أعضاء' : 'members'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'تاريخ البداية' : 'Start Date'}</div>
                        <div class="detail-value">${new Date(project.startDate).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'تاريخ الانتهاء' : 'End Date'}</div>
                        <div class="detail-value">${new Date(project.endDate).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'الميزانية' : 'Budget'}</div>
                        <div class="detail-value">${formatCurrency(project.budget)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'المصروف' : 'Spent'}</div>
                        <div class="detail-value">${formatCurrency(project.spent)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">${dir === 'rtl' ? 'المخرجات' : 'Deliverables'}</div>
                        <div class="detail-value">${project.deliverables.completed}/${project.deliverables.total}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">${dir === 'rtl' ? 'نسبة التقدم' : 'Progress'}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                    <div class="detail-value" style="margin-top: 5px;">${project.progress}%</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>${dir === 'rtl' ? 'تم إنشاء هذا التقرير بواسطة منصة السياسات والإجراءات' : 'This report was generated by Policies & Procedures Platform'}</p>
        <p>${dir === 'rtl' ? 'تاريخ الإنشاء:' : 'Generated on:'} ${new Date().toLocaleString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</p>
    </div>
</body>
</html>
    `;
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {dir === 'rtl' ? 'مشاريع العميل' : 'Client Projects'}
          </DialogTitle>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? client.organization : client.organizationEn}
          </p>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Project Statistics */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-3">
              {dir === 'rtl' ? 'إحصائيات المشاريع' : 'Project Statistics'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{sampleProjects.length}</div>
                <div className="text-sm text-blue-600">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(sampleProjects.reduce((sum, p) => sum + p.budget, 0))}
                </div>
                <div className="text-sm text-green-600">{dir === 'rtl' ? 'إجمالي الميزانية' : 'Total Budget'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700">
                  {formatCurrency(sampleProjects.reduce((sum, p) => sum + p.spent, 0))}
                </div>
                <div className="text-sm text-orange-600">{dir === 'rtl' ? 'إجمالي المصروف' : 'Total Spent'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {Math.round(sampleProjects.reduce((sum, p) => sum + p.progress, 0) / sampleProjects.length)}%
                </div>
                <div className="text-sm text-purple-600">{dir === 'rtl' ? 'متوسط التقدم' : 'Average Progress'}</div>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              {dir === 'rtl' ? 'قائمة المشاريع' : 'Projects List'}
            </h3>
            
            {sampleProjects.map((project) => (
              <div key={project.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      {dir === 'rtl' ? project.name : project.nameEn}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {dir === 'rtl' ? 'التقدم:' : 'Progress:'} {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewProject(project)}
                      className="text-[#1B4FFF] border-[#1B4FFF] hover:bg-[#1B4FFF] hover:text-white"
                    >
                      {dir === 'rtl' ? 'عرض' : 'View'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditProject(project)}
                      className="text-green-600 border-green-500 hover:bg-green-500 hover:text-white"
                    >
                      {dir === 'rtl' ? 'تحرير' : 'Edit'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'الميزانية:' : 'Budget:'}</span>
                    <div className="font-semibold text-blue-700">{formatCurrency(project.budget)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المصروف:' : 'Spent:'}</span>
                    <div className="font-semibold text-orange-700">{formatCurrency(project.spent)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المتبقي:' : 'Remaining:'}</span>
                    <div className="font-semibold text-green-700">{formatCurrency(project.budget - project.spent)}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>{dir === 'rtl' ? 'التقدم' : 'Progress'}</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#1B4FFF] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          <Button onClick={handleExportReport} className="bg-[#1B4FFF] text-white hover:bg-[#0A1E39] transition-colors">
            {dir === 'rtl' ? 'تصدير التقرير' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Project Details Modal */}
    <ProjectDetailsModal
      isOpen={showProjectDetails}
      onClose={handleCloseModals}
      project={selectedProject}
      onEdit={handleEditProject}
    />
    
    {/* Edit Project Modal */}
    <EditProjectModal
      isOpen={showEditProject}
      onClose={handleCloseModals}
      project={selectedProject}
      onSave={handleSaveProject}
    />
    </>
  );
}