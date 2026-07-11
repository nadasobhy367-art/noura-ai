import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const exactText = {
  Dashboard: 'لوحة التحكم',
  'Admin Dashboard': 'لوحة تحكم المسؤول',
  'Doctor Dashboard': 'لوحة تحكم الطبيب',
  'Nurse Dashboard': 'لوحة تحكم التمريض',
  'Patient Dashboard': 'لوحة تحكم المريض',
  Analytics: 'التحليلات',
  Appointments: 'المواعيد',
  Messages: 'الرسائل',
  Results: 'النتائج',
  Upload: 'رفع الفحوصات',
  Settings: 'الإعدادات',
  Help: 'المساعدة',
  'Help Center': 'مركز المساعدة',
  'Audit Logs': 'سجلات التدقيق',
  'Team Management': 'إدارة الفريق',
  'Data Management': 'إدارة البيانات',
  'Recognition Dashboard': 'لوحة التعرف',
  Patients: 'المرضى',
  Doctors: 'الأطباء',
  Nurses: 'التمريض',
  Admin: 'مسؤول',
  Doctor: 'طبيب',
  Nurse: 'ممرض',
  Patient: 'مريض',
  'Sign Out': 'تسجيل الخروج',
  Logout: 'تسجيل الخروج',
  Login: 'تسجيل الدخول',
  Search: 'بحث',
  Filter: 'تصفية',
  Export: 'تصدير',
  Import: 'استيراد',
  Save: 'حفظ',
  Cancel: 'إلغاء',
  Delete: 'حذف',
  Edit: 'تعديل',
  View: 'عرض',
  Add: 'إضافة',
  Remove: 'إزالة',
  Close: 'إغلاق',
  Back: 'رجوع',
  Next: 'التالي',
  Previous: 'السابق',
  Submit: 'إرسال',
  Confirm: 'تأكيد',
  Reject: 'رفض',
  Approve: 'موافقة',
  Pending: 'قيد الانتظار',
  Confirmed: 'مؤكد',
  Cancelled: 'ملغي',
  Completed: 'مكتمل',
  Failed: 'فشل',
  Active: 'نشط',
  Inactive: 'غير نشط',
  Name: 'الاسم',
  Email: 'البريد الإلكتروني',
  Password: 'كلمة المرور',
  Role: 'الدور',
  Status: 'الحالة',
  Date: 'التاريخ',
  Time: 'الوقت',
  Location: 'الموقع',
  Phone: 'الهاتف',
  Age: 'العمر',
  Gender: 'النوع',
  Male: 'ذكر',
  Female: 'أنثى',
  Notes: 'ملاحظات',
  'Medical Scan': 'فحص طبي',
  'Scan Type': 'نوع الفحص',
  'Upload Scan': 'رفع فحص',
  'Upload New Scan': 'رفع فحص جديد',
  'View Results': 'عرض النتائج',
  'AI Analysis': 'تحليل الذكاء الاصطناعي',
  'Risk Level': 'مستوى الخطورة',
  Confidence: 'الثقة',
  Recommendation: 'التوصية',
  'Patient Name': 'اسم المريض',
  'Patient ID': 'معرف المريض',
  'Doctor Review': 'مراجعة الطبيب',
  'Send Message': 'إرسال رسالة',
  'New Message': 'رسالة جديدة',
  Recipient: 'المستلم',
  Subject: 'الموضوع',
  Message: 'الرسالة',
  'No messages': 'لا توجد رسائل',
  'No appointments': 'لا توجد مواعيد',
  'New Appointment': 'موعد جديد',
  'Schedule Appointment': 'حجز موعد',
  'Join Video Call': 'الانضمام لمكالمة فيديو',
  Call: 'اتصال',
  'Security Settings': 'إعدادات الأمان',
  'Privacy Settings': 'إعدادات الخصوصية',
  'Notification Settings': 'إعدادات الإشعارات',
  'Active Devices': 'الأجهزة النشطة',
  'Login History': 'سجل تسجيل الدخول',
  'System Settings': 'إعدادات النظام',
  'Loading...': 'جار التحميل...',
  Loading: 'جار التحميل',
  'No data available': 'لا توجد بيانات متاحة',
  'Try again': 'حاول مرة أخرى',
  Error: 'خطأ',
  Success: 'نجاح',
  Warning: 'تحذير',
  Info: 'معلومة',
  Overview: 'نظرة عامة',
  'Total Patients': 'إجمالي المرضى',
  'Total Doctors': 'إجمالي الأطباء',
  'Total Nurses': 'إجمالي التمريض',
  'Total Scans': 'إجمالي الفحوصات',
  'Recent Activity': 'النشاط الأخير',
  'Quick Actions': 'إجراءات سريعة',
  'System Status': 'حالة النظام',
  'Access Requests': 'طلبات الوصول',
  'Patient Records': 'سجلات المرضى',
  'My Patients': 'مرضاي',
  'All Patients': 'كل المرضى',
  'Patient List': 'قائمة المرضى',
  'Medical Records': 'السجلات الطبية',
  'Scan History': 'سجل الفحوصات',
  'Health Summary': 'ملخص الحالة الصحية',
  'Care Team': 'فريق الرعاية',
  'Upcoming Appointments': 'المواعيد القادمة',
  'Recent Results': 'آخر النتائج',
  'View Details': 'عرض التفاصيل',
  'Request Access': 'طلب الوصول',
  'Approve Request': 'قبول الطلب',
  'Reject Request': 'رفض الطلب',
  Reason: 'السبب',
  'Review Notes': 'ملاحظات المراجعة',
  'Analysis Results': 'نتائج التحليل',
  'Download Report': 'تحميل التقرير',
  'Export PDF': 'تصدير PDF',
  'Print Report': 'طباعة التقرير',
  'Share Results': 'مشاركة النتائج',
  Normal: 'طبيعي',
  Abnormal: 'غير طبيعي',
  'Follow-up': 'متابعة',
  'High Risk': 'خطورة عالية',
  'Medium Risk': 'خطورة متوسطة',
  'Low Risk': 'خطورة منخفضة',
  Unknown: 'غير معروف',
  Today: 'اليوم',
  Yesterday: 'أمس',
  'This Week': 'هذا الأسبوع',
  'This Month': 'هذا الشهر',
  Weekly: 'أسبوعي',
  Monthly: 'شهري',
  Daily: 'يومي',
  'Read More': 'عرض المزيد',
  'Show Less': 'عرض أقل',
  'Mark as Read': 'تحديد كمقروء',
  'Compose Message': 'إنشاء رسالة',
  'Type your message...': 'اكتب رسالتك...',
  Send: 'إرسال',
  Reply: 'رد',
  'Video Call': 'مكالمة فيديو',
  'More options': 'خيارات إضافية',
  'Search patients...': 'ابحث عن المرضى...',
  'Search messages...': 'ابحث في الرسائل...',
  'Search logs...': 'ابحث في السجلات...',
  'Search users...': 'ابحث عن المستخدمين...',
  'Choose File': 'اختيار ملف',
  'Drag and drop your file here': 'اسحب الملف وأفلته هنا',
  'Supported formats': 'الصيغ المدعومة',
  'Start Analysis': 'بدء التحليل',
  'Analyzing...': 'جار التحليل...',
  'Upload Complete': 'اكتمل الرفع',
  'Upload Failed': 'فشل الرفع',
  'Select patient': 'اختر المريض',
  'Select doctor': 'اختر الطبيب',
  'Select type': 'اختر النوع',
  'Appointment Type': 'نوع الموعد',
  'Routine Check-up': 'فحص دوري',
  Consultation: 'استشارة',
  'Lab Test': 'تحليل مخبري',
  'Cairo Medical Center': 'مركز القاهرة الطبي',
  'Current Device': 'الجهاز الحالي',
  Revoke: 'إلغاء الوصول',
  'Last Active': 'آخر نشاط',
  'Security & Privacy': 'الأمان والخصوصية',
  Notifications: 'الإشعارات',
  Devices: 'الأجهزة',
  Privacy: 'الخصوصية',
  Security: 'الأمان',
  'Two-Factor Authentication': 'المصادقة الثنائية',
  Enabled: 'مفعل',
  Disabled: 'غير مفعل',
  'Change Password': 'تغيير كلمة المرور',
  'Export Data': 'تصدير البيانات',
  'Delete Account': 'حذف الحساب',
  'Save Changes': 'حفظ التغييرات',
  'Reset to Default': 'إعادة للوضع الافتراضي',
  'Export Logs': 'تصدير السجلات',
  'Log Details': 'تفاصيل السجل',
  Action: 'الإجراء',
  User: 'المستخدم',
  Timestamp: 'الوقت',
  'IP Address': 'عنوان IP',
  Browser: 'المتصفح',
  'AI Chatbot': 'المساعد الذكي',
  'Ask Noura AI': 'اسأل نورا AI',
  'Medical Assistant': 'مساعد طبي',
  Online: 'متصل',
  'Loading system data...': 'جار تحميل بيانات النظام...',
  'Loading patient data...': 'جار تحميل بيانات المرضى...',
  'Loading your health data...': 'جار تحميل بياناتك الصحية...',
  'Loading messages...': 'جار تحميل الرسائل...',
  'Loading recognition feed...': 'جار تحميل بث التعرف...',
  'AI Medical System': 'نظام الذكاء الطبي',
  'Admin Privileges:': 'صلاحيات المسؤول:',
  'Full System Access': 'وصول كامل للنظام',
  'System Administration': 'إدارة النظام',
  'Security Level: Maximum': 'مستوى الأمان: أقصى',
  'System Administration Complete Control': 'تحكم كامل في إدارة النظام',
  'Access Requests Management': 'إدارة طلبات الوصول',
  'No Access Requests': 'لا توجد طلبات وصول',
  'Requesting access to:': 'يطلب الوصول إلى:',
  'Primary Doctor:': 'الطبيب الأساسي:',
  'Admin Notes:': 'ملاحظات المسؤول:',
  'User Management': 'إدارة المستخدمين',
  'Create and manage user accounts': 'إنشاء وإدارة حسابات المستخدمين',
  'User ID': 'معرف المستخدم',
  'Last Login': 'آخر تسجيل دخول',
  Actions: 'الإجراءات',
  Admins: 'المسؤولون',
  Event: 'الحدث',
  Severity: 'الخطورة',
  'System Configuration': 'إعدادات النظام',
  'Access Request Auto-Expiry': 'انتهاء طلب الوصول تلقائيًا',
  days: 'أيام',
  'Session Timeout': 'مهلة الجلسة',
  'Auto-logout after inactivity': 'خروج تلقائي بعد عدم النشاط',
  'Access Request Details': 'تفاصيل طلب الوصول',
  'Complete request information': 'معلومات الطلب الكاملة',
  'Requesting Doctor': 'الطبيب طالب الوصول',
  ID: 'المعرف',
  Specialty: 'التخصص',
  Department: 'القسم',
  'Request Information': 'معلومات الطلب',
  'Request Date:': 'تاريخ الطلب:',
  'Access Expires:': 'ينتهي الوصول:',
  'Reason for Access Request': 'سبب طلب الوصول',
  'Admin Review': 'مراجعة المسؤول',
  'Add New User': 'إضافة مستخدم جديد',
  'Approve Access Request': 'الموافقة على طلب الوصول',
  'Access will expire in 30 days': 'سينتهي الوصول خلال 30 يومًا',
  'Access Control:': 'التحكم في الوصول:',
  'Access Control Active': 'التحكم في الوصول مفعل',
  'Medical Professional': 'مختص طبي',
  'All Patients in System': 'كل المرضى في النظام',
  'My Assigned Patients': 'المرضى المعينون لي',
  'My Access Requests': 'طلبات الوصول الخاصة بي',
  'Pending AI Reviews': 'مراجعات الذكاء الاصطناعي المعلقة',
  'All Clear!': 'كل شيء واضح!',
  'AI Confidence': 'ثقة الذكاء الاصطناعي',
  'Model Confidence': 'ثقة النموذج',
  'AI Recommendation:': 'توصية الذكاء الاصطناعي:',
  'Medical Analytics': 'التحليلات الطبية',
  'AI Performance Metrics': 'مؤشرات أداء الذكاء الاصطناعي',
  'Accuracy Rate': 'معدل الدقة',
  'Doctor Override Rate': 'معدل تعديل الطبيب',
  'Average Review Time': 'متوسط وقت المراجعة',
  'Patient Distribution': 'توزيع المرضى',
  'By Risk Level': 'حسب مستوى الخطورة',
  'Patient Details': 'تفاصيل المريض',
  'Basic Information': 'المعلومات الأساسية',
  'Contact Information': 'معلومات التواصل',
  'Medical Information': 'المعلومات الطبية',
  'Blood Type:': 'فصيلة الدم:',
  'Allergies:': 'الحساسية:',
  'BMI:': 'مؤشر كتلة الجسم:',
  'Age Group:': 'الفئة العمرية:',
  'No scan history available': 'لا يوجد سجل فحوصات متاح',
  'Doctor Review:': 'مراجعة الطبيب:',
  'Request Patient Access': 'طلب الوصول إلى المريض',
  'AES-256 Encryption': 'تشفير AES-256',
  'Access Control System': 'نظام التحكم في الوصول',
  'HIPAA Compliant': 'متوافق مع HIPAA',
  'View and manage system data': 'عرض وإدارة بيانات النظام',
  'Patients Data': 'بيانات المرضى',
  'Add New Patient': 'إضافة مريض جديد',
  'Full Name': 'الاسم الكامل',
  Low: 'منخفض',
  Medium: 'متوسط',
  High: 'مرتفع',
  'All Actions': 'كل الإجراءات',
  'All Status': 'كل الحالات',
  'Try adjusting your search filters': 'جرّب تعديل عوامل البحث',
  'Upload your medical images for secure AI-powered analysis':
    'ارفع صورك الطبية لتحليل آمن بالذكاء الاصطناعي',
  'Choose Scan Category *': 'اختر فئة الفحص *',
  'Select Medical Image *': 'اختر الصورة الطبية *',
  'No image selected': 'لم يتم اختيار صورة',
  'Upload an image to see preview': 'ارفع صورة لعرض المعاينة',
  'High Quality Images': 'صور عالية الجودة',
  'Available Nurses': 'التمريض المتاح',
  'Select a doctor to manage nurse assignments.': 'اختر طبيبًا لإدارة تعيينات التمريض.',
  'No nurses currently assigned.': 'لا يوجد تمريض معين حاليًا.',
  'No free nurses available.': 'لا يوجد تمريض متاح حاليًا.',
  'Latest AI Confidence': 'آخر ثقة للذكاء الاصطناعي',
  'Risk Assessment': 'تقييم الخطورة',
  'Risk Score /100': 'درجة الخطورة /100',
  'Family History': 'التاريخ العائلي',
  'Last Screening': 'آخر فحص',
  'Next Recommended': 'الموعد التالي المقترح',
  'Screening Frequency': 'معدل الفحص',
  'On Track': 'على المسار الصحيح',
  'Recommended Frequency': 'المعدل المقترح',
  'Last Self-Exam': 'آخر فحص ذاتي',
  'Next Due': 'الموعد القادم',
  'No scans yet': 'لا توجد فحوصات بعد',
  'Next Appointment': 'الموعد القادم',
  'AI Analysis Status': 'حالة تحليل الذكاء الاصطناعي',
  'New Scan': 'فحص جديد',
  'Message Doctor': 'مراسلة الطبيب',
  Reports: 'التقارير',
  'Normal Results': 'نتائج طبيعية',
  'Follow-up Required': 'مطلوب متابعة',
  'Total Screenings': 'إجمالي الفحوصات',
  'Average Confidence': 'متوسط الثقة',
  'Consistency Score': 'درجة الانتظام',
  'Scan Details': 'تفاصيل الفحص',
  'Stay Proactive with Your Health': 'كن سبّاقًا في رعاية صحتك',
  'Data Updates in Real-time': 'تحديث البيانات لحظيًا',
  'Secure Cloud Storage': 'تخزين سحابي آمن',
  'Access Denied': 'تم رفض الوصول',
  'Security Notice:': 'تنبيه أمني:',
  'Analyzing Medical Images...': 'جار تحليل الصور الطبية...',
  'AI Analysis Results': 'نتائج تحليل الذكاء الاصطناعي',
  'Medical Analysis Report': 'تقرير التحليل الطبي',
  'AI Confidence Score': 'درجة ثقة الذكاء الاصطناعي',
  'Model Confidence Score': 'درجة ثقة النموذج',
  'Connected to Data Store': 'متصل بمخزن البيانات',
  'Detection Result': 'نتيجة الكشف',
  'Preliminary Result': 'نتيجة أولية',
  'Preliminary AI Analysis Report': 'تقرير تحليل ذكاء اصطناعي أولي',
  'Suggested Next Steps': 'الخطوات التالية المقترحة',
  'Detailed Findings': 'النتائج التفصيلية',
  'Medical Recommendations': 'التوصيات الطبية',
  'Follow-up Plan': 'خطة المتابعة',
  'Next Steps': 'الخطوات التالية',
  'Next Screening': 'الفحص القادم',
  'Self-Check': 'الفحص الذاتي',
  'Patient Support & Notifications': 'دعم المرضى والإشعارات',
  'Patient Support Dashboard': 'لوحة دعم المرضى',
  'Medical Support Specialist': 'مختص دعم طبي',
  'Patient Notifications': 'إشعارات المرضى',
  'AI Result': 'نتيجة الذكاء الاصطناعي',
  'Scan Upload Management': 'إدارة رفع الفحوصات',
  'Upload medical images for AI analysis': 'رفع الصور الطبية لتحليلها بالذكاء الاصطناعي',
  'Pending Notifications': 'الإشعارات المعلقة',
  'Quick Contact': 'تواصل سريع',
  Emergency: 'الطوارئ',
  'IT Support': 'دعم تقنية المعلومات',
  'Technical Issues': 'مشكلات تقنية',
  'Patient Support & Communication': 'دعم المرضى والتواصل',
  'Notify Patient': 'إخطار المريض',
  'Current Identity': 'الهوية الحالية',
  'Peak Confidence': 'أعلى ثقة',
  'Live Confidence Timeline': 'المخطط الزمني المباشر للثقة',
  'Latest Face Box': 'آخر مربع وجه',
  'Identity Breakdown': 'تفصيل الهويات',
  'Confidence Distribution': 'توزيع الثقة',
  'Recent Detection Stream': 'آخر بث للكشف',
  'Received At': 'تم الاستلام في',
  'Bounding Box': 'مربع التحديد',
  'Secure Messages': 'رسائل آمنة',
  'Encrypted medical communication': 'تواصل طبي مشفر',
  'Security:': 'الأمان:',
  'End-to-End Encrypted': 'مشفر من الطرف إلى الطرف',
  'Medical Communication': 'التواصل الطبي',
  'Maximum Security': 'أعلى مستوى أمان',
  Conversations: 'المحادثات',
  'End-to-End Encryption': 'تشفير من الطرف إلى الطرف',
  'Secure File Sharing': 'مشاركة ملفات آمنة',
  Recognition: 'التعرّف',
  'Team Manage': 'إدارة الفريق',
  'Full system control, user management, and access control':
    'تحكم كامل في النظام وإدارة المستخدمين وصلاحيات الوصول',
  '🔐 Full Access': '🔐 وصول كامل',
  '🔓 Access Control': '🔓 التحكم في الوصول',
  '📋 Request History': '📋 سجل الطلبات',
  'Reset Pass': 'إعادة تعيين كلمة المرور',
  '30 minutes': '30 دقيقة',
  '1 hour': 'ساعة واحدة',
  '2 hours': 'ساعتان',
  '4 hours': '4 ساعات',
  'Full access to user management, access control, security monitoring, and system configuration.':
    'وصول كامل لإدارة المستخدمين، والتحكم في الصلاحيات، ومراقبة الأمان، وإعدادات النظام.',
  'All activities are logged for security auditing. Unauthorized access is prohibited.':
    'يتم تسجيل كل الأنشطة لأغراض التدقيق الأمني. الوصول غير المصرح به محظور.',
  '📊 Audit Logging': '📊 تسجيل التدقيق',
  'Noura AI Assistant': 'مساعد نورا AI',
  'Always here to help': 'دائمًا هنا للمساعدة',
  'Live usage, traffic, and audit insights': 'رؤى مباشرة للاستخدام والحركة وسجلات التدقيق',
  'System Load by Hour': 'حمل النظام حسب الساعة',
  'Activity (Last 7 Days)': 'النشاط خلال آخر 7 أيام',
  'Quick Summary': 'ملخص سريع',
  'Track all system activities and security events': 'تتبع كل أنشطة النظام والأحداث الأمنية',
  Details: 'التفاصيل',
  'No logs found': 'لا توجد سجلات',
  'Last Visit': 'آخر زيارة',
  '🔒 No Access': '🔒 لا يوجد وصول',
  'Full Review': 'مراجعة كاملة',
  '24 hours': '24 ساعة',
  'Complete medical record & scan history': 'السجل الطبي الكامل وسجل الفحوصات',
  'Last Visit:': 'آخر زيارة:',
  'Current Medications:': 'الأدوية الحالية:',
  'Secure encrypted messaging': 'مراسلة آمنة ومشفرة',
  'Secure, encrypted messaging with healthcare providers':
    'مراسلة آمنة ومشفرة مع مقدمي الرعاية الصحية',
  '📨 Secure Delivery': '📨 تسليم آمن',
  'Start a Conversation': 'ابدأ محادثة',
  'Select a conversation': 'اختر محادثة',
  'Start New Conversation': 'ابدأ محادثة جديدة',
  'Start Conversation': 'بدء المحادثة',
  'Last Scan': 'آخر فحص',
  Result: 'النتيجة',
  Notify: 'إخطار',
  'Supports: DICOM, JPEG, PNG • Max 10MB': 'يدعم: DICOM و JPEG و PNG • الحد الأقصى 10MB',
  'Dr. Ahmed': 'د. أحمد',
  '24/7 Support': 'دعم 24/7',
  '📨 Notification Access': '📨 وصول الإشعارات',
  'AES-256 Encrypted': 'مشفر بتقنية AES-256',
  'AI-Powered Insights': 'رؤى مدعومة بالذكاء الاصطناعي',
  '🔒 Secure': '🔒 آمن',
  'Mark all as read': 'تحديد الكل كمقروء',
  '🩺 Health Profile': '🩺 الملف الصحي',
  '📅 Screening Schedule': '📅 جدول الفحوصات',
  '👐 Self-Exam Tracker': '👐 متابعة الفحص الذاتي',
  'April 1, 2026': '1 أبريل 2026',
  '📝 Log Self-Exam': '📝 تسجيل الفحص الذاتي',
  '🔔 Smart Reminders': '🔔 تذكيرات ذكية',
  Snooze: 'تأجيل',
  Complete: 'إكمال',
  '✓ Done': '✓ تم',
  '📊 Quick Stats': '📊 إحصاءات سريعة',
  '📈 Trends': '📈 الاتجاهات',
  '💡 Health Tips': '💡 نصائح صحية',
  '• Maintain healthy weight': '• حافظ على وزن صحي',
  '• Limit alcohol consumption': '• قلل استهلاك الكحول',
  '• Stay physically active': '• حافظ على نشاطك البدني',
  '📈 Screening Trends': '📈 اتجاهات الفحوصات',
  '6 Months': '6 أشهر',
  '1 Year': 'سنة واحدة',
  '+ Schedule New': '+ حجز جديد',
  Reschedule: 'إعادة الحجز',
  '💡 Appointment Tips': '💡 نصائح الموعد',
  '• Arrive 15 minutes early for paperwork': '• احضر قبل الموعد بـ 15 دقيقة للإجراءات',
  '• Prepare questions for your doctor': '• جهز أسئلتك للطبيب',
  '• Wear comfortable clothing': '• ارتدِ ملابس مريحة',
  'Recognition Command Center': 'مركز قيادة التعرّف',
  'Camera Feed Simulation': 'محاكاة بث الكاميرا',
  'Download PDF Report': 'تحميل تقرير PDF',
  'Generating PDF...': 'جاري إنشاء PDF...',
  Unassign: 'إلغاء التعيين',
  Assign: 'تعيين',
  'Processing...': 'جاري المعالجة...',
  'Image Preview': 'معاينة الصورة',
  'Preview loaded successfully': 'تم تحميل المعاينة بنجاح',
  'Ensure clear, well-lit scans': 'تأكد من وضوح الفحوصات والإضاءة الجيدة',
  'Complete Coverage': 'تغطية كاملة',
  'Include all relevant areas': 'أدرج كل المناطق ذات الصلة',
  'File Size Limit': 'حد حجم الملف',
  'Maximum 50MB per file': 'الحد الأقصى 50MB لكل ملف',
  'Fast Analysis': 'تحليل سريع',
  'Fully Encrypted': 'مشفر بالكامل',
  'End-to-end encryption': 'تشفير من الطرف إلى الطرف',
  '95-98% confidence rate': 'معدل ثقة 95-98%',
  'Note:': 'ملاحظة:',
  '© 2026 Noura AI System. All rights reserved.': '© 2026 نظام نورا AI. جميع الحقوق محفوظة.',
};

