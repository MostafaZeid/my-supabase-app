import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Activity, Globe, UserPlus, Clock, CheckCircle } from 'lucide-react';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const { signIn, signUp } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();
  const { toast } = useToast();

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '' as UserRole,
    organization: '',
  });

  // Self-signup form for clients
  const [selfSignupData, setSelfSignupData] = useState({
    email: '',
    fullName: '',
    phone: '',
    organization: '',
    requestedRole: 'main_client' as 'main_client' | 'sub_client',
    registrationReason: '',
  });

  const [signupSubmitted, setSignupSubmitted] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: language === 'ar' ? "خطأ في تسجيل الدخول" : "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === 'ar' ? "تم تسجيل الدخول بنجاح" : "Sign In Successful",
          description: language === 'ar' ? "مرحباً بك في المنصة" : "Welcome to the platform",
        });
      }
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ في تسجيل الدخول" : "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: language === 'ar' ? "خطأ في كلمة المرور" : "Password Error",
        description: language === 'ar' ? "كلمة المرور وتأكيد كلمة المرور غير متطابقتين" : "Password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUp(
        signUpData.email, 
        signUpData.password, 
        { 
          full_name: signUpData.fullName,
          role: signUpData.role,
          organization: signUpData.organization
        }
      );
      
      if (error) {
        toast({
          title: language === 'ar' ? "خطأ في إنشاء الحساب" : "Account Creation Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === 'ar' ? "تم إنشاء الحساب بنجاح" : "Account Created Successfully",
          description: language === 'ar' ? "مرحباً بك في المنصة" : "Welcome to the platform",
        });
      }
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ في إنشاء الحساب" : "Account Creation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call to self-signup endpoint
      // In real implementation, this would call the Edge Function
      const response = await fetch('/api/auth/self-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selfSignupData),
      });

      if (response.ok) {
        setSignupSubmitted(true);
        toast({
          title: language === 'ar' ? "تم استلام طلب التسجيل" : "Registration Request Received",
          description: language === 'ar' ? "سيتم مراجعة طلبك والرد عليك قريباً عبر البريد الإلكتروني" : "Your request will be reviewed and you will receive a response via email soon",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: language === 'ar' ? "خطأ في إرسال الطلب" : "Request Submission Error",
          description: errorData.error || (language === 'ar' ? "حدث خطأ أثناء إرسال طلب التسجيل" : "An error occurred while submitting the registration request"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // For demo purposes, simulate successful submission
      setSignupSubmitted(true);
      toast({
        title: language === 'ar' ? "تم استلام طلب التسجيل" : "Registration Request Received",
        description: language === 'ar' ? "سيتم مراجعة طلبك والرد عليك قريباً عبر البريد الإلكتروني" : "Your request will be reviewed and you will receive a response via email soon",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginOptions = [
    { 
      email: 'admin@system.com', 
      role: 'system_admin', 
      name: language === 'ar' ? 'مدير النظام' : 'System Admin', 
      color: 'bg-red-500 hover:bg-red-600' 
    },
    { 
      email: 'manager@project.com', 
      role: 'project_manager', 
      name: language === 'ar' ? 'مدير المشروع' : 'Project Manager', 
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    { 
      email: 'consultant@project.com', 
      role: 'project_consultant', 
      name: language === 'ar' ? 'مستشار المشروع' : 'Project Consultant', 
      color: 'bg-green-500 hover:bg-green-600' 
    },
    { 
      email: 'main@client.com', 
      role: 'main_client', 
      name: language === 'ar' ? 'عميل رئيسي' : 'Main Client', 
      color: 'bg-purple-500 hover:bg-purple-600' 
    },
    { 
      email: 'sub@client.com', 
      role: 'sub_client', 
      name: language === 'ar' ? 'عميل فرعي' : 'Sub Client', 
      color: 'bg-orange-500 hover:bg-orange-600' 
    },
  ];

  const handleQuickLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, '123456');
      
      if (error) {
        toast({
          title: language === 'ar' ? "خطأ في تسجيل الدخول" : "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === 'ar' ? "تم تسجيل الدخول بنجاح" : "Sign In Successful",
          description: language === 'ar' ? "مرحباً بك في المنصة" : "Welcome to the platform",
        });
      }
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ في تسجيل الدخول" : "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Selector */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">
                {language === 'ar' ? 'منصة البيان' : 'Al-Bayan Platform'}
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'منصة إدارة المشاريع والإجراءات' : 'Projects & Procedures Management Platform'}
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                <TabsTrigger value="client-signup" className="flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  {t('auth.requestSignup')}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth.email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth.password')}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (language === 'ar' ? "جاري تسجيل الدخول..." : "Signing in...") : t('auth.signIn')}
                  </Button>
                </form>

                {/* Quick Login Options */}
                <div className="space-y-3">
                  <div className="text-center text-sm text-muted-foreground">
                    {language === 'ar' ? 'أو تسجيل دخول سريع للتجربة' : 'Or quick login for demo'}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {quickLoginOptions.map((option) => (
                      <Button
                        key={option.email}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickLogin(option.email)}
                        disabled={isLoading}
                        className={`${option.color} text-white border-0 hover:text-white`}
                      >
                        {option.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">{t('auth.fullName')}</Label>
                    <Input
                      id="signup-fullname"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-organization">{t('auth.organization')} ({t('form.optional')})</Label>
                    <Input
                      id="signup-organization"
                      value={signUpData.organization}
                      onChange={(e) => setSignUpData({ ...signUpData, organization: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">{t('auth.role')}</Label>
                    <Select value={signUpData.role} onValueChange={(value: UserRole) => setSignUpData({ ...signUpData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project_consultant">{t('roles.project_consultant')}</SelectItem>
                        <SelectItem value="main_client">{t('roles.main_client')}</SelectItem>
                        <SelectItem value="sub_client">{t('roles.sub_client')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (language === 'ar' ? "جاري إنشاء الحساب..." : "Creating account...") : t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>

              {/* Client Self-Signup Tab */}
              <TabsContent value="client-signup" className="space-y-4">
                {!signupSubmitted ? (
                  <form onSubmit={handleSelfSignup} className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      {language === 'ar' ? 'طلب تسجيل جديد للعملاء - سيتم مراجعة الطلب من قبل الإدارة' : 'New client registration request - will be reviewed by administration'}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-signup-fullname">{t('auth.fullName')} *</Label>
                      <Input
                        id="self-signup-fullname"
                        value={selfSignupData.fullName}
                        onChange={(e) => setSelfSignupData({ ...selfSignupData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-signup-email">{t('auth.email')} *</Label>
                      <Input
                        id="self-signup-email"
                        type="email"
                        value={selfSignupData.email}
                        onChange={(e) => setSelfSignupData({ ...selfSignupData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-signup-phone">{t('auth.phone')}</Label>
                      <Input
                        id="self-signup-phone"
                        type="tel"
                        value={selfSignupData.phone}
                        onChange={(e) => setSelfSignupData({ ...selfSignupData, phone: e.target.value })}
                        placeholder="+966xxxxxxxxx"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-signup-organization">{t('auth.organization')}</Label>
                      <Input
                        id="self-signup-organization"
                        value={selfSignupData.organization}
                        onChange={(e) => setSelfSignupData({ ...selfSignupData, organization: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-signup-role">{language === 'ar' ? 'نوع العضوية المطلوبة' : 'Requested Membership Type'} *</Label>
                      <Select 
                        value={selfSignupData.requestedRole} 
                        onValueChange={(value: 'main_client' | 'sub_client') => 
                          setSelfSignupData({ ...selfSignupData, requestedRole: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main_client">{t('roles.main_client')}</SelectItem>
                          <SelectItem value="sub_client">{t('roles.sub_client')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-signup-reason">{t('auth.registrationReason')}</Label>
                      <Textarea
                        id="self-signup-reason"
                        value={selfSignupData.registrationReason}
                        onChange={(e) => setSelfSignupData({ ...selfSignupData, registrationReason: e.target.value })}
                        placeholder={language === 'ar' ? "اشرح سبب حاجتك للوصول إلى المنصة..." : "Explain why you need access to the platform..."}
                        rows={3}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (language === 'ar' ? "جاري إرسال الطلب..." : "Submitting request...") : (language === 'ar' ? "إرسال طلب التسجيل" : "Submit Registration Request")}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      {language === 'ar' ? '* الحقول المطلوبة. سيتم إرسال إشعار بحالة الطلب عبر البريد الإلكتروني.' : '* Required fields. Status notification will be sent via email.'}
                    </div>
                  </form>
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-green-700">
                        {language === 'ar' ? 'تم استلام طلب التسجيل' : 'Registration Request Received'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'شكراً لك! تم استلام طلب التسجيل الخاص بك بنجاح.' : 'Thank you! Your registration request has been received successfully.'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'سيتم مراجعة الطلب من قبل فريق الإدارة والرد عليك خلال 24-48 ساعة عبر البريد الإلكتروني.' : 'The request will be reviewed by the administration team and you will receive a response within 24-48 hours via email.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {language === 'ar' ? 'حالة الطلب: في انتظار المراجعة' : 'Request Status: Pending Review'}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSignupSubmitted(false);
                        setSelfSignupData({
                          email: '',
                          fullName: '',
                          phone: '',
                          organization: '',
                          requestedRole: 'main_client',
                          registrationReason: '',
                        });
                        setActiveTab('signin');
                      }}
                    >
                      {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}