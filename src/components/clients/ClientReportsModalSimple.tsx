import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function ClientReportsModal({ isOpen, onClose, client }: ClientReportsModalProps) {
  const { dir } = useLanguage();

  // Handle navigation to different sections
  const handleViewPerformanceDetails = () => {
    // إغلاق المودال الحالي والانتقال إلى صفحة المشاريع
    onClose();
    // محاكاة الانتقال إلى صفحة المشاريع
    const projectsTab = document.querySelector('[data-tab="projects"]') as HTMLElement;
    if (projectsTab) {
      projectsTab.click();
    }
    alert(dir === 'rtl' ? 'تم الانتقال إلى صفحة المشاريع لعرض تفاصيل الأداء' : 'Navigated to Projects page to view performance details');
  };

  const handleViewFinancialDetails = () => {
    // إغلاق المودال الحالي والانتقال إلى صفحة الفواتير
    onClose();
    // فتح مودال الفواتير من نفس الصفحة
    setTimeout(() => {
      const invoiceButton = document.querySelector('[data-action="invoice"]') as HTMLElement;
      if (invoiceButton) {
        invoiceButton.click();
      }
    }, 100);
    alert(dir === 'rtl' ? 'تم فتح صفحة الفواتير لعرض التفاصيل المالية' : 'Opened Invoice page to view financial details');
  };

  const handleViewProjectDetails = () => {
    // إغلاق المودال الحالي والانتقال إلى صفحة المخرجات
    onClose();
    // محاكاة الانتقال إلى صفحة المخرجات
    const deliverablesTab = document.querySelector('[data-tab="deliverables"]') as HTMLElement;
    if (deliverablesTab) {
      deliverablesTab.click();
    }
    alert(dir === 'rtl' ? 'تم الانتقال إلى صفحة المخرجات لعرض تفاصيل المشاريع' : 'Navigated to Deliverables page to view project details');
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {dir === 'rtl' ? 'تقارير العميل' : 'Client Reports'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'معلومات العميل' : 'Client Information'}
            </h3>
            <p><strong>{dir === 'rtl' ? 'المؤسسة:' : 'Organization:'}</strong> {dir === 'rtl' ? client.organization : client.organizationEn}</p>
            <p><strong>{dir === 'rtl' ? 'القطاع:' : 'Industry:'}</strong> {dir === 'rtl' ? client.industry : client.industryEn}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Performance Report */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">
                {dir === 'rtl' ? 'تقرير الأداء' : 'Performance Report'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'المشاريع المكتملة:' : 'Completed Projects:'}</span>
                  <Badge className="bg-green-100 text-green-800">5</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'معدل النجاح:' : 'Success Rate:'}</span>
                  <Badge className="bg-green-100 text-green-800">95%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'التقييم:' : 'Rating:'}</span>
                  <Badge className="bg-green-100 text-green-800">4.8/5</Badge>
                </div>
              </div>
              <Button 
                onClick={handleViewPerformanceDetails}
                className="w-full mt-3 bg-green-600 text-white hover:bg-green-700 transition-colors" 
                size="sm"
              >
                {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
              </Button>
            </div>

            {/* Financial Report */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">
                {dir === 'rtl' ? 'التقرير المالي' : 'Financial Report'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'إجمالي الإيرادات:' : 'Total Revenue:'}</span>
                  <Badge className="bg-blue-100 text-blue-800">350K</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'المدفوعات:' : 'Payments:'}</span>
                  <Badge className="bg-blue-100 text-blue-800">280K</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'المستحقات:' : 'Outstanding:'}</span>
                  <Badge className="bg-blue-100 text-blue-800">70K</Badge>
                </div>
              </div>
              <Button 
                onClick={handleViewFinancialDetails}
                className="w-full mt-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors" 
                size="sm"
              >
                {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
              </Button>
            </div>

            {/* Activity Report */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3">
                {dir === 'rtl' ? 'تقرير النشاط' : 'Activity Report'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'الاجتماعات:' : 'Meetings:'}</span>
                  <Badge className="bg-purple-100 text-purple-800">12</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'المراسلات:' : 'Communications:'}</span>
                  <Badge className="bg-purple-100 text-purple-800">45</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{dir === 'rtl' ? 'آخر نشاط:' : 'Last Activity:'}</span>
                  <Badge className="bg-purple-100 text-purple-800">{dir === 'rtl' ? 'أمس' : 'Yesterday'}</Badge>
                </div>
              </div>
              <Button 
                onClick={handleViewProjectDetails}
                className="w-full mt-3 bg-purple-600 text-white hover:bg-purple-700 transition-colors" 
                size="sm"
              >
                {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'التقارير المتاحة' : 'Available Reports'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                {dir === 'rtl' ? 'تقرير شهري مفصل' : 'Detailed Monthly Report'}
              </Button>
              <Button variant="outline" className="justify-start">
                {dir === 'rtl' ? 'تقرير المشاريع' : 'Projects Report'}
              </Button>
              <Button variant="outline" className="justify-start">
                {dir === 'rtl' ? 'تقرير الفواتير' : 'Invoices Report'}
              </Button>
              <Button variant="outline" className="justify-start">
                {dir === 'rtl' ? 'تقرير الأداء السنوي' : 'Annual Performance Report'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          <Button className="bg-[#1B4FFF] text-white">
            {dir === 'rtl' ? 'تصدير جميع التقارير' : 'Export All Reports'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}