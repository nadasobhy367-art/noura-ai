import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState('security');
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('5');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loginHistory, setLoginHistory] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // User info
  const userName = sessionStorage.getItem('userName') || 'User';
  const userRole = sessionStorage.getItem('userRole') || 'patient';
  const userId = sessionStorage.getItem('userId') || 'PT-0000';

  const content = isArabic
    ? {
        loading: 'جارٍ تحميل الإعدادات...',
        loadingSub: 'إعدادات الأمان والخصوصية',
        headerTitle: 'الإعدادات والأمان',
        headerSub: 'إدارة الحساب وتفضيلات الأمان',
        user: 'المستخدم',
        back: 'العودة للوحة التحكم',
        bannerTitle: 'مركز الأمان والخصوصية',
        bannerSub: 'إدارة أمان حسابك وإعدادات الخصوصية والتفضيلات',
        bannerTags: ['🔐 تشفير شامل', '🛡️ متوافق مع HIPAA', '📊 تحكم في الخصوصية'],
        securityLevel: 'مستوى الأمان: مرتفع',
        tabs: {
          security: '🔐 الأمان',
          privacy: '🛡️ الخصوصية',
          notifications: '🔔 الإشعارات',
          devices: '💻 الأجهزة',
          admin: '👑 الإدارة',
        },
        alerts: {
          logoutAll:
            'هل أنت متأكد من تسجيل الخروج من جميع الأجهزة؟ ستحتاج إلى تسجيل الدخول مرة أخرى على كل الأجهزة.',
          logoutAllDone: 'تم تسجيل الخروج من جميع الأجهزة بنجاح.',
          cannotRevoke: 'لا يمكنك إلغاء الجهاز الحالي. استخدم جهازًا آخر لإلغاء هذا الجهاز.',
          revoke: 'إلغاء وصول الجهاز {name}؟',
          revoked: 'تم إلغاء وصول الجهاز.',
          export: 'تم بدء تصدير البيانات. ستصلك رسالة بريد إلكتروني ببياناتك قريبًا.',
          delete:
            '⚠️ تحذير: سيؤدي هذا إلى حذف حسابك وكل البيانات المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء.\n\nهل أنت متأكد تمامًا؟',
          deleteDone: 'تم إرسال طلب حذف الحساب. ستصلك رسالة تأكيد بالبريد الإلكتروني.',
          save: 'تم حفظ الإعدادات بنجاح!',
          reset: 'إعادة كل الإعدادات إلى الوضع الافتراضي؟',
          resetDone: 'تمت إعادة الإعدادات إلى الوضع الافتراضي.',
        },
        securityTitle: 'إعدادات الأمان',
        twoFactor: 'المصادقة الثنائية (2FA)',
        twoFactorSub: 'أضف طبقة حماية إضافية إلى حسابك',
        enabled: 'مفعّل',
        disabled: 'غير مفعّل',
        twoFactorOn: 'المصادقة الثنائية مفعلة لحسابك',
        twoFactorOnSub:
          'سيُطلب منك إدخال رمز تحقق من تطبيق المصادقة عند تسجيل الدخول من أجهزة جديدة.',
        twoFactorChange: 'تغيير طريقة 2FA أو خيارات الاسترداد',
        twoFactorOff: 'المصادقة الثنائية غير مفعلة',
        twoFactorOffSub:
          'فعّل المصادقة الثنائية لتعزيز الأمان. نوصي باستخدام Google Authenticator أو Authy.',
        setup2fa: 'إعداد 2FA',
        sessionSettings: 'إعدادات الجلسة',
        autoLogout: 'تسجيل الخروج التلقائي بعد عدم النشاط',
        minutes5: '5 دقائق',
        sessionHint: 'لأسباب أمنية، الوضع الافتراضي للنظام هو 5 دقائق.',
        password: 'كلمة المرور',
        passwordAge: 'تم تغييرها آخر مرة منذ 30 يومًا',
        changePassword: 'تغيير كلمة المرور',
        securityActivity: 'نشاط الأمان',
        lastPasswordChange: 'آخر تغيير لكلمة المرور',
        days30: 'منذ 30 يومًا',
        twoFactorEnabled: 'تم تفعيل 2FA',
        yes: 'نعم',
        suspicious: 'محاولات تسجيل دخول مشبوهة',
        suspiciousValue: '1 خلال آخر 30 يومًا',
        activeSessions: 'الجلسات النشطة',
        device: 'جهاز',
        privacyTitle: 'إعدادات الخصوصية',
        dataSharing: 'مشاركة البيانات والبحث',
        anonymousResearch: 'بيانات مجهولة للأبحاث',
        anonymousResearchSub: 'ساهم ببيانات مجهولة في الأبحاث الطبية',
        analytics: 'التحليلات والتحسين',
        analyticsSub: 'ساعد في تحسين نورا AI من خلال مشاركة بيانات الاستخدام',
        dataManagement: 'إدارة البيانات',
        exportYourData: 'تصدير بياناتك',
        exportYourDataSub: 'تحميل نسخة من بياناتك الطبية وسجلّك',
        exportBtn: 'تصدير البيانات',
        deleteAccount: 'حذف الحساب',
        deleteAccountSub: 'حذف حسابك وكل البيانات نهائيًا',
        deleteBtn: 'حذف الحساب',
        deleteWarnTitle: 'تحذير: حذف الحساب',
        deleteWarnSub:
          'لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع بياناتك الطبية وسجلك ومعلومات حسابك نهائيًا.',
        privacyControls: 'عناصر تحكم الخصوصية',
        doctorList: 'الظهور في قائمة مرضى الطبيب',
        doctorListSub: 'السماح للأطباء برؤيتك ضمن قوائم المرضى الخاصة بهم',
        systemMessages: 'استلام رسائل النظام',
        systemMessagesSub: 'الحصول على التحديثات والإعلانات من النظام',
        notificationsTitle: 'إعدادات الإشعارات',
        channels: 'قنوات الإشعارات',
        emailNotifications: 'إشعارات البريد الإلكتروني',
        emailNotificationsSub: 'استلام الإشعارات عبر البريد الإلكتروني',
        pushNotifications: 'الإشعارات الفورية',
        pushNotificationsSub: 'استلام الإشعارات داخل المتصفح أو التطبيق',
        smsNotifications: 'إشعارات SMS',
        smsNotificationsSub: 'استلام التنبيهات المهمة عبر الرسائل النصية',
        notificationTypes: 'أنواع الإشعارات',
        scanReady: 'جاهزية نتائج الفحص',
        scanReadySub: 'عند اكتمال تحليل الفحص',
        doctorMessages: 'رسائل الطبيب',
        doctorMessagesSub: 'عند استلام رسالة من الطبيب',
        appointmentReminders: 'تذكيرات المواعيد',
        appointmentRemindersSub: 'تذكيرات بالمواعيد القادمة',
        securityAlerts: 'تنبيهات الأمان',
        securityAlertsSub: 'إشعارات أمنية مهمة',
        devicesTitle: 'إدارة الأجهزة',
        activeDevices: 'الأجهزة النشطة',
        activeDevicesSub: 'الأجهزة المسجل دخولها حاليًا إلى حسابك',
        logoutAllBtn: 'تسجيل الخروج من جميع الأجهزة',
        currentDevice: 'الجهاز الحالي',
        revokeBtn: 'إلغاء',
        lastActive: 'آخر نشاط',
        location: 'الموقع',
        loginHistory: 'سجل تسجيل الدخول',
        dateTime: 'التاريخ والوقت',
        deviceCol: 'الجهاز',
        locationCol: 'الموقع',
        ip: 'عنوان IP',
        status: 'الحالة',
        success: '✅ ناجح',
        failed: '❌ فشل',
        adminTitle: 'إعدادات الإدارة',
        systemConfig: 'إعدادات النظام',
        maintenanceMode: 'وضع الصيانة',
        maintenanceModeSub: 'وضع النظام في حالة صيانة',
        modelVersion: 'إصدار نموذج الذكاء الاصطناعي',
        currentModel: 'الحالي: NouraAI v2.6',
        updateModel: 'تحديث النموذج',
        securityConfig: 'إعدادات الأمان',
        passwordPolicy: 'سياسة كلمة المرور',
        policy1: 'قياسية (8+ أحرف)',
        policy2: 'قوية (12+ حرفًا مع رموز خاصة)',
        policy3: 'قصوى (16+ حرفًا مع 2FA إلزامي)',
        auditLogging: 'سجل التدقيق',
        auditLoggingSub: 'تسجيل جميع أنشطة النظام',
        saveAll: '💾 حفظ كل الإعدادات',
        resetAll: '🔄 إعادة للوضع الافتراضي',
        signOut: '🚪 تسجيل الخروج',
        role: 'الدور',
        lastUpdate: 'آخر تحديث للإعدادات: اليوم',
        footer1: '© 2026 إعدادات وأمان نورا AI. جميع الحقوق محفوظة.',
        footer2: 'مستوى الأمان: مرتفع • التشفير: AES-256 • التوافق: HIPAA, GDPR',
        footerBadges: ['🔐 تشفير شامل', '🛡️ الخصوصية أولًا', '📊 تحكم كامل'],
        signOutTitle: 'تأكيد تسجيل الخروج',
        signOutSub:
          'هل أنت متأكد من تسجيل الخروج؟ ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى حسابك.',
        cancel: 'إلغاء',
        signOutConfirm: 'تسجيل الخروج',
      }
    : {
        loading: 'Loading settings...',
        loadingSub: 'Security & Privacy Configuration',
        headerTitle: 'Settings & Security',
        headerSub: 'Manage your account and security preferences',
        user: 'User',
        back: 'Back to Dashboard',
        bannerTitle: 'Security & Privacy Center',
        bannerSub: 'Manage your account security, privacy settings, and preferences',
        bannerTags: ['🔐 End-to-End Encryption', '🛡️ HIPAA Compliant', '📊 Privacy Controls'],
        securityLevel: 'Security Level: High',
        tabs: {
          security: '🔐 Security',
          privacy: '🛡️ Privacy',
          notifications: '🔔 Notifications',
          devices: '💻 Devices',
          admin: '👑 Admin',
        },
        alerts: {
          logoutAll:
            'Are you sure you want to log out from all devices? You will need to log in again on all devices.',
          logoutAllDone: 'Logged out from all devices successfully.',
          cannotRevoke:
            'You cannot revoke your current device. Please use another device to revoke this one.',
          revoke: 'Revoke access for {name}?',
          revoked: 'Device access revoked.',
          export: 'Data export initiated. You will receive an email with your data shortly.',
          delete:
            '⚠️ WARNING: This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you absolutely sure?',
          deleteDone: 'Account deletion request submitted. You will receive a confirmation email.',
          save: 'Settings saved successfully!',
          reset: 'Reset all settings to default?',
          resetDone: 'Settings reset to default.',
        },
        securityTitle: 'Security Settings',
        twoFactor: 'Two-Factor Authentication (2FA)',
        twoFactorSub: 'Add an extra layer of security to your account',
        enabled: 'Enabled',
        disabled: 'Disabled',
        twoFactorOn: '2FA is enabled for your account',
        twoFactorOnSub:
          'You will be required to enter a verification code from your authenticator app when logging in from new devices.',
        twoFactorChange: 'Change 2FA method or recovery options',
        twoFactorOff: '2FA is not enabled',
        twoFactorOffSub:
          'Enable 2FA for enhanced security. We recommend using Google Authenticator or Authy.',
        setup2fa: 'Set up 2FA',
        sessionSettings: 'Session Settings',
        autoLogout: 'Automatic Logout After Inactivity',
        minutes5: '5 minutes',
        sessionHint: 'For security, the system default is 5 minutes.',
        password: 'Password',
        passwordAge: 'Last changed 30 days ago',
        changePassword: 'Change Password',
        securityActivity: 'Security Activity',
        lastPasswordChange: 'Last password change',
        days30: '30 days ago',
        twoFactorEnabled: '2FA enabled',
        yes: 'Yes',
        suspicious: 'Suspicious login attempts',
        suspiciousValue: '1 in last 30 days',
        activeSessions: 'Active sessions',
        device: 'device',
        privacyTitle: 'Privacy Settings',
        dataSharing: 'Data Sharing & Research',
        anonymousResearch: 'Anonymous Data for Research',
        anonymousResearchSub: 'Contribute anonymized data to medical research',
        analytics: 'Analytics & Improvement',
        analyticsSub: 'Help improve Noura AI by sharing usage data',
        dataManagement: 'Data Management',
        exportYourData: 'Export Your Data',
        exportYourDataSub: 'Download a copy of your medical data and history',
        exportBtn: 'Export Data',
        deleteAccount: 'Delete Account',
        deleteAccountSub: 'Permanently delete your account and all data',
        deleteBtn: 'Delete Account',
        deleteWarnTitle: 'Warning: Account Deletion',
        deleteWarnSub:
          'This action cannot be undone. All your medical data, history, and account information will be permanently deleted.',
        privacyControls: 'Privacy Controls',
        doctorList: "Show in Doctor's Patient List",
        doctorListSub: 'Allow doctors to see you in their patient lists',
        systemMessages: 'Receive System Messages',
        systemMessagesSub: 'Get updates and announcements from the system',
        notificationsTitle: 'Notification Settings',
        channels: 'Notification Channels',
        emailNotifications: 'Email Notifications',
        emailNotificationsSub: 'Receive notifications via email',
        pushNotifications: 'Push Notifications',
        pushNotificationsSub: 'Receive push notifications in browser/app',
        smsNotifications: 'SMS Notifications',
        smsNotificationsSub: 'Receive important alerts via SMS',
        notificationTypes: 'Notification Types',
        scanReady: 'Scan Results Ready',
        scanReadySub: 'When your scan analysis is complete',
        doctorMessages: 'Doctor Messages',
        doctorMessagesSub: 'When you receive a message from your doctor',
        appointmentReminders: 'Appointment Reminders',
        appointmentRemindersSub: 'Reminders for upcoming appointments',
        securityAlerts: 'Security Alerts',
        securityAlertsSub: 'Important security-related notifications',
        devicesTitle: 'Device Management',
        activeDevices: 'Active Devices',
        activeDevicesSub: 'Devices currently logged into your account',
        logoutAllBtn: 'Logout All Devices',
        currentDevice: 'Current Device',
        revokeBtn: 'Revoke',
        lastActive: 'Last Active',
        location: 'Location',
        loginHistory: 'Login History',
        dateTime: 'Date & Time',
        deviceCol: 'Device',
        locationCol: 'Location',
        ip: 'IP Address',
        status: 'Status',
        success: '✅ Success',
        failed: '❌ Failed',
        adminTitle: 'Admin Settings',
        systemConfig: 'System Configuration',
        maintenanceMode: 'System Maintenance Mode',
        maintenanceModeSub: 'Put system in maintenance mode',
        modelVersion: 'AI Model Version',
        currentModel: 'Current: NouraAI v2.6',
        updateModel: 'Update Model',
        securityConfig: 'Security Configuration',
        passwordPolicy: 'Password Policy',
        policy1: 'Standard (8+ characters)',
        policy2: 'Strong (12+ characters with special chars)',
        policy3: 'Maximum (16+ characters with 2FA required)',
        auditLogging: 'Audit Logging',
        auditLoggingSub: 'Log all system activities',
        saveAll: '💾 Save All Settings',
        resetAll: '🔄 Reset to Default',
        signOut: '🚪 Sign Out',
        role: 'Role',
        lastUpdate: 'Last settings update: Today',
        footer1: '© 2026 Noura AI Settings & Security. All rights reserved.',
        footer2: 'Security Level: High • Encryption: AES-256 • Compliance: HIPAA, GDPR',
        footerBadges: ['🔐 End-to-End Encryption', '🛡️ Privacy First', '📊 Full Control'],
        signOutTitle: 'Sign Out Confirmation',
        signOutSub:
          'Are you sure you want to sign out? You will need to log in again to access your account.',
        cancel: 'Cancel',
        signOutConfirm: 'Sign Out',
      };

  const formatText = (template, values = {}) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, value),
      template
    );

  // ==================== INITIAL DATA ====================
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoginHistory([
        {
          id: 1,
          date: '2026-03-27 14:36:19',
          device: 'Chrome on Windows 10',
          location: 'Cairo, Egypt',
          ip: '192.168.1.100',
          status: 'success',
        },
        {
          id: 2,
          date: '2026-03-27 10:15:22',
          device: 'Safari on macOS',
          location: 'Cairo, Egypt',
          ip: '192.168.1.101',
          status: 'success',
        },
        {
          id: 3,
          date: '2026-03-26 18:45:10',
          device: 'Firefox on Linux',
          location: 'Alexandria, Egypt',
          ip: '203.0.113.25',
          status: 'success',
        },
        {
          id: 4,
          date: '2026-03-25 22:30:05',
          device: 'Android Noura AI App',
          location: 'Giza, Egypt',
          ip: '192.168.1.102',
          status: 'success',
        },
        {
          id: 5,
          date: '2026-03-24 15:20:33',
          device: 'Chrome on Windows 11',
          location: 'Cairo, Egypt',
          ip: '192.168.1.100',
          status: 'failed',
        },
      ]);

      setConnectedDevices([
        {
          id: 1,
          name: 'Primary Laptop',
          type: 'Windows PC',
          lastActive: '2026-03-27 14:36:19',
          location: 'Cairo, Egypt',
          current: true,
        },
        {
          id: 2,
          name: 'iPhone 14',
          type: 'iOS Device',
          lastActive: '2026-03-27 10:15:22',
          location: 'Cairo, Egypt',
          current: false,
        },
        {
          id: 3,
          name: 'Home Desktop',
          type: 'Linux PC',
          lastActive: '2026-03-26 18:45:10',
          location: 'Alexandria, Egypt',
          current: false,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // ==================== FUNCTIONS ====================
  const formatDateTime = dateTimeString => {
    const date = new Date(dateTimeString.replace(' ', 'T'));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogoutAllDevices = () => {
    if (window.confirm(content.alerts.logoutAll)) {
      alert(content.alerts.logoutAllDone);
      setConnectedDevices(
        connectedDevices.map(device =>
          device.current ? device : { ...device, lastActive: 'Logged out' }
        )
      );
    }
  };

  const handleRevokeDevice = deviceId => {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (device?.current) {
      alert(content.alerts.cannotRevoke);
      return;
    }

    if (window.confirm(formatText(content.alerts.revoke, { name: device?.name || '' }))) {
      setConnectedDevices(connectedDevices.filter(d => d.id !== deviceId));
      alert(content.alerts.revoked);
    }
  };

  const handleExportData = () => {
    alert(content.alerts.export);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(content.alerts.delete)) {
      alert(content.alerts.deleteDone);
    }
  };

  const handleSaveSettings = () => {
    alert(content.alerts.save);
  };

  const handleResetSettings = () => {
    if (window.confirm(content.alerts.reset)) {
      setTwoFactorEnabled(true);
      setSessionTimeout('5');
      setEmailNotifications(true);
      setPushNotifications(true);
      alert(content.alerts.resetDone);
    }
  };

  const handleLogout = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">{content.loading}</p>
          <p className="text-gray-400 text-sm mt-2">{content.loadingSub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚙️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{content.headerTitle}</h1>
                <p className="text-xs text-gray-500">{content.headerSub}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                <span className="font-medium">{content.user}:</span> {userName} ({userRole})
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                {content.back}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{content.bannerTitle}</h2>
                  <p className="text-blue-100">{content.bannerSub}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {content.bannerTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold">🛡️</div>
                    <p className="text-sm mt-2 text-blue-100">{content.securityLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {content.tabs.security}
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'privacy'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {content.tabs.privacy}
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'notifications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {content.tabs.notifications}
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'devices'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {content.tabs.devices}
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'admin'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {content.tabs.admin}
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{content.securityTitle}</h3>

                <div className="space-y-8">
                  {/* Two-Factor Authentication */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{content.twoFactor}</h4>
                        <p className="text-gray-600 text-sm">{content.twoFactorSub}</p>
                      </div>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${
                          twoFactorEnabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {twoFactorEnabled ? content.enabled : content.disabled}
                      </button>
                    </div>

                    {twoFactorEnabled ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          <span className="text-green-700">{content.twoFactorOn}</span>
                        </div>
                        <p className="text-green-600 text-sm mt-2">{content.twoFactorOnSub}</p>
                        <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          {content.twoFactorChange}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-yellow-600 mr-2">⚠️</span>
                          <span className="text-yellow-700">{content.twoFactorOff}</span>
                        </div>
                        <p className="text-yellow-600 text-sm mt-2">{content.twoFactorOffSub}</p>
                        <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                          {content.setup2fa}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Session Timeout */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.sessionSettings}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {content.autoLogout}
                        </label>
                        <select
                          value={sessionTimeout}
                          onChange={e => setSessionTimeout(e.target.value)}
                          className="w-full md:w-64 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="5">{content.minutes5}</option>
                        </select>
                        <p className="text-gray-500 text-xs mt-2">{content.sessionHint}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.password}</div>
                          <div className="text-gray-600 text-sm">{content.passwordAge}</div>
                        </div>
                        <button className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 text-sm">
                          {content.changePassword}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security Activity */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.securityActivity}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{content.lastPasswordChange}</span>
                        <span className="font-medium">{content.days30}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{content.twoFactorEnabled}</span>
                        <span className="font-medium text-green-600">{content.yes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{content.suspicious}</span>
                        <span className="font-medium">{content.suspiciousValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{content.activeSessions}</span>
                        <span className="font-medium">
                          {connectedDevices.filter(d => d.current).length} {content.device}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{content.privacyTitle}</h3>

                <div className="space-y-8">
                  {/* Data Sharing */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.dataSharing}</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {content.anonymousResearch}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {content.anonymousResearchSub}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.analytics}</div>
                          <div className="text-gray-600 text-sm">{content.analyticsSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.dataManagement}</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.exportYourData}</div>
                          <div className="text-gray-600 text-sm">{content.exportYourDataSub}</div>
                        </div>
                        <button
                          onClick={handleExportData}
                          className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 text-sm"
                        >
                          {content.exportBtn}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.deleteAccount}</div>
                          <div className="text-gray-600 text-sm">{content.deleteAccountSub}</div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 text-sm"
                        >
                          {content.deleteBtn}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2">⚠️</span>
                        <div>
                          <p className="text-red-700 font-medium">{content.deleteWarnTitle}</p>
                          <p className="text-red-600 text-sm mt-1">{content.deleteWarnSub}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Controls */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.privacyControls}</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.doctorList}</div>
                          <div className="text-gray-600 text-sm">{content.doctorListSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.systemMessages}</div>
                          <div className="text-gray-600 text-sm">{content.systemMessagesSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {content.notificationsTitle}
                </h3>

                <div className="space-y-8">
                  {/* Notification Channels */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.channels}</h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {content.emailNotifications}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {content.emailNotificationsSub}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {content.pushNotifications}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {content.pushNotificationsSub}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={pushNotifications}
                            onChange={() => setPushNotifications(!pushNotifications)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {content.smsNotifications}
                          </div>
                          <div className="text-gray-600 text-sm">{content.smsNotificationsSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.notificationTypes}</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.scanReady}</div>
                          <div className="text-gray-600 text-sm">{content.scanReadySub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.doctorMessages}</div>
                          <div className="text-gray-600 text-sm">{content.doctorMessagesSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {content.appointmentReminders}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {content.appointmentRemindersSub}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.securityAlerts}</div>
                          <div className="text-gray-600 text-sm">{content.securityAlertsSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{content.devicesTitle}</h3>

                <div className="space-y-8">
                  {/* Current Devices */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="font-bold text-gray-900">{content.activeDevices}</h4>
                        <p className="text-gray-600 text-sm">{content.activeDevicesSub}</p>
                      </div>
                      <button
                        onClick={handleLogoutAllDevices}
                        className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 text-sm"
                      >
                        {content.logoutAllBtn}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {connectedDevices.map(device => (
                        <div key={device.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                                <span className="text-blue-600">
                                  {device.type.includes('Windows')
                                    ? '💻'
                                    : device.type.includes('iOS')
                                      ? '📱'
                                      : '🖥️'}
                                </span>
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{device.name}</h5>
                                <p className="text-gray-600 text-sm">{device.type}</p>
                              </div>
                            </div>
                            {device.current ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                {content.currentDevice}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRevokeDevice(device.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                              >
                                {content.revokeBtn}
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">{content.lastActive}:</span>
                              <span className="font-medium ml-2">
                                {formatDateTime(device.lastActive)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">{content.location}:</span>
                              <span className="font-medium ml-2">{device.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-6">{content.loginHistory}</h4>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              {content.dateTime}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              {content.deviceCol}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              {content.locationCol}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              {content.ip}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">
                              {content.status}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistory.map(login => (
                            <tr key={login.id} className="border-b border-gray-100">
                              <td className="py-3 px-4">{formatDateTime(login.date)}</td>
                              <td className="py-3 px-4">
                                <div className="font-medium">{login.device}</div>
                              </td>
                              <td className="py-3 px-4">{login.location}</td>
                              <td className="py-3 px-4 font-mono text-sm">{login.ip}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    login.status === 'success'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {login.status === 'success' ? content.success : content.failed}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Tab (Only for Admins) */}
            {activeTab === 'admin' && userRole === 'admin' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{content.adminTitle}</h3>

                <div className="space-y-8">
                  {/* System Settings */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.systemConfig}</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.maintenanceMode}</div>
                          <div className="text-gray-600 text-sm">{content.maintenanceModeSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.modelVersion}</div>
                          <div className="text-gray-600 text-sm">{content.currentModel}</div>
                        </div>
                        <button className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 text-sm">
                          {content.updateModel}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">{content.securityConfig}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {content.passwordPolicy}
                        </label>
                        <select className="w-full md:w-64 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>{content.policy1}</option>
                          <option>{content.policy2}</option>
                          <option>{content.policy3}</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{content.auditLogging}</div>
                          <div className="text-gray-600 text-sm">{content.auditLoggingSub}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
              >
                {content.saveAll}
              </button>

              <button
                onClick={handleResetSettings}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                {content.resetAll}
              </button>

              <button
                onClick={handleLogout}
                className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50"
              >
                {content.signOut}
              </button>
            </div>

            <div className="text-sm text-gray-500 mt-4 sm:mt-0">
              <p>
                {content.user} ID: {userId} • {content.role}: {userRole}
              </p>
              <p className="text-xs">{content.lastUpdate}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">{content.footer1}</p>
          <p className="text-gray-500 text-xs mt-2">{content.footer2}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <span className="text-xs text-gray-500">{content.footerBadges[0]}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{content.footerBadges[1]}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{content.footerBadges[2]}</span>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-red-600">🚪</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{content.signOutTitle}</h3>
                <p className="text-gray-600">{content.signOutSub}</p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  {content.cancel}
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  {content.signOutConfirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
