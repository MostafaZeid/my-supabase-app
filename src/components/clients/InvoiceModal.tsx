import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  FileText,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Send,
  Download,
  Printer,
  X,
  Calculator
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
  contactPerson: {
    name: string;
    nameEn: string;
    email: string;
    phone: string;
  };
  address: {
    city: string;
    cityEn: string;
    country: string;
    countryEn: string;
  };
}

interface InvoiceItem {
  id: string;
  description: string;
  descriptionEn: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function InvoiceModal({ isOpen, onClose, client }: InvoiceModalProps) {
  const { language, dir } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    notesEn: '',
    taxRate: 15, // VAT rate in Saudi Arabia
    discountRate: 0,
    currency: 'SAR'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'استشارات إدارة الموارد البشرية',
      descriptionEn: 'HR Management Consulting',
      quantity: 1,
      unitPrice: 50000,
      total: 50000
    }
  ]);

  if (!client) return null;

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      descriptionEn: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (invoiceData.discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (invoiceData.taxRate / 100);
  const totalAmount = taxableAmount + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: invoiceData.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSave = async (action: 'save' | 'send') => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (items.length === 0) {
        toast({
          title: dir === 'rtl' ? 'خطأ في البيانات' : 'Validation Error',
          description: dir === 'rtl' ? 'يجب إضافة عنصر واحد على الأقل' : 'At least one item is required',
          variant: 'destructive',
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const actionText = action === 'save' 
        ? (dir === 'rtl' ? 'تم حفظ الفاتورة' : 'Invoice saved')
        : (dir === 'rtl' ? 'تم إرسال الفاتورة' : 'Invoice sent');

      toast({
        title: dir === 'rtl' ? 'تم بنجاح' : 'Success',
        description: actionText,
      });

      if (action === 'send') {
        setInvoiceData(prev => ({ ...prev, status: 'sent' }));
      }

      onClose();
    } catch (error) {
      toast({
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'حدث خطأ أثناء العملية' : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: dir === 'rtl' ? 'تحميل الفاتورة' : 'Download Invoice',
      description: dir === 'rtl' ? 'سيتم تحميل الفاتورة كملف PDF' : 'Invoice will be downloaded as PDF',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#1B4FFF]" />
              {dir === 'rtl' ? 'إنشاء فاتورة' : 'Create Invoice'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'طباعة' : 'Print'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'تحميل' : 'Download'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {dir === 'rtl' ? 'معلومات الشركة' : 'Company Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-[#1B4FFF]">شركة البيان للاستشارات</h3>
                  <p className="text-sm text-muted-foreground">Al Bayan Consulting Company</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{dir === 'rtl' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>+966 11 123 4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>info@albayan-consulting.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {dir === 'rtl' ? 'معلومات العميل' : 'Client Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{dir === 'rtl' ? client.organization : client.organizationEn}</h3>
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {dir === 'rtl' ? client.address.city : client.address.cityEn}, {' '}
                      {dir === 'rtl' ? client.address.country : client.address.countryEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.contactPerson.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{client.contactPerson.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {dir === 'rtl' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">
                    {dir === 'rtl' ? 'رقم الفاتورة' : 'Invoice Number'}
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {dir === 'rtl' ? 'تاريخ الفاتورة' : 'Invoice Date'}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoiceData.date}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    {dir === 'rtl' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {dir === 'rtl' ? 'حالة الفاتورة' : 'Invoice Status'}
                  </Label>
                  <Select value={invoiceData.status} onValueChange={(value) => setInvoiceData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{dir === 'rtl' ? 'مسودة' : 'Draft'}</SelectItem>
                      <SelectItem value="sent">{dir === 'rtl' ? 'مرسلة' : 'Sent'}</SelectItem>
                      <SelectItem value="paid">{dir === 'rtl' ? 'مدفوعة' : 'Paid'}</SelectItem>
                      <SelectItem value="overdue">{dir === 'rtl' ? 'متأخرة' : 'Overdue'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {dir === 'rtl' ? 'عناصر الفاتورة' : 'Invoice Items'}
                </CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'إضافة عنصر' : 'Add Item'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-4 space-y-2">
                      <Label>{dir === 'rtl' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder={dir === 'rtl' ? 'أدخل وصف الخدمة' : 'Enter service description'}
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label>{dir === 'rtl' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                      <Textarea
                        value={item.descriptionEn}
                        onChange={(e) => updateItem(item.id, 'descriptionEn', e.target.value)}
                        placeholder={dir === 'rtl' ? 'أدخل وصف الخدمة بالإنجليزية' : 'Enter service description in English'}
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <Label>{dir === 'rtl' ? 'الكمية' : 'Qty'}</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>{dir === 'rtl' ? 'السعر' : 'Unit Price'}</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <Label>{dir === 'rtl' ? 'الإجمالي' : 'Total'}</Label>
                      <div className="p-2 bg-gray-50 rounded text-sm font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'ملاحظات' : 'Notes'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">{dir === 'rtl' ? 'ملاحظات (عربي)' : 'Notes (Arabic)'}</Label>
                  <Textarea
                    id="notes"
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل أي ملاحظات إضافية' : 'Enter any additional notes'}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesEn">{dir === 'rtl' ? 'ملاحظات (إنجليزي)' : 'Notes (English)'}</Label>
                  <Textarea
                    id="notesEn"
                    value={invoiceData.notesEn}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notesEn: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'أدخل أي ملاحظات إضافية بالإنجليزية' : 'Enter any additional notes in English'}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {dir === 'rtl' ? 'ملخص الفاتورة' : 'Invoice Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{dir === 'rtl' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>{dir === 'rtl' ? 'الخصم:' : 'Discount:'}</span>
                      <Input
                        type="number"
                        value={invoiceData.discountRate}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                        className="w-16 h-6 text-xs"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-xs">%</span>
                    </div>
                    <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>{dir === 'rtl' ? 'ضريبة القيمة المضافة:' : 'VAT:'}</span>
                      <Input
                        type="number"
                        value={invoiceData.taxRate}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        className="w-16 h-6 text-xs"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-xs">%</span>
                    </div>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>{dir === 'rtl' ? 'الإجمالي النهائي:' : 'Total Amount:'}</span>
                    <span className="text-[#1B4FFF]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSave('save')} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {dir === 'rtl' ? 'حفظ كمسودة' : 'Save as Draft'}
            </Button>
            <Button 
              onClick={() => handleSave('send')} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {dir === 'rtl' ? 'إرسال الفاتورة' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}