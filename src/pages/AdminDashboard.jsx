import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureGetItem, secureClearAll } from '../utils/securityUtils';
import { endCurrentSession, fetchAuditLogs } from '../utils/analyticsService';
import {
  approveAccessRequest,
  rejectAccessRequest,
  getAllAccessRequests,
  getDoctorById,
  getPatientById,
} from '../utils/dataStore';
import { authAPI } from '../utils/api';
import { logger } from '../utils/logger';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [accessRequests, setAccessRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // 🔥 NEW: Detailed Request View Modal
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'patient',
    idPrefix: 'PT-',
    status: 'active',
  });

  // Admin info from secure storage
  const getAdminInfo = () => {
    const userData = secureGetItem('user');
    return {
      name: userData?.name || 'مدير النظام',
      id: userData?.userId || userData?.id || 'AD-2026-001',
    };
  };

  const { name: adminName, id: adminId } = getAdminInfo();

  // ==================== SAMPLE DATA ====================
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [loadedUsers, requests] = await Promise.all([
          authAPI.getUsers(),
          getAllAccessRequests(),
        ]);
        setUsers(loadedUsers);
        setAccessRequests(requests);
        const logs = await fetchAuditLogs();
        setSecurityLogs(
          logs.slice(0, 20).map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            event: log.action || 'Unknown Event',
            user: log.userId || 'unknown',
            ip: log.ip || '0.0.0.0',
            status: log.status || 'success',
            severity: getLogSeverity(log),
          }))
        );
      } catch (error) {
        logger.error('Error loading admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // ==================== SYSTEM STATS ====================
  const systemStats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: '👥',
      color: 'blue',
      change: '+3 this week',
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      icon: '✅',
      color: 'green',
      change: `${Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}% active`,
    },
    {
      label: 'Pending Requests',
      value: accessRequests.filter(r => r.status === 'pending').length,
      icon: '🔓',
      color: 'yellow',
      change:
        accessRequests.filter(r => r.status === 'pending').length > 0
          ? 'Needs review'
          : 'All clear',
    },
    {
      label: 'System Uptime',
      value: '99.9%',
      icon: '🖥️',
      color: 'orange',
      change: 'Last 30 days',
    },
  ];

  // ==================== SECURITY LOGS ====================
  // ==================== FUNCTIONS ====================
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = dateTimeString => {
    return new Date(dateTimeString.replace(' ', 'T')).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 🔥 NEW: View Request Details
  const handleViewRequestDetails = async request => {
    logger.debug('Viewing request details:', request);

    // جيب تفاصيل الدكتور والمريض
    const [doctor, patient] = await Promise.all([
      getDoctorById(request.requestingDoctorId),
      getPatientById(request.patientId),
    ]);

    setRequestDetails({
      ...request,
      doctorDetails: doctor,
      patientDetails: patient,
    });

    setShowRequestDetailsModal(true);
  };

  const handleApproveRequest = request => {
    setSelectedRequest(request);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleConfirmApprove = async () => {
    const result = await approveAccessRequest(
      selectedRequest.id,
      adminId,
      reviewNotes || 'Approved by admin'
    );

    if (result.success) {
      alert(
        `✅ Access Approved!\n\nDoctor ${selectedRequest.requestingDoctorName} now has access to patient ${selectedRequest.patientName}\n\nAccess expires: ${formatDate(result.expiryDate)}`
      );

      // Refresh requests
      const updatedRequests = await getAllAccessRequests();
      setAccessRequests(updatedRequests);

      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewNotes('');
    } else {
      alert(`❌ Error: ${result.message}`);
    }
  };

  const handleRejectRequest = async request => {
    const reason = window.prompt('Please provide a reason for rejection:');

    if (reason) {
      const result = await rejectAccessRequest(request.id, adminId, reason);

      if (result.success) {
        alert(
          `✅ Access Request Rejected\n\nDoctor ${request.requestingDoctorName}'s request has been rejected.`
        );

        // Refresh requests
        const updatedRequests = await getAllAccessRequests();
        setAccessRequests(updatedRequests);
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    }
  };

  const handleAddUser = () => {
    alert(
      'User creation is not connected to the backend yet. Add this endpoint first before enabling provisioning.'
    );
  };

  const handleUpdateUserStatus = (userId, newStatus) => {
    alert(
      `Updating user status for ${userId} to ${newStatus} is not supported by the backend yet.`
    );
  };

  const handleResetPassword = userId => {
    alert(`Password reset for ${userId} is not connected to the backend yet.`);
  };

  const handleDeleteUser = userId => {
    alert(`Deleting ${userId} is not supported by the backend yet.`);
  };

  const getRoleColor = role => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'patient':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogSeverity = log => {
    if (log.status === 'failed') return 'high';
    if (String(log.action || '').includes('ACCESS')) return 'medium';
    return 'low';
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

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system data...</p>
          <p className="text-gray-400 text-sm mt-2">Admin Dashboard</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👑</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">
                  Welcome, {adminName} | ID: {adminId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                <span className="font-medium">Admin Privileges:</span> Full System Access
              </div>
              <button
                onClick={() => navigate('/analytics')}
                className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200"
                title="Open Analytics Dashboard"
              >
                Analytics
              </button>
              <button
                onClick={() => navigate('/recognition-dashboard')}
                className="px-3 py-1.5 text-sm bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 border border-cyan-200"
                title="Open Recognition Dashboard"
              >
                Recognition
              </button>
              <button
                onClick={() => navigate('/audit-logs')}
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200"
                title="Open Audit Logs"
              >
                Audit Logs
              </button>
              <button
                onClick={() => navigate('/team-management')}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200"
                title="Team Management"
              >
                Team Manage
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-purple-600"
                title="System Settings"
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
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">System Administration</h2>
                <p className="text-purple-100">
                  Full system control, user management, and access control
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">🔐 Full Access</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    👥 User Management
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    🔓 Access Control
                  </span>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="text-center">
                  <div className="text-4xl font-bold">🛡️</div>
                  <p className="text-sm mt-2 text-purple-100">Security Level: Maximum</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat, index) => (
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
                            : 'bg-orange-100'
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
                          : 'bg-orange-100'
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
                            : 'bg-orange-500'
                    } rounded-full`}
                    style={{
                      width:
                        typeof stat.value === 'number'
                          ? `${Math.min(stat.value * 5, 100)}%`
                          : stat.value === '99.9%'
                            ? '99.9%'
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
                onClick={() => setActiveTab('requests')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'requests'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🔓 Access Requests ({accessRequests.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 User Management
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🛡️ Security Logs
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'system'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ System Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 🔥 Access Requests Tab (Default) */}
          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Access Requests Management</h3>
                  <p className="text-gray-600 text-sm">Review and manage doctor access requests</p>
                </div>
                <div className="text-sm text-gray-500">
                  {accessRequests.filter(r => r.status === 'pending').length} pending •{' '}
                  {accessRequests.length} total
                </div>
              </div>

              {accessRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔓</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No Access Requests</h4>
                  <p className="text-gray-600">No doctors have requested access to patients yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending Requests First */}
                  {accessRequests.filter(r => r.status === 'pending').length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">⏳ Pending Requests</h4>
                      {accessRequests
                        .filter(r => r.status === 'pending')
                        .map(request => (
                          <div
                            key={request.id}
                            className="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-6 mb-4"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 text-lg mb-2">
                                  {request.requestingDoctorName}
                                </h5>
                                <p className="text-gray-700 mb-1">
                                  <strong>Requesting access to:</strong> {request.patientName} (
                                  {request.patientId})
                                </p>
                                <p className="text-gray-700 mb-1">
                                  <strong>Primary Doctor:</strong> {request.primaryDoctorName}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  Requested: {formatDateTime(request.requestDate)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}
                              >
                                ⏳ Pending Review
                              </span>
                            </div>

                            <div className="mb-4 p-4 bg-white rounded-lg border border-yellow-200">
                              <h6 className="font-medium text-gray-900 mb-2 text-sm">Reason:</h6>
                              <p className="text-gray-700 text-sm">{request.reason}</p>
                            </div>

                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleViewRequestDetails(request)}
                                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center"
                              >
                                <span className="mr-2">👁️</span>
                                View Details
                              </button>
                              <button
                                onClick={() => handleApproveRequest(request)}
                                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center"
                              >
                                <span className="mr-2">✅</span>
                                Approve Access
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request)}
                                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 flex items-center justify-center"
                              >
                                <span className="mr-2">❌</span>
                                Reject Request
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Processed Requests */}
                  {accessRequests.filter(r => r.status !== 'pending').length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-gray-900 mb-4">📋 Request History</h4>
                      {accessRequests
                        .filter(r => r.status !== 'pending')
                        .map(request => (
                          <div key={request.id} className="border rounded-xl p-6 mb-4">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 mb-1">
                                  {request.requestingDoctorName}
                                </h5>
                                <p className="text-gray-700 text-sm mb-1">
                                  Patient: {request.patientName} ({request.patientId})
                                </p>
                                <p className="text-gray-600 text-sm">
                                  Requested: {formatDateTime(request.requestDate)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}
                              >
                                {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                              </span>
                            </div>

                            {request.reviewNotes && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700 text-sm">
                                  <strong>Admin Notes:</strong> {request.reviewNotes}
                                </p>
                                {request.expiryDate && request.status === 'approved' && (
                                  <p className="text-gray-600 text-xs mt-2">
                                    Access expires: {formatDate(request.expiryDate)}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="mt-4">
                              <button
                                onClick={() => handleViewRequestDetails(request)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                  <p className="text-gray-600 text-sm">Create and manage user accounts</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg flex items-center"
                  title="Provisioning API not implemented yet"
                >
                  <span className="mr-2">➕</span>
                  Add New User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">User ID</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Last Login</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">
                          {user.specialtyIcon && <span className="mr-2">{user.specialtyIcon}</span>}
                          {user.userId}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                          >
                            {user.role === 'doctor'
                              ? '👨‍⚕️ Doctor'
                              : user.role === 'nurse'
                                ? '💉 Nurse'
                                : user.role === 'admin'
                                  ? '👑 Admin'
                                  : '👤 Patient'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                          >
                            {user.status === 'active'
                              ? '✅ Active'
                              : user.status === 'inactive'
                                ? '⏸️ Inactive'
                                : user.status === 'pending'
                                  ? '⏳ Pending'
                                  : '🚫 Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatDate(user.lastLogin)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleUpdateUserStatus(
                                  user.userId,
                                  user.status === 'active' ? 'inactive' : 'active'
                                )
                              }
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.userId)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
                            >
                              Reset Pass
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.userId)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                              disabled={user.userId === adminId}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* User Summary */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-sm text-blue-600 font-medium mb-1">Doctors</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'doctor').length}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-sm text-green-600 font-medium mb-1">Nurses</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'nurse').length}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-sm text-purple-600 font-medium mb-1">Patients</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'patient').length}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="text-sm text-orange-600 font-medium mb-1">Admins</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Logs Tab */}
          {activeTab === 'security' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Security Audit Logs</h3>
                <button
                  onClick={() => alert('Exporting logs...')}
                  className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50"
                >
                  📥 Export Logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Event</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">IP Address</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map(log => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{log.event}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{log.user}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{log.ip}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              log.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status === 'success' ? '✅ Success' : '❌ Failed'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}
                          >
                            {log.severity === 'high'
                              ? '🔴 High'
                              : log.severity === 'medium'
                                ? '🟡 Medium'
                                : '🟢 Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">System Configuration</h3>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4">Security Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Access Request Auto-Expiry</div>
                        <div className="text-gray-600 text-sm">
                          Automatically expire approved access after specified days
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          defaultValue="30"
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                        />
                        <span className="text-gray-600 text-sm">days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Session Timeout</div>
                        <div className="text-gray-600 text-sm">Auto-logout after inactivity</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select className="border border-gray-300 rounded-lg px-3 py-2">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                          <option>4 hours</option>
                        </select>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">System Administration Complete Control</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Full access to user management, access control, security monitoring, and system
            configuration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('requests')}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50"
            >
              Review Access Requests
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10"
            >
              View Security Logs
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Noura AI Admin Dashboard. Restricted access - System Administrator only.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            All activities are logged for security auditing. Unauthorized access is prohibited.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="text-xs text-gray-500">🔐 Full System Access</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">📊 Audit Logging</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">🛡️ Security Level: Maximum</span>
          </div>
        </div>
      </footer>

      {/* 🔥 NEW: Request Details Modal */}
      {showRequestDetailsModal && requestDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Access Request Details</h3>
                  <p className="text-gray-600 text-sm mt-1">Complete request information</p>
                </div>
                <button
                  onClick={() => {
                    setShowRequestDetailsModal(false);
                    setRequestDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Request Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Doctor Info */}
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">
                        {requestDetails.doctorDetails?.specialtyIcon || '👨‍⚕️'}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900">Requesting Doctor</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{requestDetails.requestingDoctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{requestDetails.requestingDoctorId}</span>
                    </div>
                    {requestDetails.doctorDetails && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialty:</span>
                          <span className="font-medium">
                            {requestDetails.doctorDetails.specialtyName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">
                            {requestDetails.doctorDetails.department}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Patient Info */}
                <div className="border border-green-200 bg-green-50 rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600">👤</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Patient</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{requestDetails.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{requestDetails.patientId}</span>
                    </div>
                    {requestDetails.patientDetails && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">
                            {requestDetails.patientDetails.age} years
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Doctor:</span>
                          <span className="font-medium">{requestDetails.primaryDoctorName}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="mb-6 border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-900 mb-3">Request Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium">
                      {formatDateTime(requestDetails.requestDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(requestDetails.status)}`}
                    >
                      {requestDetails.status === 'pending' && '⏳ Pending'}
                      {requestDetails.status === 'approved' && '✅ Approved'}
                      {requestDetails.status === 'rejected' && '❌ Rejected'}
                    </span>
                  </div>
                  {requestDetails.expiryDate && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Access Expires:</span>
                      <span className="font-medium">{formatDate(requestDetails.expiryDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="mb-6 border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-900 mb-3">Reason for Access Request</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{requestDetails.reason}</p>
                </div>
              </div>

              {/* Admin Review (if exists) */}
              {requestDetails.reviewNotes && (
                <div className="mb-6 border border-purple-200 bg-purple-50 rounded-xl p-5">
                  <h4 className="font-bold text-purple-900 mb-3">Admin Review</h4>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-700">{requestDetails.reviewNotes}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Reviewed by: {requestDetails.reviewedBy || 'Admin'} on{' '}
                      {formatDate(requestDetails.reviewDate)}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowRequestDetailsModal(false);
                    setRequestDetails(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                {requestDetails.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowRequestDetailsModal(false);
                        handleApproveRequest(requestDetails);
                      }}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowRequestDetailsModal(false);
                        handleRejectRequest(requestDetails);
                      }}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
                    >
                      ❌ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter user's full name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="patient">👤 Patient</option>
                    <option value="doctor">👨‍⚕️ Doctor</option>
                    <option value="nurse">💉 Nurse</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Initial Status
                  </label>
                  <select
                    value={newUser.status}
                    onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">✅ Active</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="inactive">⏸️ Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Access Request</h3>

            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-gray-900 mb-1">
                Doctor: {selectedRequest.requestingDoctorName}
              </p>
              <p className="text-sm text-gray-700 mb-1">Patient: {selectedRequest.patientName}</p>
              <p className="text-sm text-gray-600">Access will expire in 30 days</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Add any notes about this approval..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
              >
                ✅ Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