const phraseText = [
  [
    'Full system control, user management, and access control',
    'تحكم كامل في النظام وإدارة المستخدمين وصلاحيات الوصول',
  ],
  [
    'Full access to user management, access control, security monitoring, and system configuration.',
    'وصول كامل لإدارة المستخدمين، والتحكم في الصلاحيات، ومراقبة الأمان، وإعدادات النظام.',
  ],
  [
    'All activities are logged for security auditing. Unauthorized access is prohibited.',
    'يتم تسجيل كل الأنشطة لأغراض التدقيق الأمني. الوصول غير المصرح به محظور.',
  ],
  [
    'Secure, encrypted messaging with healthcare providers',
    'مراسلة آمنة ومشفرة مع مقدمي الرعاية الصحية',
  ],
  ['AI Accuracy', 'دقة الذكاء الاصطناعي'],
  ['AI Decision Support', 'دعم قرار بالذكاء الاصطناعي'],
  ['Supports clinician review', 'يدعم مراجعة الطبيب'],
  [
    'Data stored in React state | Changes persist until page refresh',
    'البيانات مخزنة في حالة React | تستمر التغييرات حتى تحديث الصفحة',
  ],
  [
    'This data is stored in React state. To connect to backend, replace state updates with API calls.',
    'هذه البيانات مخزنة في حالة React. للربط بالخادم، استبدل تحديثات الحالة باستدعاءات API.',
  ],
  ["You haven't requested access to any patients yet.", 'لم تطلب الوصول إلى أي مريض حتى الآن.'],
  [
    'Your request is being reviewed by the admin. You will be notified once a decision is made.',
    'طلبك قيد مراجعة المسؤول، وسيتم إخطارك بمجرد اتخاذ القرار.',
  ],
  [
    'Your expertise combined with AI analysis and secure access controls provides the highest accuracy in early cancer detection while protecting patient privacy.',
    'يدعم تحليل الذكاء الاصطناعي مراجعة الطبيب مع التحكم الآمن في الوصول وحماية خصوصية المريض.',
  ],
  [
    'AI analysis supports clinician review with secure access controls while protecting patient privacy. Final clinical decisions remain with the care team.',
    'يدعم تحليل الذكاء الاصطناعي مراجعة الطبيب مع التحكم الآمن في الوصول وحماية خصوصية المريض. تظل القرارات الطبية النهائية مسؤولية فريق الرعاية.',
  ],
  [
    'Your request will be sent to the admin for approval. Include specific medical reasons for best results.',
    'سيتم إرسال طلبك إلى المسؤول للموافقة. اكتب أسبابًا طبية واضحة للحصول على أفضل نتيجة.',
  ],
  [
    'Choose a conversation from the list or start a new one to begin messaging.',
    'اختر محادثة من القائمة أو ابدأ محادثة جديدة لبدء المراسلة.',
  ],
  [
    'All communications are encrypted, logged, and HIPAA compliant.',
    'كل المراسلات مشفرة ومسجلة ومتوافقة مع HIPAA.',
  ],
  ['Notify patients when results are ready', 'إخطار المرضى عند جاهزية النتائج'],
  [
    'This message will be sent to the patient through the system.',
    'سيتم إرسال هذه الرسالة إلى المريض من خلال النظام.',
  ],
  [
    'Regular screenings and early detection are important for cancer awareness and overall health. Our AI-powered system helps you stay on track with personalized reminders and insights.',
    'الفحوصات المنتظمة والاكتشاف المبكر مهمان للتوعية بالسرطان والصحة العامة. يساعدك نظامنا المدعوم بالذكاء الاصطناعي على المتابعة من خلال تذكيرات ورؤى مخصصة.',
  ],
  ['For emergencies, contact:', 'للطوارئ، تواصل مع:'],
  [
    'Same payload shape your backend can send directly',
    'نفس شكل البيانات الذي يستطيع الخادم إرساله مباشرة',
  ],
  [
    'AI is processing your scan with high accuracy',
    'يقوم الذكاء الاصطناعي بإعداد مراجعة أولية للفحص',
  ],
  [
    'AI is preparing a preliminary review for clinician confirmation',
    'يقوم الذكاء الاصطناعي بإعداد مراجعة أولية لتأكيد الطبيب',
  ],
  [
    "You are viewing this patient's results with authorized access.",
    'أنت تعرض نتائج هذا المريض بصلاحية وصول معتمدة.',
  ],
  [
    'Keep a note of any changes and discuss them with your doctor',
    'دوّن أي تغييرات وناقشها مع طبيبك',
  ],
  [
    'Team assignments are currently displayed from live user data, but editing assignments still needs dedicated backend endpoints before it can be enabled safely.',
    'تظهر تعيينات الفريق حاليًا من بيانات المستخدمين المباشرة، لكن تعديل التعيينات يحتاج نقاط API مخصصة قبل تفعيله بأمان.',
  ],
  ['AES-256 encryption before upload', 'تشفير AES-256 قبل الرفع'],
  ['HIPAA compliant infrastructure', 'بنية متوافقة مع HIPAA'],
  ['Secure data transmission (HTTPS)', 'نقل آمن للبيانات (HTTPS)'],
  ['Automatic data anonymization', 'إخفاء هوية البيانات تلقائيًا'],
  ['Image encryption (AES-256)', 'تشفير الصورة (AES-256)'],
  ['Secure upload to server', 'رفع آمن إلى الخادم'],
  ['AI model analysis (15-30s)', 'تحليل نموذج الذكاء الاصطناعي (15-30 ثانية)'],
  ['Result generation & encryption', 'إنشاء النتيجة وتشفيرها'],
  ['Manage your medical appointments', 'إدارة مواعيدك الطبية'],
  ['Manage your account and security preferences', 'إدارة الحساب وتفضيلات الأمان'],
  ['How can we help you?', 'كيف يمكننا مساعدتك؟'],
  ['Back to Dashboard', 'العودة إلى لوحة التحكم'],
  [
    'Search for help articles, guides, or FAQs...',
    'ابحث عن مقالات المساعدة أو الأدلة أو الأسئلة الشائعة...',
  ],
  ['Browse Help Categories', 'تصفح أقسام المساعدة'],
  ['Emergency & Support Contacts', 'جهات اتصال الدعم والطوارئ'],
  ['Frequently Asked Questions', 'الأسئلة الشائعة'],
  ['Still Need Help?', 'ما زلت تحتاج مساعدة؟'],
  ['Enter your name', 'أدخل اسمك'],
  ['Enter your email', 'أدخل بريدك الإلكتروني'],
  ['Describe your issue or question...', 'اشرح مشكلتك أو سؤالك...'],
  ['Access Medical System', 'دخول النظام الطبي'],
  ['Select Your Role', 'اختر نوع الحساب'],
  ['Remember this device for 30 days', 'تذكر هذا الجهاز لمدة 30 يومًا'],
  ['Forgot Password?', 'نسيت كلمة المرور؟'],
  ['Medical Intelligence System', 'نظام الذكاء الطبي'],
  ['Early Cancer Detection', 'الاكتشاف المبكر للسرطان'],
  ['Preparing secure workspace', 'جار تجهيز بيئة العمل الآمنة'],
  ['Checking authentication...', 'جار التحقق من تسجيل الدخول...'],
  ['Contact your doctor', 'تواصل مع طبيبك'],
  ['Previous reports', 'التقارير السابقة'],
  ['Account & security', 'الحساب والأمان'],
  ['Start new analysis', 'ابدأ تحليلًا جديدًا'],
  ['Patient data not found', 'لم يتم العثور على بيانات المريض'],
  ['Please provide a reason', 'من فضلك اكتب السبب'],
  ['Request Failed', 'فشل الطلب'],
  ['Exporting logs...', 'جار تصدير السجلات...'],
  ['Password reset', 'إعادة تعيين كلمة المرور'],
  ['not connected to the backend yet', 'غير متصل بالخادم بعد'],
  ['is not supported by the backend yet', 'غير مدعوم من الخادم بعد'],
  ['Please fill in name and age', 'من فضلك املأ الاسم والعمر'],
  ['added with ID', 'تمت إضافته بالمعرف'],
  ['Reset is disabled', 'إعادة الضبط معطلة'],
  ['Technical Support', 'الدعم الفني'],
  ['Emergency Contact', 'اتصال الطوارئ'],
  ['Contact Dr.', 'تواصل مع د.'],
  ['Schedule new appointment', 'حجز موعد جديد'],
  ['Edit contact information', 'تعديل بيانات التواصل'],
  ['Generated:', 'تم الإنشاء:'],
  ['Report ID:', 'معرف التقرير:'],
  ['Scan Date:', 'تاريخ الفحص:'],
  ['CONFIDENTIAL MEDICAL REPORT', 'تقرير طبي سري'],
  ['For Medical Use Only', 'للاستخدام الطبي فقط'],
  ['You do not have permission to view this patient', 'ليس لديك صلاحية لعرض هذا المريض'],
  ['Review and manage doctor access requests', 'راجع وأدر طلبات وصول الأطباء'],
  [
    'No doctors have requested access to patients yet.',
    'لم يطلب أي طبيب الوصول إلى المرضى حتى الآن.',
  ],
  ['You can request access to any patient', 'يمكنك طلب الوصول إلى أي مريض'],
  ['No patients in system', 'لا يوجد مرضى في النظام'],
  ['No patients assigned yet', 'لا يوجد مرضى معينون بعد'],
  ['Track your patient access requests', 'تابع طلبات الوصول إلى المرضى'],
  ['No pending AI reviews at this time.', 'لا توجد مراجعات ذكاء اصطناعي معلقة الآن.'],
  [
    'AI-Assisted Medical Review + Access Control',
    'مراجعة طبية مدعومة بالذكاء الاصطناعي + تحكم في الوصول',
  ],
  ['Lower scores indicate lower risk', 'الدرجات الأقل تعني خطورة أقل'],
  ['Medical scan at Cairo Medical Center', 'فحص طبي في مركز القاهرة الطبي'],
  ['Approx. 6 months from last screening', 'تقريبًا بعد 6 أشهر من آخر فحص'],
  ['Track your screening results over time', 'تابع نتائج الفحوصات بمرور الوقت'],
  ['Perform a monthly symptom self-check', 'قم بفحص ذاتي شهري للأعراض'],
  ['Manage patient notifications and scan uploads', 'إدارة إشعارات المرضى ورفع الفحوصات'],
  ['No pending notifications at this time.', 'لا توجد إشعارات معلقة في الوقت الحالي.'],
  ['Click to review pending notifications', 'اضغط لمراجعة الإشعارات المعلقة'],
  [
    'Ensure patient consent is obtained before uploading',
    'تأكد من الحصول على موافقة المريض قبل الرفع',
  ],
  ['Verify patient information matches the scan', 'تأكد أن بيانات المريض تطابق الفحص'],
  ['Use secure connection for all uploads', 'استخدم اتصالًا آمنًا لكل عمليات الرفع'],
  ['Notify patients within 24 hours of results', 'أخطر المرضى خلال 24 ساعة من ظهور النتائج'],
  ['AES-256 encryption for all messages', 'تشفير AES-256 لكل الرسائل'],
  ['Medical privacy standards enforced', 'تطبيق معايير الخصوصية الطبية'],
  ['Encrypted medical file transfer', 'نقل ملفات طبية مشفر'],
  ['Average confidence per timestamp', 'متوسط الثقة لكل وقت'],
  ['Visualized from the last bbox payload', 'عرض مرئي من آخر بيانات مربع التحديد'],
  [
    'Manage your patients and review AI analysis results',
    'إدارة المرضى ومراجعة نتائج تحليل الذكاء الاصطناعي',
  ],
  [
    'Monitor patient care and support clinical workflows',
    'متابعة رعاية المرضى ودعم سير العمل الطبي',
  ],
  [
    'Manage system users, access, analytics, and audit logs',
    'إدارة المستخدمين والصلاحيات والتحليلات وسجلات التدقيق',
  ],
  ['Your personal health dashboard and care overview', 'لوحة صحتك الشخصية وملخص الرعاية'],
  [
    'Upload medical scans for AI-powered analysis',
    'ارفع الفحوصات الطبية لتحليلها بالذكاء الاصطناعي',
  ],
  [
    'Review AI analysis results and medical reports',
    'مراجعة نتائج الذكاء الاصطناعي والتقارير الطبية',
  ],
  ['Send secure messages to your care team', 'أرسل رسائل آمنة إلى فريق الرعاية'],
  ['No conversations selected', 'لم يتم اختيار محادثة'],
  ['Select a conversation to start messaging', 'اختر محادثة لبدء المراسلة'],
  ['Please enter a recipient', 'من فضلك أدخل المستلم'],
  ['Calling ', 'جار الاتصال بـ '],
  ['Video call ', 'مكالمة فيديو مع '],
  ['Please enter a notification message', 'من فضلك اكتب نص الإشعار'],
  ['Notification sent to ', 'تم إرسال الإشعار إلى '],
  ['Message:', 'الرسالة:'],
  ['Edit name:', 'تعديل الاسم:'],
  ['Exporting logs...', 'جار تصدير السجلات...'],
  ['Please provide a reason for rejection:', 'من فضلك اكتب سبب الرفض:'],
  ['Please provide a reason for access request', 'من فضلك اكتب سبب طلب الوصول'],
  ['Patient data not found', 'لم يتم العثور على بيانات المريض'],
  ['Error loading patient data:', 'خطأ أثناء تحميل بيانات المريض:'],
  ['AI analysis confirmed for patient', 'تم تأكيد تحليل الذكاء الاصطناعي للمريض'],
  ['AI analysis rejected for patient', 'تم رفض تحليل الذكاء الاصطناعي للمريض'],
  [
    'Reset is disabled because team assignments are currently read-only.',
    'إعادة الضبط معطلة لأن تعيينات الفريق للقراءة فقط حاليًا.',
  ],
  [' nurses', ' ممرضات'],
  ['Dr. Ahmed Mahmoud', 'د. أحمد محمود'],
  ['Dr. Nada Sobhy', 'د. ندى صبحي'],
  ['Dr. Rawda Mohamed', 'د. روضة محمد'],
  ['Dr. Mohamed Abdullah', 'د. محمد عبد الله'],
  ['Nurse Sarah', 'الممرضة سارة'],
  ['Nurse Leila', 'الممرضة ليلى'],
  ['Nurse Hana', 'الممرضة هنا'],
  ['Nurse Rania', 'الممرضة رانيا'],
  ['Nurse Mona', 'الممرضة منى'],
  ['Nurse Yara', 'الممرضة يارا'],
  ['Nurse Dina', 'الممرضة دينا'],
  ['Nurse Salma', 'الممرضة سلمى'],
  ['Fatma Ali', 'فاطمة علي'],
  ['Mariam Hussein', 'مريم حسين'],
  ['Sara Mohamed', 'سارة محمد'],
  ['Hoda Kamal', 'هدى كمال'],
  ['Nora Adel', 'نورا عادل'],
  ['Aya Samir', 'آية سمير'],
  ['Laila Mostafa', 'ليلى مصطفى'],
  ['Mona Ibrahim', 'منى إبراهيم'],
];

const translateDialogText = value => translateValue(String(value ?? ''));

const attributes = ['placeholder', 'title', 'aria-label', 'alt'];
const originals = new WeakMap();
const translatedValues = new WeakMap();

const translateValue = value => {
  if (!value || !value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  const trimmed = value.trim();
  let translated = exactText[trimmed];

  if (!translated) {
    translated = phraseText.reduce((text, [from, to]) => text.replaceAll(from, to), trimmed);
  }

  return translated === trimmed ? value : `${leading}${translated}${trailing}`;
};

const processTextNode = (node, enabled) => {
  const currentValue = node.nodeValue;
  const previousTranslatedValue = translatedValues.get(node);

  if (!originals.has(node) || currentValue !== previousTranslatedValue) {
    originals.set(node, currentValue);
  }

  const original = originals.get(node);
  const nextValue = enabled ? translateValue(original) : original;

  if (currentValue !== nextValue) {
    node.nodeValue = nextValue;
  }

  if (enabled) {
    translatedValues.set(node, nextValue);
  } else {
    translatedValues.delete(node);
  }
};

const processElement = (element, enabled) => {
  attributes.forEach(attribute => {
    if (!element.hasAttribute?.(attribute)) return;
    const key = `__nouraOriginal_${attribute}`;
    const translatedKey = `__nouraTranslated_${attribute}`;
    const currentValue = element.getAttribute(attribute);

    if (!element[key] || currentValue !== element[translatedKey]) {
      element[key] = currentValue;
    }

    const nextValue = enabled ? translateValue(element[key]) : element[key];

    if (currentValue !== nextValue) {
      element.setAttribute(attribute, nextValue);
    }

    if (enabled) {
      element[translatedKey] = nextValue;
    } else {
      delete element[translatedKey];
    }
  });
};

const walk = (root, enabled) => {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    processTextNode(root, enabled);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.matches?.('script, style, textarea, code, pre')) return;
  if (root.nodeType === Node.ELEMENT_NODE) processElement(root, enabled);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: node => {
      const parent = node.parentElement;
      if (parent?.closest('script, style, textarea, code, pre')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) processTextNode(node, enabled);
    if (node.nodeType === Node.ELEMENT_NODE) processElement(node, enabled);
  }
};

const ArabicTextRuntime = () => {
  const { isArabic } = useLanguage();

  useEffect(() => {
    const nativeAlert = window.alert;
    const nativeConfirm = window.confirm;
    const nativePrompt = window.prompt;

    window.alert = message => nativeAlert(isArabic ? translateDialogText(message) : message);
    window.confirm = message => nativeConfirm(isArabic ? translateDialogText(message) : message);
    window.prompt = (message, defaultValue) =>
      nativePrompt(isArabic ? translateDialogText(message) : message, defaultValue);

    walk(document.body, isArabic);
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'characterData') {
          walk(record.target, isArabic);
          return;
        }

        record.addedNodes.forEach(node => walk(node, isArabic));
        if (record.type === 'attributes') processElement(record.target, isArabic);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: attributes,
    });

    return () => {
      observer.disconnect();
      window.alert = nativeAlert;
      window.confirm = nativeConfirm;
      window.prompt = nativePrompt;
    };
  }, [isArabic]);

  return null;
};

export default ArabicTextRuntime;
