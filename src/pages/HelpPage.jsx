import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const HelpPage = () => {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();

  const content = isArabic
    ? {
        title: 'مركز المساعدة',
        subtitle: 'كيف يمكننا مساعدتك؟',
        back: 'العودة للوحة التحكم',
        heroTitle: 'مرحبًا بك في مركز مساعدة نورا AI',
        heroDescription:
          'اعثر على إجابات للأسئلة الشائعة، واحصل على دعم تقني، وتعرّف على كيفية استخدام منصتنا الطبية المدعومة بالذكاء الاصطناعي.',
        searchPlaceholder: 'ابحث عن مقالات المساعدة أو الأدلة أو الأسئلة الشائعة...',
        search: 'بحث',
        categoriesTitle: 'تصفح أقسام المساعدة',
        learnMore: 'اعرف المزيد',
        contactsTitle: 'جهات اتصال الدعم والطوارئ',
        available: 'متاح 24/7 للحالات العاجلة',
        faqTitle: 'الأسئلة الشائعة',
        contactTitle: 'ما زلت تحتاج مساعدة؟',
        name: 'الاسم',
        namePlaceholder: 'أدخل اسمك',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'أدخل بريدك الإلكتروني',
        message: 'الرسالة',
        messagePlaceholder: 'اشرح مشكلتك أو سؤالك...',
        send: 'إرسال الرسالة',
        footer1: '© 2026 مركز مساعدة نورا AI. نحن هنا لمساعدتك على مدار الساعة.',
        footer2: 'متوسط وقت الرد: ساعتان • الدعم متاح بالعربية والإنجليزية',
        footerBadges: ['📞 دعم 24/7', '🔐 تواصل آمن', '⚡ استجابة سريعة'],
        helpCategories: [
          {
            id: 1,
            title: 'البدء',
            icon: '🚀',
            items: ['كيفية رفع الصور الطبية', 'فهم نتائجك', 'التواصل مع طبيبك'],
          },
          {
            id: 2,
            title: 'الأمان والخصوصية',
            icon: '🔐',
            items: ['شرح تشفير البيانات', 'التوافق مع HIPAA', 'إدارة إعدادات الخصوصية'],
          },
          {
            id: 3,
            title: 'الدعم التقني',
            icon: '💻',
            items: ['متطلبات المتصفح', 'مشكلات الرفع', 'متطلبات النظام'],
          },
        ],
        emergencyContacts: [
          { type: 'طوارئ طبية', number: '123', icon: '🚑' },
          { type: 'دعم تقني', number: '+20 100 000 0000', icon: '🛠️' },
          { type: 'دعم المستخدمين', number: '+20 100 000 0001', icon: '👥' },
        ],
        faqs: [
          {
            q: 'ما مدى أمان بياناتي الطبية؟',
            a: 'جميع البيانات مشفرة باستخدام AES-256 ومتوافقة مع معايير HIPAA.',
          },
          {
            q: 'ما دقة تحليل الذكاء الاصطناعي؟',
            a: 'يقدم النظام دقة مرتفعة في التحليل الأولي ويتم التحقق من النتائج بواسطة مختصين.',
          },
          {
            q: 'هل يمكنني مشاركة نتائجي مع طبيب آخر؟',
            a: 'نعم، يمكنك مشاركة النتائج بأمان من خلال المنصة.',
          },
          {
            q: 'ما صيغ الملفات المدعومة للرفع؟',
            a: 'ندعم صيغ DICOM و JPEG و PNG حتى 10MB.',
          },
        ],
      }
    : {
        title: 'Help Center',
        subtitle: 'How can we help you?',
        back: 'Back to Dashboard',
        heroTitle: 'Welcome to Noura AI Help Center',
        heroDescription:
          'Find answers to common questions, get technical support, and learn how to use our AI-powered medical platform.',
        searchPlaceholder: 'Search for help articles, guides, or FAQs...',
        search: 'Search',
        categoriesTitle: 'Browse Help Categories',
        learnMore: 'Learn More',
        contactsTitle: 'Emergency & Support Contacts',
        available: 'Available 24/7 for urgent matters',
        faqTitle: 'Frequently Asked Questions',
        contactTitle: 'Still Need Help?',
        name: 'Your Name',
        namePlaceholder: 'Enter your name',
        email: 'Email Address',
        emailPlaceholder: 'Enter your email',
        message: 'Message',
        messagePlaceholder: 'Describe your issue or question...',
        send: 'Send Message',
        footer1: "© 2026 Noura AI Help Center. We're here to help you 24/7.",
        footer2: 'Average response time: 2 hours • Support available in Arabic & English',
        footerBadges: ['📞 24/7 Support', '🔐 Secure Communication', '⚡ Fast Response'],
        helpCategories: [
          {
            id: 1,
            title: 'Getting Started',
            icon: '🚀',
            items: [
              'How to upload medical images',
              'Understanding your results',
              'Contacting your doctor',
            ],
          },
          {
            id: 2,
            title: 'Security & Privacy',
            icon: '🔐',
            items: [
              'Data encryption explained',
              'HIPAA compliance',
              'Managing your privacy settings',
            ],
          },
          {
            id: 3,
            title: 'Technical Support',
            icon: '💻',
            items: ['Browser requirements', 'Upload issues', 'System requirements'],
          },
        ],
        emergencyContacts: [
          { type: 'Medical Emergency', number: '123', icon: '🚑' },
          { type: 'Technical Support', number: '+20 100 000 0000', icon: '🛠️' },
          { type: 'Patient Support', number: '+20 100 000 0001', icon: '👥' },
        ],
        faqs: [
          {
            q: 'How secure is my medical data?',
            a: 'All data is encrypted with AES-256 and complies with HIPAA regulations.',
          },
          {
            q: 'How accurate is the AI analysis?',
            a: 'The system provides strong preliminary accuracy validated by medical professionals.',
          },
          {
            q: 'Can I share my results with another doctor?',
            a: 'Yes, you can securely share your results through the platform.',
          },
          {
            q: 'What file formats are supported for upload?',
            a: 'We support DICOM, JPEG, and PNG formats up to 10MB.',
          },
        ],
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">❓</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
                <p className="text-xs text-gray-500">{content.subtitle}</p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              {content.back}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.heroTitle}</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{content.heroDescription}</p>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={content.searchPlaceholder}
                  className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                  {content.search}
                </button>
              </div>
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {content.categoriesTitle}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {content.helpCategories.map(category => (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{category.icon}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {category.title}
                  </h3>

                  <ul className="space-y-3">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="mt-6 w-full py-3 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100">
                    {content.learnMore}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {content.contactsTitle}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {content.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center"
                >
                  <div className="text-4xl mb-4">{contact.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{contact.type}</h3>
                  <div className="text-2xl font-bold mb-4">{contact.number}</div>
                  <p className="text-blue-100 text-sm">{content.available}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {content.faqTitle}
            </h2>

            <div className="space-y-4 max-w-3xl mx-auto">
              {content.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:bg-gray-50"
                >
                  <h3 className="font-bold text-gray-900 mb-2">Q: {faq.q}</h3>
                  <p className="text-gray-600">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {content.contactTitle}
            </h2>

            <div className="max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {content.name}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={content.namePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    {content.email}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={content.emailPlaceholder}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {content.message}
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder={content.messagePlaceholder}
                ></textarea>
              </div>

              <div className="text-center">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg">
                  {content.send}
                </button>
              </div>
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
    </div>
  );
};

export default HelpPage;
