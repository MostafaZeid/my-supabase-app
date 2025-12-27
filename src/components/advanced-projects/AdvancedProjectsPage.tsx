import React, { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Menu, 
  X, 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  MessageSquare,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Cog
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProjectPhasesManager from "@/components/advanced-projects/ProjectPhasesManager"
import DeliverablesWorkflow from "@/components/advanced-projects/DeliverablesWorkflow"
import ProjectRequirements from "@/components/advanced-projects/ProjectRequirements"
import ProjectTeamManager from "@/components/advanced-projects/ProjectTeamManager"
import ProjectDeliverablesManager from "@/components/advanced-projects/ProjectDeliverablesManager"
import MeetingsManager from "@/components/meetings/MeetingsManager"
import ProjectCommunicationCenter from "@/components/advanced-projects/ProjectCommunicationCenter"
import AuditTrailViewer from "@/components/advanced-projects/AuditTrailViewer"
import ProjectTreeView from "@/components/tree-system/ProjectTreeView"
import AdvancedDashboard from "@/components/dashboard/AdvancedDashboard"
import DeliverableReviewManager from "@/components/advanced-projects/DeliverableReviewManager"

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  teamMembers: number
  phases: {
    total: number
    completed: number
    current: string
  }
  requirements: {
    total: number
    approved: number
    pending: number
  }
  deliverables: {
    total: number
    delivered: number
    inReview: number
  }
  lastActivity: string
  manager: string
  client: string
}

// سيتم إنشاء البيانات التجريبية داخل المكون لاستخدام الترجمة
const createMockProjects = (t: (key: string) => string, language: string): Project[] => [
  {
    id: '1',
    name: t('projects.advanced.contentManagementSystem'),
    description: t('projects.advanced.cmsDescription'),
    status: 'active',
    priority: 'high',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 150000,
    spent: 97500,
    teamMembers: 8,
    phases: {
      total: 5,
      completed: 2,
      current: language === 'ar' ? 'التطوير والبرمجة' : 'Development & Programming'
    },
    requirements: {
      total: 24,
      approved: 18,
      pending: 6
    },
    deliverables: {
      total: 12,
      delivered: 7,
      inReview: 2
    },
    lastActivity: '2024-01-20T10:30:00Z',
    manager: language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed',
    client: language === 'ar' ? 'شركة التقنية المتقدمة' : 'Advanced Technology Company'
  },
  {
    id: '2',
    name: t('projects.advanced.ecommerceSystem'),
    description: t('projects.advanced.ecommerceDescription'),
    status: 'planning',
    priority: 'medium',
    progress: 15,
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    budget: 200000,
    spent: 30000,
    teamMembers: 12,
    phases: {
      total: 6,
      completed: 0,
      current: 'التخطيط والتحليل'
    },
    requirements: {
      total: 32,
      approved: 8,
      pending: 24
    },
    deliverables: {
      total: 18,
      delivered: 1,
      inReview: 2
    },
    lastActivity: '2024-01-19T14:15:00Z',
    manager: 'سارة أحمد',
    client: 'متجر الإلكترونيات الذكية'
  }
]

