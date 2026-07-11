import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NouraLogo from '../components/NouraLogo';
import { endCurrentSession } from '../utils/analyticsService';
import { useLanguage } from '../contexts/LanguageContext';

const PatientHomePage = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const { t, getObject, isArabic } = useLanguage();

  // Check if this is first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('patient_has_visited');
    if (hasVisitedBefore === 'true') {
      setShowTutorial(false);
    } else {
      localStorage.setItem('patient_has_visited', 'true');
    }
  }, []);

  // Tutorial steps
  const tutorialSteps = getObject('patientHome.tutorials');

  // Features for returning patients (if tutorial is skipped)
  const quickFeatures = getObject('patientHome.quickFeatures').map((feature, index) => ({
    ...feature,
    action: [
      () => navigate('/upload'),
      () => navigate('/results'),
      () => navigate('/messages'),
      () => navigate('/settings'),
    ][index],
  }));

  // Handle skip tutorial
  const handleSkipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('patient_skipped_tutorial', 'true');
  };

  // Handle next step in tutorial
  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  // Handle start upload
  const handleStartUpload = () => {
    navigate('/upload');
  };

  // Force show tutorial again
  const handleForceShowTutorial = () => {
    localStorage.setItem('patient_has_visited', 'false');
    localStorage.removeItem('patient_skipped_tutorial');
    setShowTutorial(true);
    setCurrentStep(0);
    alert(t('patientHome.tutorialReset'));
  };

  // Security features
  const securityFeatures = getObject('patientHome.securityFeatures');
  const stats = getObject('patientHome.stats');

  // Handle navigation for footer links
  const handleFooterLink = page => {
    // Redirect to existing pages
    switch (page) {
      case 'how-it-works':
      case 'features':
      case 'security':
        navigate('/help');
        break;
      case 'contact':
        // يمكن إضافة صفحة اتصال لاحقاً
        navigate('/help');
        break;
      default:
        navigate('/help');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:shadow-none dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-blue-100 shadow-sm flex items-center justify-center dark:bg-gray-900 dark:border-blue-900">
                <NouraLogo size={32} boxed={false} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Noura AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">{t('patientHome.headerSubtitle')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {showTutorial && (
                <button
                  onClick={handleSkipTutorial}
                  className="text-gray-600 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t('patientHome.skipTutorial')}
                </button>
              )}

              {/* Development Button - Show Tutorial Again */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleForceShowTutorial}
                  className="text-xs text-gray-500 hover:text-blue-600 border border-gray-300 px-2 py-1 rounded flex items-center dark:text-gray-300 dark:border-gray-600"
                  title={t('patientHome.showAgainTitle')}
                >
                  <span className={`${isArabic ? 'ml-1' : 'mr-1'}`}>🔄</span>
                  {t('patientHome.showAgain')}
                </button>
              )}

              <button
                onClick={() => {
                  endCurrentSession('patient_home_signout');
                  sessionStorage.clear();
                  navigate('/login');
                }}
                className="text-gray-600 hover:text-blue-600 font-medium text-sm dark:text-gray-300 dark:hover:text-blue-400"
              >
                {t('common.signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('patientHome.welcomeTitle')}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('patientHome.welcomeDescription')}
            </p>

            {/* Development Mode Indicator */}
            {process.env.NODE_ENV === 'development' && (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mb-6">
                <span className={`${isArabic ? 'ml-2' : 'mr-2'}`}>⚙️</span>
                {t('patientHome.devMode')}
              </div>
            )}
          </div>
        </section>

        {/* Tutorial Section - Only for first-time users */}
        {showTutorial ? (
          <>
            {/* Tutorial Progress */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex justify-between mb-6">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1/4 h-2 mx-1 rounded-full ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Current Step Content */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center dark:bg-gray-800 dark:border-gray-700">
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${tutorialSteps[currentStep].color} flex items-center justify-center`}
                >
                  <span className="text-4xl">{tutorialSteps[currentStep].icon}</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {tutorialSteps[currentStep].title}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  {tutorialSteps[currentStep].description}
                </p>

                {/* Step Indicator */}
                <div className="text-gray-500 dark:text-gray-400 mb-8">
                  {t('patientHome.stepOf', {
                    current: currentStep + 1,
                    total: tutorialSteps.length,
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center space-x-4">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {t('common.previous')}
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg dark:from-blue-600 dark:to-blue-700"
                  >
                    {currentStep === tutorialSteps.length - 1
                      ? t('common.getStarted')
                      : t('common.next')}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="max-w-2xl mx-auto mb-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center dark:bg-blue-900/10 dark:border-blue-800">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 text-xl">🛡️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('patientHome.securityTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{t('patientHome.securityDescription')}</p>
            </div>
          </>
        ) : (
          /* Returning Patient Dashboard */
          <>
            {/* Quick Actions */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
                {t('patientHome.quickActions')}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {quickFeatures.map((feature, index) => (
                  <button
                    key={index}
                    onClick={feature.action}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1 text-center group dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.description}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Main Call-to-Action */}
            <section className="mb-16">
              <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-10 text-white text-center dark:from-blue-700 dark:to-blue-900">
                <div className="w-24 h-24 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center">
                  <NouraLogo size={74} boxed={false} />
                </div>

                <h2 className="text-3xl font-bold mb-6">{t('patientHome.startAnalysis')}</h2>

                <p className="text-lg mb-10 text-blue-100">
                  {t('patientHome.startAnalysisDescription')}
                </p>

                <button
                  onClick={handleStartUpload}
                  className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 inline-flex items-center dark:bg-gray-200 dark:text-blue-700"
                >
                  <span className={`${isArabic ? 'ml-3' : 'mr-3'} text-2xl`}>📤</span>
                  {t('patientHome.uploadNewScan')}
                </button>

                <div className="mt-8 text-sm text-blue-200 dark:text-blue-100">
                  {t('patientHome.supportedFormats')}
                </div>
              </div>
            </section>

            {/* Security Badges */}
            <section className="mb-12">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-center text-gray-700 dark:text-gray-200 font-medium mb-6">
                  {t('patientHome.securityCompliance')}
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {securityFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Summary */}
            <section className="mb-12">
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {stats.map(stat => (
                  <div
                    key={stat.title}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                    <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">{stat.title}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">{stat.description}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Help Section */}
        <section className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('patientHome.needHelpTitle')}</h3>
          <p className="text-gray-600 mb-6">{t('patientHome.needHelpDescription')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/help')}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              {t('common.helpCenter')}
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
            >
              {t('common.contactDoctor')}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-lg border border-blue-100 shadow-sm flex items-center justify-center">
                  <NouraLogo size={35} boxed={false} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Noura AI</h3>
                  <p className="text-gray-400 text-sm">{t('patientHome.headerSubtitle')}</p>
                </div>
              </div>

              <div className="text-gray-400 text-sm space-y-2">
                <p className="leading-relaxed">{t('patientHome.footerDescription1')}</p>
                <p className="leading-relaxed">{t('patientHome.footerDescription2')}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">{t('patientHome.quickLinks')}</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleFooterLink('how-it-works')}
                    className={`text-gray-400 hover:text-white transition-colors hover:underline bg-transparent border-none p-0 cursor-pointer ${isArabic ? 'text-right' : 'text-left'}`}
                  >
                    {t('patientHome.footerLinks.howItWorks')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterLink('features')}
                    className={`text-gray-400 hover:text-white transition-colors hover:underline bg-transparent border-none p-0 cursor-pointer ${isArabic ? 'text-right' : 'text-left'}`}
                  >
                    {t('patientHome.footerLinks.features')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterLink('security')}
                    className={`text-gray-400 hover:text-white transition-colors hover:underline bg-transparent border-none p-0 cursor-pointer ${isArabic ? 'text-right' : 'text-left'}`}
                  >
                    {t('patientHome.footerLinks.security')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFooterLink('contact')}
                    className={`text-gray-400 hover:text-white transition-colors hover:underline bg-transparent border-none p-0 cursor-pointer ${isArabic ? 'text-right' : 'text-left'}`}
                  >
                    {t('patientHome.footerLinks.contact')}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">{t('patientHome.technicalSupport')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <span className={`${isArabic ? 'ml-2' : 'mr-2'}`}>📧</span>
                  support@noura-ai.com
                </li>
                <li className="flex items-center">
                  <span className={`${isArabic ? 'ml-2' : 'mr-2'}`}>📞</span>
                  +20 100 000 0000
                </li>
                <li className="flex items-center">
                  <span className={`${isArabic ? 'ml-2' : 'mr-2'}`}>🕒</span>
                  {t('patientHome.supportHours')}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">{t('patientHome.rights')}</p>
            <p className="text-gray-500 text-xs mt-2">{t('patientHome.proudly')} 🇪🇬</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientHomePage;
