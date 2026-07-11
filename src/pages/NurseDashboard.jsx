import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureGetItem, secureClearAll } from '../utils/securityUtils';
import { endCurrentSession } from '../utils/analyticsService';
import { getAllPatients, getPatientScans } from '../utils/dataStore';
import { logger } from '../utils/logger';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notifications');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Nurse info from secure storage
  const getNurseInfo = () => {
    const userData = secureGetItem('user');
    return {
      name: userData?.name || 'ممرضة سارة',
      id: userData?.userId || userData?.id || 'NU-2026-001',
    };
  };

  const { name: nurseName, id: nurseId } = getNurseInfo();

  // ==================== SAMPLE DATA ====================
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const records = await getAllPatients();
        const withScans = await Promise.all(
          records.map(async patient => {
            const scans = await getPatientScans(patient.patientId || patient.userId || patient.id);
            const latestScan = scans[0];
            return {
              id: patient.id,
              patientId: patient.patientId || patient.userId || patient.id,
              name: patient.name,
              age: patient.age || 'N/A',
              scanDate:
                latestScan?.date || patient.lastVisit || new Date().toISOString().slice(0, 10),
              result: latestScan?.result || 'Pending',
              status: latestScan?.doctorReview
                ? 'results_ready'
                : latestScan
                  ? 'pending_review'
                  : 'upload_complete',
              notified: false,
              doctor: patient.assignedDoctorName || 'Assigned Doctor',
              nextAppointment: patient.nextAppointment || 'Not scheduled',
              contact: patient.phone || 'N/A',
            };
          })
        );
        setPatients(withScans);
      } catch (error) {
        logger.error('Error loading nurse dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // ==================== STATS ====================
  const stats = [
    {
      label: 'Patients Today',
      value: patients.length,
      icon: '👥',
      color: 'blue',
      change: '5 total',
    },
    {
      label: 'Results Ready',
      value: patients.filter(p => p.status === 'results_ready').length,
      icon: '📋',
      color: 'green',
      change: `${patients.filter(p => p.status === 'results_ready').length} to notify`,
    },
    {
      label: 'Pending Reviews',
      value: patients.filter(p => p.status === 'pending_review').length,
      icon: '⏳',
      color: 'yellow',
      change: 'Awaiting doctor',
    },
    {
      label: 'Notifications Sent',
      value: patients.filter(p => p.notified).length,
      icon: '📨',
      color: 'purple',
      change: 'Today',
    },
  ];

  // ==================== FUNCTIONS ====================
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNotifyPatient = patientId => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setNotificationMessage(
      `Dear ${patient.name}, your scan results from ${formatDate(patient.scanDate)} are now available. Please check your dashboard or contact your doctor for details.`
    );
  };

  const sendNotification = () => {
    if (!notificationMessage.trim()) {
      alert('Please enter a notification message');
      return;
    }

    const updatedPatients = patients.map(p =>
      p.id === selectedPatient.id ? { ...p, notified: true, status: 'patient_notified' } : p
    );

    setPatients(updatedPatients);

    // Simulate sending notification
    setTimeout(() => {
      alert(`✅ Notification sent to ${selectedPatient.name}\n\nMessage: ${notificationMessage}`);
      setSelectedPatient(null);
      setNotificationMessage('');
    }, 500);
  };

  const handleUploadScan = patientId => {
    const patient = patients.find(p => p.id === patientId);
    navigate('/upload', {
      state: { patientId: patient.patientId, patientName: patient.name },
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'results_ready':
        return 'bg-green-100 text-green-800';
      case 'patient_notified':
        return 'bg-blue-100 text-blue-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'doctor_reviewing':
        return 'bg-purple-100 text-purple-800';
      case 'upload_complete':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'results_ready':
        return '📋 Results Ready';
      case 'patient_notified':
        return '📨 Patient Notified';
      case 'pending_review':
        return '⏳ Pending Doctor Review';
      case 'doctor_reviewing':
        return '👨‍⚕️ Doctor Reviewing';
      case 'upload_complete':
        return '✅ Upload Complete';
      default:
        return status;
    }
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
          <p className="text-gray-400 text-sm mt-2">Nurse Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💉</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nurse Dashboard</h1>
                <p className="text-xs text-gray-500">
                  Welcome, Nurse {nurseName} | ID: {nurseId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                <span className="font-medium">Role:</span> Patient Support & Notifications
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center"
              >
                <span className="mr-2">📤</span>
                Upload Scan
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-green-600"
                title="Settings"
              >
                ⚙️
              </button>
              {/* Sign Out removed - use global LogoutGear in App shell */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Patient Support Dashboard</h2>
                <p className="text-green-100">Manage patient notifications and scan uploads</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    📨 Send Notifications
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    📤 Upload Scans
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    👥 Patient Support
                  </span>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="text-center">
                  <div className="text-4xl font-bold">💉</div>
                  <p className="text-sm mt-2 text-green-100">Medical Support Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      stat.color === 'blue'
                        ? 'bg-blue-100'
                        : stat.color === 'green'
                          ? 'bg-green-100'
                          : stat.color === 'yellow'
                            ? 'bg-yellow-100'
                            : 'bg-purple-100'
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
                        : stat.color === 'yellow'
                          ? 'bg-yellow-100'
                          : 'bg-purple-100'
                  } rounded-full overflow-hidden`}
                >
                  <div
                    className={`h-full ${
                      stat.color === 'blue'
                        ? 'bg-blue-500'
                        : stat.color === 'green'
                          ? 'bg-green-500'
                          : stat.color === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-purple-500'
                    } rounded-full`}
                    style={{
                      width:
                        typeof stat.value === 'number'
                          ? `${Math.min(stat.value * 20, 100)}%`
                          : '90%',
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📨 Notifications
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'patients'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 Patients List
              </button>
              <button
                onClick={() => setActiveTab('uploads')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'uploads'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📤 Upload Management
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'messages'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💬 Messages
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Patient Notifications</h3>
                  <p className="text-gray-600 text-sm">Notify patients when results are ready</p>
                </div>
                <div className="text-sm text-gray-500">
                  {patients.filter(p => p.status === 'results_ready' && !p.notified).length} pending
                  notifications
                </div>
              </div>

              {patients.filter(p => p.status === 'results_ready' && !p.notified).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">All Clear!</h4>
                  <p className="text-gray-600">No pending notifications at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients
                    .filter(p => p.status === 'results_ready' && !p.notified)
                    .map(patient => (
                      <div key={patient.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div className="mb-4 md:mb-0">
                            <h4 className="font-bold text-gray-900 text-lg">{patient.name}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                ID: {patient.patientId}
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Scan: {formatDate(patient.scanDate)}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                Doctor: {patient.doctor}
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{patient.result}</div>
                            <div className="text-gray-500 text-sm">AI Result</div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => handleNotifyPatient(patient.id)}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg flex items-center justify-center"
                          >
                            <span className="mr-2">📨</span>
                            Notify Patient
                          </button>
                          <button
                            onClick={() => handleUploadScan(patient.id)}
                            className="flex-1 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 flex items-center justify-center"
                          >
                            <span className="mr-2">📤</span>
                            Upload New Scan
                          </button>
                          <button
                            onClick={() =>
                              navigate('/messages', {
                                state: { recipient: patient.name, patientId: patient.patientId },
                              })
                            }
                            className="flex-1 px-6 py-3 border-2 border-purple-500 text-purple-500 rounded-lg font-medium hover:bg-purple-50 flex items-center justify-center"
                          >
                            <span className="mr-2">💬</span>
                            Message Patient
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Patients List Tab */}
          {activeTab === 'patients' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Patient Management</h3>
                <div className="text-sm text-gray-500">
                  {patients.length} patients • {patients.filter(p => p.notified).length} notified
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Patient</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Last Scan</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Result</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Doctor</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {patient.patientId} • Age: {patient.age}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatDate(patient.scanDate)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              patient.result === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : patient.result === 'Follow-up'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {patient.result}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}
                          >
                            {getStatusText(patient.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{patient.doctor}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {patient.status === 'results_ready' && !patient.notified && (
                              <button
                                onClick={() => handleNotifyPatient(patient.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                              >
                                Notify
                              </button>
                            )}
                            <button
                              onClick={() => handleUploadScan(patient.id)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                            >
                              Upload
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Management Tab */}
          {activeTab === 'uploads' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Scan Upload Management</h3>
                  <p className="text-gray-600 text-sm">Upload and manage medical images</p>
                </div>
                <button
                  onClick={() => navigate('/upload')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg flex items-center"
                >
                  <span className="mr-2">📤</span>
                  New Upload
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate('/upload')}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📤</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Upload New Scan</h4>
                  <p className="text-gray-600 mb-4">Upload medical images for AI analysis</p>
                  <div className="text-sm text-gray-500">Supports: DICOM, JPEG, PNG • Max 10MB</div>
                </div>

                <div
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => setActiveTab('notifications')}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📨</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Pending Notifications</h4>
                  <p className="text-gray-600 mb-4">
                    {patients.filter(p => p.status === 'results_ready' && !p.notified).length}{' '}
                    patients waiting for notification
                  </p>
                  <div className="text-sm text-gray-500">Click to review pending notifications</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-blue-800 mb-3">📋 Upload Guidelines</h4>
                <ul className="text-blue-700 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Ensure patient consent is obtained before uploading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Verify patient information matches the scan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Use secure connection for all uploads</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Notify patients within 24 hours of results</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Messages</h3>
                <button
                  onClick={() => navigate('/messages')}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  + New Message
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-blue-800 mb-2">💬 Quick Message Patients</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {patients.slice(0, 3).map(patient => (
                    <button
                      key={patient.id}
                      onClick={() =>
                        navigate('/messages', {
                          state: { recipient: patient.name, patientId: patient.patientId },
                        })
                      }
                      className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 text-left"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600">👤</span>
                        </div>
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-gray-500 text-sm">{patient.patientId}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-4">Quick Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => alert('Contact Dr. Ahmed')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">👨‍⚕️</div>
                    <div className="font-medium">Dr. Ahmed</div>
                    <div className="text-gray-500 text-sm">Primary Doctor</div>
                  </button>
                  <button
                    onClick={() => alert('Emergency Contact')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">🚨</div>
                    <div className="font-medium">Emergency</div>
                    <div className="text-gray-500 text-sm">24/7 Support</div>
                  </button>
                  <button
                    onClick={() => alert('Technical Support')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="font-medium">IT Support</div>
                    <div className="text-gray-500 text-sm">Technical Issues</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Patient Support & Communication</h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Timely notifications and clear communication are essential for patient care and
            satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('notifications')}
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50"
            >
              Review Pending Notifications
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10"
            >
              Upload New Scan
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Noura AI Nurse Dashboard. Medical Support System.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            For urgent patient inquiries: +20 100 000 0000 • Nurse support line available
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="text-xs text-gray-500">📨 Notification Access</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">📤 Upload Privileges</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">👥 Patient Support</span>
          </div>
        </div>
      </footer>

      {/* Notification Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Notify Patient</h3>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setNotificationMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-medium text-blue-800">Patient: {selectedPatient.name}</p>
                  <p className="text-blue-700 text-sm">ID: {selectedPatient.patientId}</p>
                  <p className="text-blue-700 text-sm">
                    Scan Date: {formatDate(selectedPatient.scanDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Notification Message *
                  </label>
                  <textarea
                    value={notificationMessage}
                    onChange={e => setNotificationMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="4"
                    placeholder="Enter notification message for the patient..."
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    This message will be sent to the patient through the system.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setNotificationMessage('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;
