import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
}

export function InvoiceModal({ isOpen, onClose, client }: InvoiceModalProps) {
  const { dir } = useLanguage();

  // Handle invoice actions
  const handleViewInvoice = (invoiceId: string) => {
    // إغلاق المودال الحالي والانتقال إلى صفحة المخرجات
    onClose();
    // محاكاة الانتقال إلى صفحة المخرجات
    const deliverablesTab = document.querySelector('[data-tab="deliverables"]') as HTMLElement;
    if (deliverablesTab) {
      deliverablesTab.click();
    }
    alert(dir === 'rtl' ? `تم الانتقال إلى صفحة المخرجات لعرض تفاصيل الفاتورة ${invoiceId}` : `Navigated to Deliverables page to view invoice ${invoiceId} details`);
  };

  const handleCreateNewInvoice = () => {
    // إغلاق المودال الحالي والانتقال إلى صفحة المشاريع
    onClose();
    // محاكاة الانتقال إلى صفحة المشاريع
    const projectsTab = document.querySelector('[data-tab="projects"]') as HTMLElement;
    if (projectsTab) {
      projectsTab.click();
    }
    alert(dir === 'rtl' ? 'تم الانتقال إلى صفحة المشاريع لإنشاء فاتورة جديدة' : 'Navigated to Projects page to create new invoice');
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {dir === 'rtl' ? 'إدارة الفواتير' : 'Invoice Management'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'معلومات العميل' : 'Client Information'}
            </h3>
            <p><strong>{dir === 'rtl' ? 'المؤسسة:' : 'Organization:'}</strong> {dir === 'rtl' ? client.organization : client.organizationEn}</p>
            <p><strong>{dir === 'rtl' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {client.contactPerson?.email}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'الفواتير الحديثة' : 'Recent Invoices'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <div className="flex-1">
                  <span>{dir === 'rtl' ? 'فاتورة #001' : 'Invoice #001'}</span>
                  <span className="text-green-600 font-semibold ml-4">150,000 {dir === 'rtl' ? 'ريال' : 'SAR'}</span>
                </div>
                <Button 
                  onClick={() => handleViewInvoice('#001')}
                  size="sm" 
                  variant="outline" 
                  className="text-green-600 border-green-500 hover:bg-green-50"
                >
                  {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <div className="flex-1">
                  <span>{dir === 'rtl' ? 'فاتورة #002' : 'Invoice #002'}</span>
                  <span className="text-blue-600 font-semibold ml-4">80,000 {dir === 'rtl' ? 'ريال' : 'SAR'}</span>
                </div>
                <Button 
                  onClick={() => handleViewInvoice('#002')}
                  size="sm" 
                  variant="outline" 
                  className="text-blue-600 border-blue-500 hover:bg-blue-50"
                >
                  {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <div className="flex-1">
                  <span>{dir === 'rtl' ? 'فاتورة #003' : 'Invoice #003'}</span>
                  <span className="text-orange-600 font-semibold ml-4">120,000 {dir === 'rtl' ? 'ريال' : 'SAR'}</span>
                </div>
                <Button 
                  onClick={() => handleViewInvoice('#003')}
                  size="sm" 
                  variant="outline" 
                  className="text-orange-600 border-orange-500 hover:bg-orange-50"
                >
                  {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'الملخص المالي' : 'Financial Summary'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'إجمالي الفواتير' : 'Total Invoices'}</p>
                <p className="text-lg font-bold text-blue-700">350,000 {dir === 'rtl' ? 'ريال' : 'SAR'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'المبلغ المدفوع' : 'Paid Amount'}</p>
                <p className="text-lg font-bold text-green-700">280,000 {dir === 'rtl' ? 'ريال' : 'SAR'}</p>
              </div>
            </div>
            </div>
          </div>
        
        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          <Button 
            onClick={handleCreateNewInvoice}
            className="bg-[#1B4FFF] text-white hover:bg-[#0A1E39] transition-colors"
          >
            {dir === 'rtl' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}