const AdvancedProjectsPage: React.FC = () => {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  // إعادة إضافة selectedProject ليعمل داخل المنصة
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showManagement, setShowManagement] = useState(false)
  const [projects, setProjects] = useState<Project[]>(createMockProjects(t, language))
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  // حذف showSettingsDialog لأنه لم يعد مستخدم
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  
  // Form states
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    budget: 0,
    startDate: '',
    endDate: '',
    manager: '',
    client: ''
  })

  // تحديث البيانات عند تغيير اللغة
  useEffect(() => {
    setProjects(createMockProjects(t, language))
  }, [language, t])

  // Handler functions
  const handleCreateProject = () => {
    setShowCreateDialog(true)
  }
  
  const handleManageProject = (project: Project) => {
    // فتح صفحة إدارة المشروع داخل المنصة
    setSelectedProject(project)
    setShowManagement(true)
    setActiveTab('overview')
  }
  
  const handleBackToProjects = () => {
    setShowManagement(false)
    setSelectedProject(null)
  }
  
  const handleSaveNewProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يجب إدخال اسم المشروع" : "Project name is required",
        variant: "destructive"
      })
      return
    }
    
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      priority: newProject.priority,
      progress: 0,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      budget: newProject.budget,
      spent: 0,
      teamMembers: 1,
      phases: {
        total: 4,
        completed: 0,
        current: 'التخطيط والتحليل'
      },
      requirements: {
        total: 0,
        approved: 0,
        pending: 0
      },
      deliverables: {
        total: 0,
        delivered: 0,
        inReview: 0
      },
      lastActivity: new Date().toISOString(),
      manager: newProject.manager,
      client: newProject.client
    }
    
    setProjects([...projects, project])
    setShowCreateDialog(false)
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      budget: 0,
      startDate: '',
      endDate: '',
      manager: '',
      client: ''
    })
    
    toast({
      title: t('projects.advanced.projectCreated'),
      description: `${t('projects.advanced.projectCreatedDesc')} "${project.name}"`,
    })
  }

  // حذف هذه الوظائف لأنها أصبحت في صفحة إدارة المشروع المنفصلة

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setNewProject({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      manager: project.manager,
      client: project.client
    })
    setShowEditDialog(true)
  }
  
  const handleSaveEditProject = () => {
    if (!editingProject || !newProject.name.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال اسم المشروع",
        variant: "destructive"
      })
      return
    }
    
    const updatedProject: Project = {
      ...editingProject,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      priority: newProject.priority,
      budget: newProject.budget,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      manager: newProject.manager,
      client: newProject.client,
      lastActivity: new Date().toISOString()
    }
    
    setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p))
    setShowEditDialog(false)
    setEditingProject(null)
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      budget: 0,
      startDate: '',
      endDate: '',
      manager: '',
      client: ''
    })
    
    toast({
      title: "تم تحديث المشروع",
      description: `تم تحديث المشروع "${updatedProject.name}" بنجاح`,
    })
  }

  const handleDeleteProject = (project: Project) => {
    toast({
      title: "حذف المشروع",
      description: `هل أنت متأكد من حذف المشروع: ${project.name}؟`,
      variant: "destructive"
    })
  }

  const handleDuplicateProject = (project: Project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} - نسخة`,
      progress: 0,
      spent: 0,
      lastActivity: new Date().toISOString()
    }
    setProjects([...projects, newProject])
    toast({
      title: "تم نسخ المشروع",
      description: `تم إنشاء نسخة من المشروع: ${project.name}`,
    })
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active': return t('projects.active')
      case 'planning': return t('projects.planning')
      case 'on-hold': return t('projects.onHold')
      case 'completed': return t('projects.completed')
      case 'cancelled': return t('projects.cancelled')
      default: return language === 'ar' ? 'غير محدد' : 'Undefined'
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityText = (priority: Project['priority']) => {
    switch (priority) {
      case 'critical': return language === 'ar' ? 'حرج' : 'Critical'
      case 'high': return language === 'ar' ? 'عالي' : 'High'
      case 'medium': return language === 'ar' ? 'متوسط' : 'Medium'
      case 'low': return language === 'ar' ? 'منخفض' : 'Low'
      default: return language === 'ar' ? 'غير محدد' : 'Undefined'
    }
  }

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-lg border-r-4",
        getPriorityColor(project.priority)
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{project.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                أولوية {getPriorityText(project.priority)}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleManageProject(project); }}>
                <Cog className="mr-2 h-4 w-4" />
                إدارة المشروع
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}>
                <Edit className="mr-2 h-4 w-4" />
                تحرير
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateProject(project); }}>
                <Copy className="mr-2 h-4 w-4" />
                نسخ
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleDeleteProject(project); }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t('projects.advanced.projectProgress')}</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('projects.advanced.tabs.phases')}:</span>
              <span className="mr-1 font-medium">
                {project.phases.completed}/{project.phases.total}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t('projects.advanced.team')}:</span>
              <span className="mr-1 font-medium">{project.teamMembers}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('projects.advanced.budget')}:</span>
              <div className="font-medium">
                {project.spent.toLocaleString()} / {project.budget.toLocaleString()} ر.س
              </div>
            </div>
            <div>
              <span className="text-gray-600">{t('projects.advanced.manager')}:</span>
              <div className="font-medium">{project.manager}</div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{t('projects.advanced.currentPhaseLabel')}: {project.phases.current}</span>
              <span>{t('projects.advanced.lastActivityLabel')}: {new Date(project.lastActivity).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectsSidebar = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('projects.advanced.title')}</h1>
          <p className="text-gray-600 mt-2">{t('projects.advanced.description')}</p>
        </div>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          مشروع جديد
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-4">
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('projects.advanced.searchProjects')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="planning">تخطيط</SelectItem>
                <SelectItem value="on-hold">معلق</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      
      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('projects.advanced.noProjects')}</h3>
            <p className="text-gray-600 mb-4">{t('projects.advanced.noProjectsDesc')}</p>
            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              {t('projects.advanced.createProject')}
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  )

  // صفحة إدارة المشروع داخل المنصة
  const ProjectManagementView = () => {
    if (!selectedProject) return null

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToProjects}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('projects.advanced.backToProjects')}
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h1>
                  <p className="text-sm text-gray-600">إدارة المشروع</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(selectedProject.status)}>
                  {getStatusText(selectedProject.status)}
                </Badge>
                <Badge className={getPriorityColor(selectedProject.priority)}>
                  أولوية {getPriorityText(selectedProject.priority)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Project Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{selectedProject.progress}%</div>
                    <div className="text-sm text-gray-600">{t('projects.advanced.projectProgress')}</div>
                  </div>
                </div>
                <Progress value={selectedProject.progress} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedProject.phases.completed}/{selectedProject.phases.total}
                    </div>
                    <div className="text-sm text-gray-600">{t('projects.advanced.completedPhases')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{selectedProject.teamMembers}</div>
                    <div className="text-sm text-gray-600">أعضاء الفريق</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((selectedProject.spent / selectedProject.budget) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">الميزانية المستخدمة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Management Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-9 mb-6">
                  <TabsTrigger value="overview">{t('projects.advanced.tabs.overview')}</TabsTrigger>
                  <TabsTrigger value="team">{t('projects.advanced.tabs.team')}</TabsTrigger>
                  <TabsTrigger value="deliverables-mgmt">{t('projects.advanced.tabs.deliverablesManagement')}</TabsTrigger>
                  <TabsTrigger value="reviews">{t('projects.advanced.tabs.reviews')}</TabsTrigger>
                  <TabsTrigger value="phases">{t('projects.advanced.tabs.phases')}</TabsTrigger>
                  <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                  <TabsTrigger value="requirements">{t('projects.advanced.tabs.requirements')}</TabsTrigger>
                  <TabsTrigger value="meetings">{t('projects.advanced.tabs.meetings')}</TabsTrigger>
                  <TabsTrigger value="communication">{t('projects.advanced.tabs.communication')}</TabsTrigger>


                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="min-h-[600px]">
                    <AdvancedDashboard />
                  </div>
                </TabsContent>

                <TabsContent value="team" className="mt-6">
                  <div className="min-h-[600px]">
                    <ProjectTeamManager 
                      projectId={selectedProject.id} 
                      projectName={selectedProject.name} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="deliverables-mgmt" className="mt-6">
                  <div className="min-h-[600px]">
                    <ProjectDeliverablesManager 
                      projectId={selectedProject.id} 
                      projectName={selectedProject.name} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <div className="min-h-[600px]">
                    <DeliverableReviewManager 
                      projectId={selectedProject.id} 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phases" className="mt-6">
                  <div className="min-h-[600px]">
                    <ProjectPhasesManager />
                  </div>
                </TabsContent>







                <TabsContent value="requirements" className="mt-6">
                  <div className="min-h-[600px]">
                    <ProjectRequirements />
                  </div>
                </TabsContent>

                <TabsContent value="meetings" className="mt-6">
                  <div className="min-h-[600px]">
                    <MeetingsManager />
                  </div>
                </TabsContent>

                <TabsContent value="communication" className="mt-6">
                  <div className="min-h-[600px]">
                    <ProjectCommunicationCenter 
                      projectId={selectedProject.id}
                      projectName={selectedProject.name}
                    />
                  </div>
                </TabsContent>



                <TabsContent value="deliverables" className="mt-6">
                  <div className="min-h-[600px]">
                    <ProjectTreeView 
                      projectId={selectedProject.id}
                      projectName={selectedProject.name}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // عرض صفحة إدارة المشروع أو قائمة المشاريع
  if (showManagement && selectedProject) {
    return <ProjectManagementView />
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProjectsSidebar />
        </div>
      </div>
      
      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء مشروع جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المشروع *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="أدخل اسم المشروع"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">العميل</Label>
                <Input
                  id="client"
                  value={newProject.client}
                  onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                  placeholder="اسم العميل"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="وصف مفصل للمشروع"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">حالة المشروع</Label>
                <Select value={newProject.status} onValueChange={(value: any) => setNewProject({...newProject, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">تخطيط</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="on-hold">متوقف</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select value={newProject.priority} onValueChange={(value: any) => setNewProject({...newProject, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="critical">حرجة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية (ر.س)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager">مدير المشروع</Label>
              <Input
                id="manager"
                value={newProject.manager}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                placeholder="اسم مدير المشروع"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveNewProject}>
              إنشاء المشروع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تحرير المشروع</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم المشروع *</Label>
                <Input
                  id="edit-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="أدخل اسم المشروع"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client">العميل</Label>
                <Input
                  id="edit-client"
                  value={newProject.client}
                  onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                  placeholder="اسم العميل"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">وصف المشروع</Label>
              <Textarea
                id="edit-description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="وصف مفصل للمشروع"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">حالة المشروع</Label>
                <Select value={newProject.status} onValueChange={(value: any) => setNewProject({...newProject, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">تخطيط</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="on-hold">متوقف</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">الأولوية</Label>
                <Select value={newProject.priority} onValueChange={(value: any) => setNewProject({...newProject, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="critical">حرجة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-budget">الميزانية (ر.س)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">تاريخ البداية</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">تاريخ الانتهاء</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-manager">مدير المشروع</Label>
              <Input
                id="edit-manager"
                value={newProject.manager}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                placeholder="اسم مدير المشروع"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEditProject}>
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdvancedProjectsPage