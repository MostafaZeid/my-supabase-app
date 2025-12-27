import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onEdit?: (client: any) => void;
}

export function ClientDetailsModal({ isOpen, onClose, client, onEdit }: ClientDetailsModalProps) {
  const { dir } = useLanguage();

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {dir === 'rtl' ? 'تفاصيل العميل' : 'Client Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'معلومات المؤسسة' : 'Organization Information'}
            </h3>
            <p><strong>{dir === 'rtl' ? 'الاسم:' : 'Name:'}</strong> {dir === 'rtl' ? client.organization : client.organizationEn}</p>
            <p><strong>{dir === 'rtl' ? 'القطاع:' : 'Industry:'}</strong> {dir === 'rtl' ? client.industry : client.industryEn}</p>
            <p><strong>{dir === 'rtl' ? 'الحالة:' : 'Status:'}</strong> {client.status}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'معلومات الاتصال' : 'Contact Information'}
            </h3>
            <p><strong>{dir === 'rtl' ? 'الاسم:' : 'Name:'}</strong> {dir === 'rtl' ? client.contactPerson?.name : client.contactPerson?.nameEn}</p>
            <p><strong>{dir === 'rtl' ? 'البريد:' : 'Email:'}</strong> 
              <a href={`mailto:${client.contactPerson?.email}`} className="text-blue-600 hover:underline ml-2">
                {client.contactPerson?.email}
              </a>
            </p>
            <p><strong>{dir === 'rtl' ? 'الهاتف:' : 'Phone:'}</strong> 
              <a href={`tel:${client.contactPerson?.phone}`} className="text-blue-600 hover:underline ml-2">
                {client.contactPerson?.phone}
              </a>
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {dir === 'rtl' ? 'إحصائيات المشاريع' : 'Project Statistics'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>{dir === 'rtl' ? 'إجمالي المشاريع:' : 'Total Projects:'}</strong> {client.projects?.total || 0}</p>
              <p><strong>{dir === 'rtl' ? 'المشاريع النشطة:' : 'Active Projects:'}</strong> {client.projects?.active || 0}</p>
              <p><strong>{dir === 'rtl' ? 'المشاريع المكتملة:' : 'Completed Projects:'}</strong> {client.projects?.completed || 0}</p>
              <p><strong>{dir === 'rtl' ? 'المشاريع المعلقة:' : 'On Hold Projects:'}</strong> {client.projects?.onHold || 0}</p>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <Button variant="outline" onClick={onClose}>
            {dir === 'rtl' ? 'إغلاق' : 'Close'}
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(client)} className="bg-[#1B4FFF] text-white">
              {dir === 'rtl' ? 'تحرير' : 'Edit'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}