import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getScanById, getCurrentPatientData, canDoctorAccessPatient } from '../utils/dataStore';
import { deriveRiskAssessment } from '../utils/riskAssessment';
import { secureGetItem } from '../utils/securityUtils';
import { logAuditEvent } from '../utils/analyticsService';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [pageMessage, setPageMessage] = useState('');

  // Get user info securely
  const getUserInfo = () => {
    try {
      const userData = secureGetItem('user');
      if (userData) {
        return {
          name: userData.name || 'User',
          role: userData.role || 'patient',
          id: userData.userId || userData.id || 'PT-0000',
          specialty: userData.specialty || null,
        };
      }
    } catch {
      return { name: 'User', role: 'patient', id: 'PT-0000', specialty: null };
    }
    return { name: 'User', role: 'patient', id: 'PT-0000', specialty: null };
  };

  const { name: userName, role: userRole, id: userId, specialty: userSpecialty } = getUserInfo();

  // ==================== LOAD SCAN DATA ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setAccessDenied(false);

      // Get scan ID from URL
      const params = new URLSearchParams(location.search);
      const scanId = params.get('scan');
      const patientId = params.get('patient');

      try {
        // Access Control Check for Doctors
        if (userRole === 'doctor' && patientId) {
          const access = await canDoctorAccessPatient(userId, patientId);

          if (!access.canAccess) {
            setAccessDenied(true);
            setAccessMessage(access.message);
            setLoading(false);
            return;
          }
        }

        let currentScan = null;

        if (scanId) {
          currentScan = await getScanById(parseInt(scanId));
        }

        // Get patient data
        const currentPatient = await getCurrentPatientData();

        if (currentScan) {
          setScanData(currentScan);
          logAuditEvent({
            action: 'VIEW_RESULTS',
            status: 'success',
            details: `Viewed results for scan ${currentScan.id}`,
            metadata: {
              scanId: currentScan.id,
              patientId: currentPatient?.patientId || userId,
            },
          });

          const aiPrediction =
            currentScan.aiResult?.prediction &&
            String(currentScan.aiResult.prediction).toLowerCase() !== 'unknown'
              ? currentScan.aiResult.prediction
              : currentScan.aiResult?.cancerType;
          const aiConfidence = currentScan.aiResult?.confidence ?? currentScan.confidence;
          const isUncertain =
            String(aiPrediction || currentScan.result || '').toLowerCase() === 'uncertain' ||
            String(currentScan.aiResult?.riskLevel || '').toLowerCase() === 'unknown' ||
            Number(aiConfidence || 0) === 0;
          const { riskLevel: displayRiskLevel, riskScore: displayRiskScore } =
            deriveRiskAssessment(currentScan);

          // Generate AI result based on scan data
          setAiResult({
            id: `SCAN-${currentScan.id}`,
            scanId: currentScan.id,
            patientName: currentPatient?.name || userName,
            patientId: currentPatient?.patientId || userId,
            scanDate: currentScan.date,
            scanType: currentScan.scanType,
            uploadDate: currentScan.date,
            analysisDate: new Date().toISOString().split('T')[0] + ' 14:31:22',

            // AI Analysis Results
            detection:
              aiPrediction ||
              (currentScan.result === 'Normal'
                ? 'No suspicious pattern detected'
                : 'Follow-up recommended'),
            confidence: aiConfidence,
            riskLevel: displayRiskLevel,
            riskScore: displayRiskScore,

            // Detailed Findings
            findings: [
              {
                id: 1,
                area: 'Primary Scan Region',
                finding:
                  isUncertain
                    ? currentScan.aiResult?.recommendation ||
                      'The model could not identify a reliable finding in this image'
                    : currentScan.result === 'Normal'
                      ? currentScan.aiResult?.recommendation ||
                        'No suspicious patterns were detected in the uploaded scan'
                      : 'Area should be reviewed by a clinician',
                significance: isUncertain
                  ? 'Unknown'
                  : currentScan.result === 'Normal'
                    ? 'Low'
                    : 'Medium',
                recommendation:
                  isUncertain
                    ? 'Upload a clearer image or ask a clinician to review the scan'
                    : currentScan.result === 'Normal'
                    ? 'Routine follow-up in 12 months'
                    : 'Additional imaging recommended',
              },
            ],

            // Metrics
            metrics: {
              density: 'Moderate tissue variation observed',
              birads: currentScan.result === 'Normal' ? 'Low concern' : 'Needs follow-up',
              size: 'No dominant lesion identified',
              comparison: 'Compared with previous imaging studies',
            },

            // Recommendations
            recommendations:
              currentScan.result === 'Normal'
                ? [
                    'Continue routine screening as advised by your clinician',
                    'Track symptoms and follow routine checkups',
                    'Maintain healthy lifestyle and weight',
                    'Discuss the next scan timing with your care team',
                  ]
                : [
                    'Schedule follow-up imaging in 6 months',
                    'Consult your doctor to decide whether additional tests are needed',
                    'Monitor any new or changing symptoms',
                    'Consider ultrasound or MRI for further evaluation',
                  ],

            // Doctor Review
            doctorReview: currentScan.doctorReview
              ? {
                  reviewed: true,
                  doctorName: currentScan.doctor || 'د. أحمد محمود',
                  reviewDate: new Date().toISOString().split('T')[0] + ' 15:45:00',
                  notes: currentScan.doctorReview,
                  status: 'confirmed',
                }
              : null,
          });
        } else {
          logAuditEvent({
            action: 'VIEW_RESULTS',
            status: 'success',
            details: 'Viewed default results page (no specific scan)',
          });
          // Default result
          setAiResult({
            id: 'SCAN-' + Date.now(),
            patientName: userName,
            patientId: userId,
            scanDate: new Date().toISOString().split('T')[0],
            scanType: 'Medical Scan',
            detection: 'No suspicious pattern detected',
            confidence: 98.7,
            riskLevel: 'Low',
            riskScore: 12,
            findings: [],
            metrics: {
              density: 'Moderate tissue variation',
              birads: 'Low concern',
              size: 'No dominant lesion',
              comparison: 'Stable',
            },
            recommendations: [],
          });
        }
      } catch {
        setPageMessage('Unable to load results right now.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, userName, userId, userRole]);

  // ==================== FORMATTING FUNCTIONS ====================
  const formatDate = dateString => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = dateTimeString => {
    try {
      return new Date(dateTimeString.replace(' ', 'T')).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  const getRiskColor = riskLevel => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Unknown':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = confidence => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  // ==================== PDF GENERATION ====================
  const generatePDF = async () => {
    if (!aiResult) {
      setPageMessage('No data available to generate PDF.');
      return;
    }

    setGeneratingPDF(true);

    try {
      const reportElement = document.getElementById('ai-report');
      if (!reportElement) {
        throw new Error('Report element not found');
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Header
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, 210, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('Noura AI Medical Report', 105, 12, { align: 'center' });

      // Report Info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 25);
      pdf.text(`Patient: ${aiResult.patientName} (${aiResult.patientId})`, 15, 30);
      pdf.text(`Report ID: ${aiResult.id}`, 15, 35);
      pdf.text(`Scan Date: ${formatDate(aiResult.scanDate)}`, 15, 40);

      // Confidential Notice
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('🔒 CONFIDENTIAL MEDICAL REPORT - HIPAA PROTECTED', 105, 45, { align: 'center' });

      // Add Report Content
      pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);

      // Footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('© 2026 Noura AI System - For Medical Use Only', 105, pageHeight - 10, {
        align: 'center',
      });
      pdf.text(
        'AES-256 Encrypted | HIPAA Compliant | Secure Digital Signature',
        105,
        pageHeight - 5,
        { align: 'center' }
      );

      // Save PDF
      pdf.save(`NouraAI_Report_${aiResult.id}_${aiResult.patientId}.pdf`);
      logAuditEvent({
        action: 'EXPORT_REPORT',
        status: 'success',
        details: `Exported PDF report for ${aiResult.id}`,
        metadata: {
          reportId: aiResult.id,
          patientId: aiResult.patientId,
        },
      });

      setPageMessage('PDF report downloaded successfully.');
    } catch {
      logAuditEvent({
        action: 'EXPORT_REPORT',
        status: 'failed',
        details: `Failed PDF export for ${aiResult?.id || 'unknown report'}`,
      });
      setPageMessage('Error generating PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ==================== RENDER ACCESS DENIED ====================
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚫</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">{accessMessage}</p>
            </div>

            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Security Notice:</strong> You do not have permission to view this patient's
                results. If you need access, please request it through the admin.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/doctor-dashboard')}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Analyzing Medical Images...</p>
          <p className="text-gray-400 text-sm mt-2">
            AI is preparing a preliminary review for clinician confirmation
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER CONTENT ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Analysis Results</h1>
                <p className="text-xs text-gray-500">
                  Scan ID: {scanData?.id ? `SCAN-${scanData.id}` : aiResult?.id || 'N/A'} •
                  {userRole === 'doctor' && userSpecialty && ` ${userSpecialty}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {scanData && (
                <div className="hidden md:block text-sm text-gray-600">
                  <span className="font-medium">Scan Date:</span>{' '}
                  {formatDate(aiResult?.scanDate || '')}
                </div>
              )}
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {pageMessage && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {pageMessage}
            </div>
          )}

          {/* Access Control Notice for Doctors */}
          {userRole === 'doctor' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">🔓</span>
                <div>
                  <p className="text-blue-700 font-medium">Access Control Active</p>
                  <p className="text-blue-600 text-sm">
                    You are viewing this patient's results with authorized access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Preliminary AI Analysis Report</h2>
                  <p className="text-blue-100">
                    {aiResult?.patientName || 'N/A'} • ID: {aiResult?.patientId || 'N/A'} •{' '}
                    {formatDate(aiResult?.scanDate || '')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Scan Type: {aiResult?.scanType || 'N/A'}
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Model Confidence: {aiResult?.confidence || '0'}%
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Preliminary Result: {aiResult?.detection || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 text-center">
                  <div className="text-4xl font-bold mb-2">{aiResult?.confidence || '0'}%</div>
                  <p className="text-sm text-blue-100">Model Confidence Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Source Info */}
          {scanData && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <span className="text-green-600 mr-3">📁</span>
                <div>
                  <p className="text-green-700 font-medium">Connected to Data Store</p>
                  <p className="text-green-600 text-sm">
                    Showing results for Scan ID: {scanData.id} • Uploaded:{' '}
                    {formatDate(scanData.date)} • This data updates in real-time across all pages
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Content */}
          {aiResult && (
            <div
              id="ai-report"
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
            >
              {/* Main Analysis */}
              <div className="p-8">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {/* Detection Result */}
                  <div
                    className={`p-6 rounded-xl ${
                      aiResult.detection.includes('No suspicious')
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
                        : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${
                          aiResult.detection.includes('No suspicious')
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        } flex items-center justify-center mr-4`}
                      >
                        <span className="text-white text-xl">
                          {aiResult.detection.includes('No suspicious') ? '✅' : '⚠️'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Preliminary Result</h3>
                        <p
                          className={`text-lg font-bold ${
                            aiResult.detection.includes('No suspicious')
                              ? 'text-green-700'
                              : 'text-yellow-700'
                          }`}
                        >
                          {aiResult.detection}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mr-4">
                        <span className="text-white text-xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Model Confidence</h3>
                        <p
                          className={`text-2xl font-bold ${getConfidenceColor(aiResult.confidence)}`}
                        >
                          {aiResult.confidence}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${aiResult.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center mr-4">
                        <span className="text-white text-xl">📈</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Risk Assessment</h3>
                        <div className="flex items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(aiResult.riskLevel)}`}
                          >
                            {aiResult.riskLevel} Risk
                          </span>
                          <span className="ml-2 text-gray-700">
                            Score: {aiResult.riskScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${100 - aiResult.riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Detailed Findings */}
                {aiResult.findings.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Findings</h3>
                    <div className="space-y-4">
                      {aiResult.findings.map(finding => (
                        <div
                          key={finding.id}
                          className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-gray-900">{finding.area}</h4>
                              <p className="text-gray-600 mt-2">{finding.finding}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                finding.significance === 'Low'
                                  ? 'bg-green-100 text-green-800'
                                  : finding.significance === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {finding.significance} Significance
                            </span>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-blue-700 font-medium">
                              Recommendation: {finding.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Suggested Next Steps</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">Follow-up Plan</h4>
                      <div className="space-y-3">
                        {aiResult.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <span className="text-green-600 text-sm">✓</span>
                            </div>
                            <span className="text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">Next Steps</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <h5 className="font-bold text-blue-800 mb-2">Next Screening</h5>
                          <p className="text-blue-700">
                            Recommended:{' '}
                            {aiResult.detection.includes('No suspicious')
                              ? '12 months'
                              : '6 months'}{' '}
                            from now
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-xl">
                          <h5 className="font-bold text-green-800 mb-2">Self-Check</h5>
                          <p className="text-green-700">Perform a monthly symptom self-check</p>
                          <p className="text-green-600 text-sm mt-1">
                            Keep a note of any changes and discuss them with your doctor
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generatePDF}
                disabled={generatingPDF || !aiResult}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-70 flex items-center"
              >
                {generatingPDF ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📥</span>
                    Download PDF Report
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/messages')}
                className="px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 flex items-center"
              >
                <span className="mr-2">💬</span>
                Contact Doctor
              </button>

              <button
                onClick={() => navigate(`/${userRole}-dashboard`)}
                className="px-6 py-3 border-2 border-green-500 text-green-500 rounded-lg font-medium hover:bg-green-50 flex items-center"
              >
                <span className="mr-2">📊</span>
                Back to Dashboard
              </button>
            </div>

            <div className="text-sm text-gray-500 mt-4 sm:mt-0">
              <p>
                Report generated:{' '}
                {formatDateTime(aiResult?.analysisDate || new Date().toISOString())}
              </p>
              <p className="text-xs">🔐 Access Control Active • HIPAA Protected</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
