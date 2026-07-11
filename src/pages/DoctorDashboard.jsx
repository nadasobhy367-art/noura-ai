import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureGetItem, secureClearAll } from '../utils/securityUtils';
import { endCurrentSession } from '../utils/analyticsService';
import { logger } from '../utils/logger';
import {
  getPatientsByDoctor,
  canDoctorAccessPatient,
  createAccessRequest,
  getDoctorAccessRequests,
  getAllPatients,
  getPatientById,
  getPatientScans,
} from '../utils/dataStore';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all_patients');
  const [myPatients, setMyPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [pendingAnalyses, setPendingAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [selectedPatient, setSelectedPatient] = useState(null);
  const [myAccessRequests, setMyAccessRequests] = useState([]);

  // 🔥 Patient Details Modal
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [patientScans, setPatientScans] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);

  // Request Access Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPatient, setRequestPatient] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  // Doctor info from secure storage
  const getDoctorInfo = () => {
    const userData = secureGetItem('user');
    return {
      name: userData?.name || 'دكتور أحمد',
      id: userData?.userId || userData?.id || 'DR-2026-001',
      specialty: userData?.specialty || 'general',
      specialtyName: userData?.specialtyName || 'طب عام',
      specialtyIcon: userData?.specialtyIcon || '👨‍⚕️',
      department: userData?.department || 'General Department',
    };
  };

  const doctor = getDoctorInfo();

  // ==================== LOAD DATA ====================
  useEffect(() => {
    const loadDashboard = async () => {
      // 🔥 جيب المرضى بتوع الدكتور ده
      const myPatientsData = await getPatientsByDoctor(doctor.id);
      logger.debug('My Patients:', myPatientsData);

      // Format my patients
      const formattedMyPatients = myPatientsData.map(patient => ({
        id: patient.id,
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        lastScan: patient.lastVisit,
        riskLevel: 'Low',
        aiResult: 'Normal',
        aiConfidence: 98.7,
        doctorNotes: '',
        status: 'reviewed',
        nextAppointment: '2026-04-10',
        contact: patient.phone,
        email: patient.email,
        medicalInfo: patient.medicalInfo,
        assignedDoctorName: patient.assignedDoctorName,
        assignedDoctorIcon: patient.assignedDoctorIcon,
      }));

      setMyPatients(formattedMyPatients);

      // 🔥 جيب كل المرضى (All Patients)
      const allPatientsData = await getAllPatients();
      logger.debug('All Patients:', allPatientsData);
      setAllPatients(allPatientsData);

      // Mock pending analyses
      const mockPendingAnalyses = formattedMyPatients
        .filter(p => p.aiConfidence < 95)
        .map((p, idx) => ({
          id: 100 + idx,
          patientName: p.name,
          patientId: p.patientId,
          scanDate: p.lastScan,
          scanType: 'Medical Scan',
          aiConfidence: p.aiConfidence,
          aiRecommendation: p.aiConfidence < 70 ? 'Immediate review' : 'Follow-up required',
          priority: p.aiConfidence < 70 ? 'urgent' : 'high',
        }));

      setPendingAnalyses(mockPendingAnalyses);

      // جيب طلبات الوصول
      const requests = await getDoctorAccessRequests(doctor.id);
      logger.debug('Access Requests:', requests);
      setMyAccessRequests(requests);

      setLoading(false);
    };

    loadDashboard().catch(error => {
      logger.error('Error loading doctor dashboard:', error);
      setLoading(false);
    });
  }, [doctor.id]);

  // ==================== STATS DATA ====================
  const stats = [
    {
      label: 'My Patients',
      value: myPatients.length,
      icon: doctor.specialtyIcon || '👥',
      color: 'blue',
      change: `${doctor.specialtyName}`,
    },
    {
      label: 'All Patients',
      value: allPatients.length,
      icon: '👥',
      color: 'green',
      change: 'In System',
    },
    {
      label: 'Pending Requests',
      value: myAccessRequests.filter(r => r.status === 'pending').length,
      icon: '⏳',
      color: 'yellow',
      change:
        myAccessRequests.filter(r => r.status === 'pending').length > 0
          ? 'Awaiting approval'
          : 'None',
    },
    {
      label: 'Approved Access',
      value: myAccessRequests.filter(r => r.status === 'approved').length,
      icon: '✅',
      color: 'purple',
      change: 'Temporary access',
    },
  ];

  // ==================== FUNCTIONS ====================
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 🔥 FIXED: View Patient Details (مع إصلاح الـ Error الأحمر)
  const handleViewPatientDetails = async patient => {
    logger.debug('Viewing patient:', patient);

    // 🔥 FIX: استخدم patient.patientId أو patient.id
    const patientId = patient.patientId || patient.id;

    logger.debug('Checking access for patientId:', patientId);

    // Check access permission
    const access = await canDoctorAccessPatient(doctor.id, patientId);
    logger.debug('Access result:', access);

    if (!access.canAccess) {
      logger.debug('Access denied, showing request modal');

      // Show request modal
      setRequestPatient({
        id: patientId,
        patientId: patient.patientId || patient.id,
        name: patient.name,
        primaryDoctor: patient.assignedDoctorName,
      });
      setShowRequestModal(true);
      return;
    }

    // ✅ Access granted - Load patient data
    logger.debug('Access granted. Loading patient details...');

    try {
      const [patientData, scans] = await Promise.all([
        getPatientById(patientId),
        getPatientScans(patientId),
      ]);

      logger.debug('Loaded patient data:', { patientData, scans });

      if (patientData) {
        setPatientDetails(patientData);
        setPatientScans(Array.isArray(scans) ? scans : []);
        setAccessInfo(access);
        setShowPatientDetailsModal(true);

        // إذا كان temporary access
        if (access.reason === 'approved_access') {
          logger.debug('Temporary access granted until:', access.expiryDate);
        }
      } else {
        logger.error('Patient data not found for ID:', patientId);
        alert('❌ Error: Patient data not found');
      }
    } catch (error) {
      logger.error('Error loading patient:', error);
      alert('❌ Error loading patient data: ' + error.message);
    }
  };

  // Request Access
  const handleRequestAccess = async () => {
    if (!requestReason.trim()) {
      alert('⚠️ Please provide a reason for access request');
      return;
    }

    logger.debug('Sending access request:', {
      doctorId: doctor.id,
      patientId: requestPatient.id,
      reason: requestReason,
    });

    const result = await createAccessRequest(doctor.id, requestPatient.id, requestReason);

    if (result.success) {
      alert(
        '✅ Access Request Submitted!\n\nYour request has been sent to the admin for approval.\n\nYou can check the status in the "Access Requests" tab.'
      );
      setShowRequestModal(false);
      setRequestReason('');
      setRequestPatient(null);

      // Refresh requests
      const requests = await getDoctorAccessRequests(doctor.id);
      setMyAccessRequests(requests);
    } else {
      alert(`❌ Request Failed\n\n${result.message}`);
    }
  };

  const handleMessagePatient = patient => {
    navigate('/messages', {
      state: { recipient: patient.name, patientId: patient.patientId || patient.id },
    });
  };

  const handleOverrideAI = (patientId, overrideType) => {
    const updatedPatients = myPatients.map(p => {
      if (p.id === patientId || p.patientId === patientId) {
        return {
          ...p,
          status: 'doctor_reviewed',
          doctorNotes: `AI overridden - ${overrideType}`,
          aiResult: overrideType === 'confirm' ? 'Confirmed by Doctor' : 'Rejected by Doctor',
        };
      }
      return p;
    });
    setMyPatients(updatedPatients);
    alert(`✅ AI analysis ${overrideType === 'confirm' ? 'confirmed' : 'rejected'} for patient`);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = risk => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScanResultColor = result => {
    switch (result) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Follow-up':
        return 'bg-yellow-100 text-yellow-800';
      case 'Abnormal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 🔥 Helper functions for access status
  const isMyPatient = patientId => {
    return myPatients.some(p => p.patientId === patientId || p.id === patientId);
  };

  const hasApprovedAccess = patientId => {
    return myAccessRequests.some(r => r.patientId === patientId && r.status === 'approved');
  };

  const hasPendingRequest = patientId => {
    return myAccessRequests.some(r => r.patientId === patientId && r.status === 'pending');
  };

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
          <p className="text-gray-400 text-sm mt-2">AI Medical System</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">{doctor.specialtyIcon}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-xs text-gray-500">
                  Dr. {doctor.name} | {doctor.department}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                <span className="font-medium">Access Control:</span> Active
              </div>
              <button
                onClick={() => navigate('/analytics')}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
                title="Open Analytics Dashboard"
              >
                Analytics
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-blue-600"
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {doctor.specialtyIcon} {doctor.specialtyName} Department
                </h2>
                <p className="text-blue-100">
                  {myPatients.length} assigned patients • {allPatients.length} total patients in
                  system
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    Access Control Active
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    Request System Enabled
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    HIPAA Compliant
                  </span>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="text-center">
                  <div className="text-4xl font-bold">👨‍⚕️</div>
                  <p className="text-sm mt-2 text-blue-100">Medical Professional</p>
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
                          ? `${Math.min(stat.value * 10, 100)}%`
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
                onClick={() => setActiveTab('all_patients')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'all_patients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 All Patients ({allPatients.length})
              </button>
              <button
                onClick={() => setActiveTab('my_patients')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'my_patients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {doctor.specialtyIcon} My Patients ({myPatients.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🔓 Access Requests ({myAccessRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Pending AI Reviews ({pendingAnalyses.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📈 Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 🔥 ALL PATIENTS TAB */}
          {activeTab === 'all_patients' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">All Patients in System</h3>
                  <p className="text-gray-600 text-sm">You can request access to any patient</p>
                </div>
                <div className="text-sm text-gray-500">{allPatients.length} total patients</div>
              </div>

              {allPatients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-600">No patients in system</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Primary Doctor
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Age</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Last Visit
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Access Status
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPatients.map(patient => {
                        const patientId = patient.patientId || patient.id;
                        const isMine = isMyPatient(patientId);
                        const hasAccess = hasApprovedAccess(patientId);
                        const isPending = hasPendingRequest(patientId);

                        return (
                          <tr
                            key={patient.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-500">ID: {patient.patientId}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="mr-2">{patient.assignedDoctorIcon || '👨‍⚕️'}</span>
                                <span className="text-sm">{patient.assignedDoctorName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{patient.age} years</td>
                            <td className="py-3 px-4">{formatDate(patient.lastVisit)}</td>
                            <td className="py-3 px-4">
                              {isMine ? (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  👨‍⚕️ My Patient
                                </span>
                              ) : hasAccess ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  ✅ Approved Access
                                </span>
                              ) : isPending ? (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  ⏳ Request Pending
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                  🔒 No Access
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleViewPatientDetails(patient)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                              >
                                {isMine || hasAccess ? '👁️ View Details' : '🔓 Request Access'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MY PATIENTS TAB */}
          {activeTab === 'my_patients' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">My Assigned Patients</h3>
                <div className="text-sm text-gray-500">{myPatients.length} patients</div>
              </div>

              {myPatients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">{doctor.specialtyIcon}</div>
                  <p className="text-gray-600 mb-2">No patients assigned yet</p>
                  <p className="text-gray-500 text-sm">
                    Patients will appear here when assigned to your specialty
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Last Visit
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">AI Result</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Risk Level
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPatients.map(patient => (
                        <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-500">
                                ID: {patient.patientId} • Age: {patient.age}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{formatDate(patient.lastScan)}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{patient.aiResult}</div>
                              <div className="text-xs text-gray-500">
                                {patient.aiConfidence}% confidence
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskLevel)}`}
                            >
                              {patient.riskLevel} Risk
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}
                            >
                              {patient.status === 'urgent'
                                ? '🚨 Urgent'
                                : patient.status === 'pending'
                                  ? '📋 Pending'
                                  : patient.status === 'new'
                                    ? '🆕 New'
                                    : '✅ Reviewed'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewPatientDetails(patient)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => handleMessagePatient(patient)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                              >
                                💬
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

          {/* ACCESS REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Access Requests</h3>
                  <p className="text-gray-600 text-sm">Track your patient access requests</p>
                </div>
                <div className="text-sm text-gray-500">
                  {myAccessRequests.filter(r => r.status === 'pending').length} pending •{' '}
                  {myAccessRequests.length} total
                </div>
              </div>

              {myAccessRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔓</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No Access Requests</h4>
                  <p className="text-gray-600 mb-6">
                    You haven't requested access to any patients yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('all_patients')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                  >
                    View All Patients
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending Requests First */}
                  {myAccessRequests.filter(r => r.status === 'pending').length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">⏳ Pending Requests</h4>
                      {myAccessRequests
                        .filter(r => r.status === 'pending')
                        .map(request => (
                          <div
                            key={request.id}
                            className="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-6 mb-4"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className="font-bold text-gray-900 text-lg">
                                  {request.patientName}
                                </h5>
                                <p className="text-gray-600 text-sm">
                                  Patient ID: {request.patientId}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                  Primary Doctor: {request.primaryDoctorName}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  Requested: {formatDate(request.requestDate)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}
                              >
                                ⏳ Pending Admin Review
                              </span>
                            </div>

                            <div className="mb-4 p-4 bg-white rounded-lg">
                              <h6 className="font-medium text-gray-900 mb-2 text-sm">Reason:</h6>
                              <p className="text-gray-700 text-sm">{request.reason}</p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-blue-800 text-sm">
                                ⏰ Your request is being reviewed by the admin. You will be notified
                                once a decision is made.
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Approved/Rejected Requests */}
                  {myAccessRequests.filter(r => r.status !== 'pending').length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">📋 Request History</h4>
                      {myAccessRequests
                        .filter(r => r.status !== 'pending')
                        .map(request => (
                          <div
                            key={request.id}
                            className={`border rounded-xl p-6 mb-4 ${
                              request.status === 'approved'
                                ? 'border-green-300 bg-green-50'
                                : 'border-red-300 bg-red-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className="font-bold text-gray-900 text-lg">
                                  {request.patientName}
                                </h5>
                                <p className="text-gray-600 text-sm">
                                  Patient ID: {request.patientId}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                  Primary Doctor: {request.primaryDoctorName}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  Requested: {formatDate(request.requestDate)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}
                              >
                                {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                              </span>
                            </div>

                            <div className="mb-4 p-4 bg-white rounded-lg">
                              <h6 className="font-medium text-gray-900 mb-2 text-sm">Reason:</h6>
                              <p className="text-gray-700 text-sm">{request.reason}</p>
                            </div>

                            {request.reviewNotes && (
                              <div
                                className={`p-4 rounded-lg border ${
                                  request.status === 'approved'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <h6
                                  className={`font-medium mb-2 text-sm ${
                                    request.status === 'approved'
                                      ? 'text-green-900'
                                      : 'text-red-900'
                                  }`}
                                >
                                  Admin Response:
                                </h6>
                                <p
                                  className={`text-sm ${
                                    request.status === 'approved'
                                      ? 'text-green-800'
                                      : 'text-red-800'
                                  }`}
                                >
                                  {request.reviewNotes}
                                </p>
                                {request.expiryDate && request.status === 'approved' && (
                                  <p className="text-green-600 text-xs mt-2">
                                    ⏰ Access expires: {formatDate(request.expiryDate)}
                                  </p>
                                )}
                              </div>
                            )}

                            {request.status === 'approved' && (
                              <div className="mt-4">
                                <button
                                  onClick={() => {
                                    const patient = allPatients.find(
                                      p => p.patientId === request.patientId
                                    );
                                    if (patient) handleViewPatientDetails(patient);
                                  }}
                                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                                >
                                  👁️ View Patient Records
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PENDING AI REVIEWS TAB */}
          {activeTab === 'pending' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Pending AI Reviews</h3>
                <div className="text-sm text-gray-500">
                  {pendingAnalyses.length} analyses requiring physician review
                </div>
              </div>

              {pendingAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">All Clear!</h4>
                  <p className="text-gray-600">No pending AI reviews at this time.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingAnalyses.map(analysis => (
                    <div key={analysis.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {analysis.patientName}
                          </h4>
                          <p className="text-gray-600">Patient ID: {analysis.patientId}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {analysis.scanType}
                            </span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {formatDate(analysis.scanDate)}
                            </span>
                            <span
                              className={`px-3 py-1 ${analysis.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'} rounded-full text-xs`}
                            >
                              {analysis.priority === 'urgent' ? '🚨 URGENT' : '⚠️ High Priority'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {analysis.aiConfidence}%
                          </div>
                          <div className="text-gray-500 text-sm">AI Confidence</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h5 className="font-medium text-gray-900 mb-2">AI Recommendation:</h5>
                        <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                          {analysis.aiRecommendation}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => handleOverrideAI(analysis.patientId, 'confirm')}
                          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center"
                        >
                          <span className="mr-2">✅</span>
                          Confirm AI Analysis
                        </button>
                        <button
                          onClick={() => handleOverrideAI(analysis.patientId, 'reject')}
                          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 flex items-center justify-center"
                        >
                          <span className="mr-2">❌</span>
                          Reject AI Analysis
                        </button>
                        <button
                          onClick={() => {
                            const patient = myPatients.find(
                              p => p.patientId === analysis.patientId
                            );
                            if (patient) handleViewPatientDetails(patient);
                          }}
                          className="flex-1 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 flex items-center justify-center"
                        >
                          <span className="mr-2">👁️</span>
                          Full Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Medical Analytics</h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">AI Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Accuracy Rate</span>
                        <span className="font-bold">98.7%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: '98.7%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Doctor Override Rate</span>
                        <span className="font-bold">3.2%</span>
                      </div>
                      <div className="w-full bg-green-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '3.2%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Average Review Time</span>
                        <span className="font-bold">24 hours</span>
                      </div>
                      <div className="w-full bg-yellow-100 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Patient Distribution</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">By Risk Level</span>
                        <span className="text-sm text-gray-500">{myPatients.length} patients</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Low Risk</span>
                            <span>{myPatients.filter(p => p.riskLevel === 'Low').length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width:
                                  myPatients.length > 0
                                    ? `${(myPatients.filter(p => p.riskLevel === 'Low').length / myPatients.length) * 100}%`
                                    : '0%',
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Medium Risk</span>
                            <span>{myPatients.filter(p => p.riskLevel === 'Medium').length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{
                                width:
                                  myPatients.length > 0
                                    ? `${(myPatients.filter(p => p.riskLevel === 'Medium').length / myPatients.length) * 100}%`
                                    : '0%',
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>High Risk</span>
                            <span>{myPatients.filter(p => p.riskLevel === 'High').length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width:
                                  myPatients.length > 0
                                    ? `${(myPatients.filter(p => p.riskLevel === 'High').length / myPatients.length) * 100}%`
                                    : '0%',
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">AI-Assisted Medical Review + Access Control</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            AI analysis supports clinician review with secure access controls while protecting
            patient privacy. Final clinical decisions remain with the care team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('pending')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50"
            >
              Review Pending Cases
            </button>
            <button
              onClick={() => setActiveTab('all_patients')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10"
            >
              View All Patients
            </button>
          </div>
        </div>
      </main>

      {/* 🔥 PATIENT DETAILS MODAL */}
      {showPatientDetailsModal && patientDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Patient Details</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete medical record & scan history
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPatientDetailsModal(false);
                    setPatientDetails(null);
                    setPatientScans([]);
                    setAccessInfo(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Access Status Banner */}
              {accessInfo && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    accessInfo.reason === 'primary_doctor'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {accessInfo.reason === 'primary_doctor' ? '👨‍⚕️' : '⏰'}
                    </span>
                    <div>
                      <p
                        className={`font-bold ${
                          accessInfo.reason === 'primary_doctor'
                            ? 'text-blue-800'
                            : 'text-yellow-800'
                        }`}
                      >
                        {accessInfo.message}
                      </p>
                      {accessInfo.expiryDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          Access expires: {formatDate(accessInfo.expiryDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Information Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info Card */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">👤</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Basic Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{patientDetails.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-medium">{patientDetails.patientId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{patientDetails.age} years</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Primary Doctor:</span>
                      <span className="font-medium">{patientDetails.assignedDoctorName}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info Card */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600">📞</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Contact Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{patientDetails.phone}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-sm">{patientDetails.email}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="font-medium">{formatDate(patientDetails.lastVisit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mb-6 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600">🏥</span>
                  </div>
                  <h4 className="font-bold text-gray-900">Medical Information</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {patientDetails.medicalInfo && typeof patientDetails.medicalInfo === 'object' ? (
                    <div className="space-y-3">
                      {patientDetails.medicalInfo.bloodType && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Blood Type:</span>
                          <span className="text-gray-900">
                            {patientDetails.medicalInfo.bloodType}
                          </span>
                        </div>
                      )}
                      {patientDetails.medicalInfo.allergies && (
                        <div className="py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium block mb-1">Allergies:</span>
                          <span className="text-gray-900">
                            {patientDetails.medicalInfo.allergies}
                          </span>
                        </div>
                      )}
                      {patientDetails.medicalInfo.medications && (
                        <div className="py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium block mb-1">
                            Current Medications:
                          </span>
                          <span className="text-gray-900">
                            {patientDetails.medicalInfo.medications}
                          </span>
                        </div>
                      )}
                      {patientDetails.medicalInfo.bmi && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">BMI:</span>
                          <span className="text-gray-900">{patientDetails.medicalInfo.bmi}</span>
                        </div>
                      )}
                      {patientDetails.medicalInfo.familyHistory && (
                        <div className="py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium block mb-1">
                            Family History:
                          </span>
                          <span className="text-gray-900">
                            {patientDetails.medicalInfo.familyHistory}
                          </span>
                        </div>
                      )}
                      {patientDetails.medicalInfo.ageGroup && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600 font-medium">Age Group:</span>
                          <span className="text-gray-900">
                            {patientDetails.medicalInfo.ageGroup}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-700">
                      {patientDetails.medicalInfo || 'No additional medical information available.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Scan History */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-orange-600">📊</span>
                  </div>
                  <h4 className="font-bold text-gray-900">Scan History</h4>
                  <span className="ml-auto text-sm text-gray-500">
                    {patientScans.length} total scans
                  </span>
                </div>

                {patientScans.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No scan history available</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {patientScans.map(scan => (
                      <div
                        key={scan.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-bold text-gray-900">{scan.scanType}</h5>
                            <p className="text-sm text-gray-600">{formatDate(scan.date)}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getScanResultColor(scan.result)}`}
                          >
                            {scan.result}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-xs text-gray-600">AI Confidence:</span>
                            <span className="ml-2 font-medium">{scan.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Status:</span>
                            <span className="ml-2 font-medium">{scan.status}</span>
                          </div>
                        </div>
                        {scan.doctorReview && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Doctor Review:</p>
                            <p className="text-sm text-gray-700">{scan.doctorReview}</p>
                          </div>
                        )}
                        {scan.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Notes:</strong> {scan.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPatientDetailsModal(false);
                    setPatientDetails(null);
                    setPatientScans([]);
                    setAccessInfo(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPatientDetailsModal(false);
                    handleMessagePatient(patientDetails);
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                >
                  💬 Message Patient
                </button>
                <button
                  onClick={() => {
                    setShowPatientDetailsModal(false);
                    navigate('/results', {
                      state: {
                        patientId: patientDetails.patientId,
                      },
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  📊 View Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST ACCESS MODAL */}
      {showRequestModal && requestPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Patient Access</h3>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-gray-900">Patient: {requestPatient.name}</p>
              <p className="text-sm text-gray-600">ID: {requestPatient.patientId}</p>
              <p className="text-sm text-gray-600">
                Primary Doctor: {requestPatient.primaryDoctor}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Access Request *
              </label>
              <textarea
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Please provide a detailed reason for requesting access to this patient's records (e.g., consultation needed, second opinion, specialist referral)..."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Your request will be sent to the admin for approval. Include specific medical
                reasons for best results.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestReason('');
                  setRequestPatient(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAccess}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Noura AI Doctor Dashboard. Medical data protected under HIPAA regulations.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            For urgent medical inquiries: +20 100 000 0000 • Emergency contact available 24/7
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="text-xs text-gray-500">AES-256 Encryption</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">Access Control System</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">HIPAA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DoctorDashboard;
