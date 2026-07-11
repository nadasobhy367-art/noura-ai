import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { secureGetItem, secureRemoveItem } from '../utils/securityUtils';
import NouraLogo from '../components/NouraLogo';
import { endCurrentSession } from '../utils/analyticsService';
import {
  getCurrentPatientData,
  getPatientScans,
  getPatientStats,
  getScanById,
} from '../utils/dataStore';
import { logger } from '../utils/logger';
import { deriveRiskAssessment } from '../utils/riskAssessment';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const historySectionRef = useRef(null);

  // ==================== HEALTH TRACKER DATA ====================
  const [healthProfile, setHealthProfile] = useState({
    lastScreening: '2026-03-15',
    nextRecommended: '2026-09-15',
    riskLevel: 'Low',
    riskScore: 12,
    familyHistory: 'No',
    ageGroup: '40-50',
    bmi: 24.5,
    selfExamFrequency: 'Monthly',
    lastSelfExam: '2026-03-20',
  });

  // ==================== SMART REMINDERS ====================
  const [reminders, setReminders] = useState([
    {
      id: 2,
      type: 'self_exam',
      title: 'Monthly Self-Check',
      date: '2026-04-01',
      priority: 'medium',
      icon: '👐',
      description: 'Perform a monthly symptom self-check',
      completed: false,
    },
    {
      id: 3,
      type: 'doctor',
      title: 'Follow-up with Dr. Ahmed',
      date: '2026-04-10',
      priority: 'high',
      icon: '👨‍⚕️',
      description: 'Discuss recent scan results',
      completed: false,
    },
    {
      id: 4,
      type: 'lifestyle',
      title: 'Exercise Routine',
      date: 'Daily',
      priority: 'low',
      icon: '🏃‍♀️',
      description: '30 minutes of moderate exercise',
      completed: true,
    },
  ]);

  // ==================== TRENDS & ANALYTICS ====================
  const trends = [
    { month: 'Jan', year: 2026, result: 'Normal', confidence: 97.5 },
    { month: 'Feb', year: 2026, result: 'Follow-up', confidence: 92.3 },
    { month: 'Mar', year: 2026, result: 'Normal', confidence: 98.7 },
    { month: 'Apr', year: 2026, result: 'Normal', confidence: 96.8 },
    { month: 'Jun', year: 2026, result: 'Normal', confidence: 97.2 },
    { month: 'Sep', year: 2026, result: 'Normal', confidence: 98.1 },
  ];

  // ==================== APPOINTMENTS ====================
  const appointments = [
    {
      id: 1,
      date: '2026-04-10',
      time: '10:00 AM',
      type: 'Follow-up Consultation',
      doctor: 'Dr. Ahmed Mahmoud',
      location: 'Cairo Medical Center, Room 302',
      status: 'confirmed',
    },
    {
      id: 2,
      date: '2026-04-25',
      time: '2:30 PM',
      type: 'Routine Check-up',
      doctor: 'Dr. Ahmed Mahmoud',
      location: 'Cairo Medical Center, Room 305',
      status: 'scheduled',
    },
  ];

  // Get user info securely
  const getUserInfo = () => {
    try {
      const userData = secureGetItem('user');
      if (userData) {
        return {
          name: userData.name || 'Patient',
          role: userData.role || 'patient',
          id: userData.id || userData.userId || 'PT-0000',
          email: userData.email || '',
        };
      }
    } catch (error) {
      logger.error('Error reading user data:', error);
    }
    return { name: 'Patient', role: 'patient', id: 'PT-0000', email: '' };
  };

  const user = getUserInfo();

  // ==================== FORMAT DATE FUNCTION ====================
  const formatDate = dateString => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // ==================== LOAD DATA ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // ✅ استخدام await مع كل الـ async functions
        const data = await getCurrentPatientData();
        const scanList = await getPatientScans();
        const patientStats = await getPatientStats();

        setPatientData(data);
        // ✅ تأكد إن scanList هو array
        setScans(Array.isArray(scanList) ? scanList : []);
        setStats(patientStats);

        // تحميل الإشعارات
        const patientNotifications = (Array.isArray(scanList) ? scanList : [])
          .slice(0, 3)
          .map((scan, index) => ({
            id: scan.id || index + 1,
            type:
              scan.result === 'Normal'
                ? 'success'
                : scan.result === 'Follow-up'
                  ? 'warning'
                  : 'info',
            message: `Latest ${scan.scanType} scan result: ${scan.result} (${scan.confidence}% confidence)`,
            time: formatDate(scan.date),
            read: index !== 0,
          }));
        setNotifications(patientNotifications);

        // تحديث health profile بناءً على البيانات الحقيقية
        const validScans = Array.isArray(scanList) ? scanList : [];
        if (validScans.length > 0) {
          const lastScan = validScans[0];
          const { riskLevel, riskScore } = deriveRiskAssessment(lastScan);
          setHealthProfile(prev => ({
            ...prev,
            lastScreening: lastScan.date,
            nextRecommended: new Date(
              new Date(lastScan.date).setMonth(new Date(lastScan.date).getMonth() + 6)
            )
              .toISOString()
              .split('T')[0],
            riskScore,
            riskLevel,
            familyHistory: data?.medicalInfo?.familyHistory || prev.familyHistory,
            ageGroup: data?.medicalInfo?.ageGroup || prev.ageGroup,
            bmi: data?.medicalInfo?.bmi || prev.bmi,
          }));
        }

        setLoading(false);

        // Check if we have a scan ID or history tab in URL query
        const params = new URLSearchParams(location.search);
        const scanId = params.get('scan');
        const tab = params.get('tab');

        if (tab === 'history' || tab === 'scans') {
          setActiveTab('history');
          scrollToScanHistory();
        }

        if (scanId) {
          const scan = await getScanById(parseInt(scanId));
          if (scan) {
            setSelectedScan(scan);
            setActiveTab('history');
            scrollToScanHistory();
          }
        }
      } catch (error) {
        logger.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [location.search]);

  // ==================== STATS ====================
  const dashboardStats = [
    {
      label: 'Total Scans',
      value: stats?.totalScans || (Array.isArray(scans) ? scans.length : 0),
      icon: '📊',
      color: 'blue',
      description: 'Medical scans uploaded',
    },
    {
      label: 'Normal Results',
      value:
        stats?.normalResults ||
        (Array.isArray(scans) ? scans.filter(s => s.result === 'Normal').length : 0),
      icon: '✅',
      color: 'green',
      description: 'Clear scan results',
    },
    {
      label: 'AI Confidence',
      value: `${stats?.averageConfidence || (Array.isArray(scans) && scans.length > 0 ? Math.round(scans.reduce((sum, s) => sum + s.confidence, 0) / scans.length) : 0)}%`,
      icon: '🤖',
      color: 'purple',
      description: 'Average accuracy',
    },
    {
      label: 'Health Score',
      value: `${100 - healthProfile.riskScore}/100`,
      icon: '❤️',
      color: 'pink',
      description: 'Overall wellness',
    },
  ];

  // ==================== PATIENT INFO CARDS ====================
  const patientInfoCards = [
    {
      id: 1,
      title: 'Basic Information',
      icon: '👤',
      color: 'blue',
      items: [
        { label: 'Name', value: patientData?.name || user.name },
        { label: 'Patient ID', value: patientData?.patientId || user.id },
        { label: 'Age', value: patientData?.age ? `${patientData.age} years` : 'N/A' },
        { label: 'Gender', value: patientData?.gender || 'Not provided' },
      ],
    },
    {
      id: 2,
      title: 'Medical Profile',
      icon: '🏥',
      color: 'green',
      items: [
        { label: 'Blood Type', value: patientData?.medicalInfo?.bloodType || 'N/A' },
        { label: 'Allergies', value: patientData?.medicalInfo?.allergies || 'Not recorded' },
        { label: 'Medications', value: patientData?.medicalInfo?.medications || 'Not recorded' },
        { label: 'BMI', value: patientData?.medicalInfo?.bmi || 'N/A' },
      ],
    },
    {
      id: 3,
      title: 'Contact & Insurance',
      icon: '📞',
      color: 'purple',
      items: [
        { label: 'Phone', value: patientData?.phone || user.email || 'N/A' },
        { label: 'Email', value: patientData?.email || user.email || 'N/A' },
        { label: 'Assigned Doctor', value: patientData?.assignedDoctorName || 'Not assigned' },
        {
          label: 'Family History',
          value: patientData?.medicalInfo?.familyHistory || 'Not recorded',
        },
      ],
    },
    {
      id: 4,
      title: 'Clinic Information',
      icon: '📍',
      color: 'orange',
      items: [
        { label: 'Primary Clinic', value: 'Noura AI Medical Center' },
        {
          label: 'Last Visit',
          value: formatDate(patientData?.lastVisit || scans?.[0]?.date || new Date().toISOString()),
        },
        {
          label: 'Next Appointment',
          value: healthProfile.nextRecommended
            ? formatDate(healthProfile.nextRecommended)
            : 'Not scheduled',
        },
        { label: 'Doctor', value: patientData?.assignedDoctorName || 'Not assigned' },
      ],
    },
  ];

  // ==================== FUNCTIONS ====================
  const scrollToScanHistory = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  };

  const openScanHistory = () => {
    setActiveTab('history');
    scrollToScanHistory();
  };

  const handleNewScan = () => navigate('/upload');

  const handleViewScan = scanId => {
    navigate(`/results?scan=${scanId}`);
  };

  const handleViewDetails = async scanId => {
    const scan = await getScanById(scanId);
    setSelectedScan(scan);
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const data = await getCurrentPatientData();
      const scanList = await getPatientScans();
      const patientStats = await getPatientStats();

      setPatientData(data);
      setScans(Array.isArray(scanList) ? scanList : []);
      setStats(patientStats);
      setLoading(false);
      setActionMessage('Data refreshed successfully.');
    } catch (error) {
      logger.error('Error refreshing data:', error);
      setLoading(false);
      setActionMessage('Unable to refresh data right now.');
    }
  };

  const handleMessageDoctor = () => {
    navigate('/messages');
  };

  const handleViewAllScans = () => {
    openScanHistory();
  };

  const handleMarkNotificationRead = id => {
    setNotifications(
      notifications.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleReminderAction = (reminderId, action) => {
    if (action === 'complete') {
      const updatedReminders = reminders.map(r =>
        r.id === reminderId ? { ...r, completed: true } : r
      );
      setReminders(updatedReminders);
      setActionMessage('Reminder marked as completed.');
    } else if (action === 'snooze') {
      setActionMessage('Reminder snoozed for 1 week.');
    }
  };

  const handleAppointmentAction = (appointmentId, action) => {
    if (action === 'reschedule') {
      setActionMessage(`Appointment ${appointmentId} marked for rescheduling follow-up.`);
    } else if (action === 'cancel') {
      setActionMessage(`Appointment ${appointmentId} marked for cancellation follow-up.`);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getStatusColor = result => {
    switch (result) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Follow-up':
        return 'bg-yellow-100 text-yellow-800';
      case 'Urgent':
      case 'Abnormal':
        return 'bg-red-100 text-red-800';
      case 'uncertain':
      case 'Unknown':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatScanResult = scan =>
    scan?.aiResult?.prediction && String(scan.aiResult.prediction).toLowerCase() !== 'unknown'
      ? scan.aiResult.prediction
      : scan?.result || 'Pending';

  const getNotificationColor = type => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIndicator = score => {
    if (score <= 20) return { color: 'green', label: 'Low Risk' };
    if (score <= 50) return { color: 'yellow', label: 'Medium Risk' };
    return { color: 'red', label: 'High Risk' };
  };

  const getCardColorClasses = color => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 hover:border-blue-300';
      case 'green':
        return 'border-green-200 hover:border-green-300';
      case 'purple':
        return 'border-purple-200 hover:border-purple-300';
      case 'orange':
        return 'border-orange-200 hover:border-orange-300';
      default:
        return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getCardIconBgColor = color => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const riskInfo = getRiskIndicator(healthProfile.riskScore);

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health data...</p>
          <p className="text-gray-400 text-sm mt-2">AI Medical System</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER CONTENT ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-white rounded-lg border border-blue-100 shadow-sm flex items-center justify-center">
                <NouraLogo size={34} boxed={false} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Dashboard</h1>
                <p className="text-xs text-gray-500">
                  Welcome back, {patientData?.name || user.name} • ID:{' '}
                  {patientData?.patientId || user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications Bell */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-blue-600 relative">
                  🔔
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={handleRefreshData}
                className="p-2 text-gray-600 hover:text-blue-600"
                title="Refresh Data"
              >
                🔄
              </button>

              <button
                onClick={handleNewScan}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center"
              >
                <span className="mr-2">📤</span>
                Upload New Scan
              </button>

              {/* Sign Out removed - use global LogoutGear in App shell */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {actionMessage && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {actionMessage}
          </div>
        )}

        {/* Welcome Banner with Stats */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome, {patientData?.name || user.name}!
                </h2>
                <p className="text-blue-100">
                  Patient ID: {patientData?.patientId || user.id} | Last updated:{' '}
                  {formatDate(new Date().toISOString())}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    AES-256 Encrypted
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    HIPAA Compliant
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    AI-Powered Insights
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">🔒 Secure</span>
                </div>
              </div>
              <div className="mt-6 md:mt-0 text-center">
                <div className="text-4xl font-bold">
                  {Array.isArray(scans) && scans.length > 0 ? scans[0].confidence : 0}%
                </div>
                <p className="text-sm mt-2 text-blue-100">Latest AI Confidence</p>
                <button
                  onClick={handleViewAllScans}
                  className="mt-3 px-4 py-1 bg-white/30 text-white rounded-lg text-sm hover:bg-white/40"
                >
                  View All Scans
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information Cards - Grid Layout */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">👤 Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {patientInfoCards.map(card => (
              <div
                key={card.id}
                className={`bg-white rounded-xl shadow-sm border ${getCardColorClasses(card.color)} p-5 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${getCardIconBgColor(card.color)} flex items-center justify-center mr-3`}
                  >
                    <span className="text-lg">{card.icon}</span>
                  </div>
                  <h4 className="font-bold text-gray-900">{card.title}</h4>
                </div>

                <div className="space-y-3">
                  {card.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      if (card.id === 3) {
                        alert('Edit contact information');
                      } else if (card.id === 4) {
                        setActiveTab('appointments');
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {card.id === 4 ? 'View Appointments →' : 'Edit Information'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">📬 Notifications</h3>
                <button
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-2">
                {notifications
                  .filter(n => !n.read)
                  .slice(0, 3)
                  .map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${getNotificationColor(notification.type)} flex justify-between items-center`}
                    >
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-xs opacity-75">{notification.time}</p>
                      </div>
                      <button
                        onClick={() => handleMarkNotificationRead(notification.id)}
                        className="text-sm opacity-70 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== HEALTH TRACKER SECTION ==================== */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🩺 Health Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Assessment Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">Risk Assessment</h4>
                <span
                  className={`px-3 py-1 ${riskInfo.color === 'green' ? 'bg-green-100 text-green-800' : riskInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} rounded-full text-xs font-bold`}
                >
                  {riskInfo.label}
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {healthProfile.riskScore}
                </div>
                <div className="text-gray-500">Risk Score /100</div>
                <div className="mt-2 text-sm text-gray-600">Lower scores indicate lower risk</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Family History</span>
                  <span className="font-medium">{healthProfile.familyHistory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age Group</span>
                  <span className="font-medium">{healthProfile.ageGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI</span>
                  <span className="font-medium">{healthProfile.bmi}</span>
                </div>
              </div>
            </div>

            {/* Screening Schedule Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">📅 Screening Schedule</h4>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Last Screening</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatDate(healthProfile.lastScreening)}
                  </div>
                  <div className="text-xs text-gray-500">Medical scan at Cairo Medical Center</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Next Recommended</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatDate(healthProfile.nextRecommended)}
                  </div>
                  <div className="text-xs text-gray-500">Approx. 6 months from last screening</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-sm text-gray-600 mb-2">Screening Frequency</div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">On Track</span>
                </div>
              </div>
            </div>

            {/* Self-Exam Tracker */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">👐 Self-Exam Tracker</h4>
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {healthProfile.selfExamFrequency}
                </div>
                <div className="text-gray-600">Recommended Frequency</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Self-Exam</span>
                  <span className="font-medium">{formatDate(healthProfile.lastSelfExam)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Due</span>
                  <span className="font-medium">April 1, 2026</span>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg">
                📝 Log Self-Exam
              </button>
            </div>
          </div>
        </div>

        {/* ==================== SMART REMINDERS SECTION ==================== */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">🔔 Smart Reminders</h3>
            <span className="text-sm text-gray-500">
              {reminders.filter(r => !r.completed).length} pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reminders.map(reminder => (
              <div
                key={reminder.id}
                className={`bg-white rounded-xl shadow p-4 border ${reminder.completed ? 'border-gray-200' : 'border-blue-200'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{reminder.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">{reminder.title}</h4>
                      <p className="text-sm text-gray-500">{reminder.description}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      reminder.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : reminder.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {reminder.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{reminder.date}</span>
                  <div className="flex space-x-2">
                    {!reminder.completed && (
                      <>
                        <button
                          onClick={() => handleReminderAction(reminder.id, 'snooze')}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => handleReminderAction(reminder.id, 'complete')}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    {reminder.completed && (
                      <span className="text-xs text-green-600 font-medium">✓ Done</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      stat.color === 'blue'
                        ? 'bg-blue-100'
                        : stat.color === 'green'
                          ? 'bg-green-100'
                          : stat.color === 'purple'
                            ? 'bg-purple-100'
                            : 'bg-pink-100'
                    } flex items-center justify-center`}
                  >
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                </div>
                <div
                  className={`h-2 ${
                    stat.color === 'blue'
                      ? 'bg-blue-100'
                      : stat.color === 'green'
                        ? 'bg-green-100'
                        : stat.color === 'purple'
                          ? 'bg-purple-100'
                          : 'bg-pink-100'
                  } rounded-full overflow-hidden`}
                >
                  <div
                    className={`h-full ${
                      stat.color === 'blue'
                        ? 'bg-blue-500'
                        : stat.color === 'green'
                          ? 'bg-green-500'
                          : stat.color === 'purple'
                            ? 'bg-purple-500'
                            : 'bg-pink-500'
                    } rounded-full`}
                    style={{
                      width:
                        typeof stat.value === 'number'
                          ? `${Math.min(stat.value * 10, 100)}%`
                          : stat.value.includes('%')
                            ? `${parseInt(stat.value)}%`
                            : '90%',
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== TABS NAVIGATION ==================== */}
        <div className="mb-8" ref={historySectionRef} id="scan-history">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Overview
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📁 Scan History ({Array.isArray(scans) ? scans.length : 0})
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'trends'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📈 Trends
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📅 Appointments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {Array.isArray(scans) &&
                      scans.slice(0, 5).map(scan => (
                        <div
                          key={scan.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleViewScan(scan.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{scan.scanType}</h4>
                              <p className="text-sm text-gray-500">{formatDate(scan.date)}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(formatScanResult(scan))}`}
                            >
                              {formatScanResult(scan)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-gray-600">AI Confidence: </span>
                              <span
                                className={`font-medium ${
                                  scan.confidence >= 95
                                    ? 'text-green-600'
                                    : scan.confidence >= 85
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                }`}
                              >
                                {scan.confidence}%
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleViewScan(scan.id);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Analysis
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleViewDetails(scan.id);
                                }}
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {(!Array.isArray(scans) || scans.length === 0) && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">📤</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">No scans yet</h4>
                        <p className="text-gray-600 mb-6">
                          Upload your first medical scan to get started with AI analysis.
                        </p>
                        <button
                          onClick={handleNewScan}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
                        >
                          Upload First Scan
                        </button>
                      </div>
                    )}

                    {Array.isArray(scans) && scans.length > 5 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={handleViewAllScans}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all {scans.length} scans →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Summary & Quick Actions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Health Summary</h3>
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-4 w-10 h-10 bg-white rounded-lg border border-blue-100 shadow-sm flex items-center justify-center">
                          <NouraLogo size={25} boxed={false} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Risk Assessment</div>
                          <div className="text-gray-600">{healthProfile.riskLevel} Risk</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-green-600">📅</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Next Appointment</div>
                          <div className="text-gray-600">
                            {appointments.length > 0
                              ? formatDate(appointments[0].date)
                              : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-purple-600">🤖</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">AI Analysis Status</div>
                          <div className="text-gray-600">
                            {Array.isArray(scans) && scans.length > 0
                              ? 'Latest scan analyzed'
                              : 'No analysis yet'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6">
                    <h4 className="font-bold text-gray-900 mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleNewScan}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-center"
                      >
                        <div className="text-2xl mb-2">📤</div>
                        <div className="text-sm font-medium text-blue-700">New Scan</div>
                      </button>
                      <button
                        onClick={handleMessageDoctor}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-center"
                      >
                        <div className="text-2xl mb-2">💬</div>
                        <div className="text-sm font-medium text-green-700">Message Doctor</div>
                      </button>
                      <button
                        onClick={() => navigate('/results')}
                        className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-center"
                      >
                        <div className="text-2xl mb-2">📄</div>
                        <div className="text-sm font-medium text-purple-700">Reports</div>
                      </button>
                      <button
                        onClick={() => navigate('/help')}
                        className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 text-center"
                      >
                        <div className="text-2xl mb-2">❓</div>
                        <div className="text-sm font-medium text-orange-700">Help</div>
                      </button>
                    </div>
                  </div>

                  {/* Health Tips */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800 mb-2">💡 Health Tips</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Perform a monthly symptom self-check</li>
                      <li>• Maintain healthy weight</li>
                      <li>• Limit alcohol consumption</li>
                      <li>• Stay physically active</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Scan History</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleNewScan}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium"
                  >
                    + New Scan
                  </button>
                  <button
                    onClick={() => {
                      if (scans.length > 0) {
                        handleViewScan(scans[0].id);
                      }
                    }}
                    disabled={!Array.isArray(scans) || scans.length === 0}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Latest Analysis
                  </button>
                </div>
              </div>

              {!Array.isArray(scans) || scans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No scans yet</h4>
                  <p className="text-gray-600 mb-6">
                    Upload your first medical scan to get started.
                  </p>
                  <button
                    onClick={handleNewScan}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
                  >
                    Upload First Scan
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Scan Type</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Result</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          AI Confidence
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Doctor Review
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map(scan => (
                        <tr key={scan.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDate(scan.date)}</td>
                          <td className="py-3 px-4 font-medium">{scan.scanType}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(formatScanResult(scan))}`}
                            >
                              {formatScanResult(scan)}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{scan.confidence}%</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs ${
                                scan.doctorReview ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              {scan.doctorReview || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewScan(scan.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleViewDetails(scan.id)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">📈 Screening Trends</h3>
                  <p className="text-gray-600">Track your screening results over time</p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
                    6 Months
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                    1 Year
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
                    All Time
                  </button>
                </div>
              </div>

              {/* Trend Visualization */}
              <div className="mb-8">
                <div className="flex items-end h-48 space-x-4 mb-6">
                  {trends.map((scan, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-10 rounded-t-lg ${
                          scan.result === 'Normal' ? 'bg-green-400' : 'bg-yellow-400'
                        }`}
                        style={{ height: `${scan.confidence * 1.5}px` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500">
                        {scan.month} '{scan.year.toString().slice(-2)}
                      </div>
                      <div className="text-xs font-medium mt-1">{scan.confidence}%</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
                    <span className="text-gray-600">Normal Results</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                    <span className="text-gray-600">Follow-up Required</span>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Screenings</div>
                  <div className="text-2xl font-bold text-gray-900">{trends.length}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Average Confidence</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      trends.reduce((sum, scan) => sum + scan.confidence, 0) / trends.length
                    )}
                    %
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Normal Results</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {trends.filter(s => s.result === 'Normal').length}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Consistency Score</div>
                  <div className="text-2xl font-bold text-gray-900">94%</div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
                <button
                  onClick={() => alert('Schedule new appointment')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  + Schedule New
                </button>
              </div>

              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-blue-600 text-lg">📅</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{appointment.type}</h4>
                            <p className="text-gray-600">With {appointment.doctor}</p>
                            <p className="text-sm text-gray-500 mt-1">{appointment.location}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            📍 {formatDate(appointment.date)} at {appointment.time}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'reschedule')}
                          className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                          className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">💡 Appointment Tips</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Arrive 15 minutes early for paperwork</li>
                  <li>• Bring your ID and insurance card</li>
                  <li>• Prepare questions for your doctor</li>
                  <li>• Wear comfortable clothing</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Scan Details Modal */}
        {selectedScan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Scan Details</h3>
                  <button
                    onClick={() => setSelectedScan(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Scan Type</div>
                      <div className="font-medium text-lg">{selectedScan.scanType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Date</div>
                      <div className="font-medium text-lg">{formatDate(selectedScan.date)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Result</div>
                      <div
                        className={`font-medium text-lg ${getStatusColor(selectedScan.result)} px-3 py-1 rounded inline-block`}
                      >
                        {selectedScan.result}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">AI Confidence</div>
                      <div className="font-medium text-lg">{selectedScan.confidence}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Doctor Review</div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {selectedScan.doctorReview || 'No doctor review available yet.'}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        navigate(`/results?scan=${selectedScan.id}`);
                        setSelectedScan(null);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
                    >
                      View Full Analysis
                    </button>
                    <button
                      onClick={() => setSelectedScan(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BOTTOM CTA ==================== */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Proactive with Your Health</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Regular screenings and early detection are important for cancer awareness and overall
            health. Our AI-powered system helps you stay on track with personalized reminders and
            insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNewScan}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50"
            >
              Schedule New Scan
            </button>
            <button
              onClick={() => navigate('/help')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10"
            >
              View Prevention Guide
            </button>
          </div>
        </div>

        {/* Update Notification */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center">
            <span className="text-blue-600 mr-3">🔄</span>
            <div>
              <p className="text-blue-700 font-medium">Data Updates in Real-time</p>
              <p className="text-blue-600 text-sm">
                Your dashboard updates automatically when you upload new scans or view results. Last
                update: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Noura AI Patient Dashboard. All medical data is encrypted and protected.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            For emergencies, contact: +20 100 000 0000 • support@noura-ai.com
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="text-xs text-gray-500">AES-256 Encryption</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">HIPAA Compliant</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">Secure Cloud Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientDashboard;
