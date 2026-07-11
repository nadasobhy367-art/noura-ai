import { accessRequestsAPI, authAPI, doctorsAPI, patientsAPI, scansAPI } from './api';

const getSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('secure_user') || 'null');
  } catch {
    return null;
  }
};

const normalizePatient = patient => ({
  ...patient,
  patientId: patient?.patientId || patient?.userId || patient?.id,
});

const normalizeScan = scan => ({
  ...scan,
  id: scan?.id,
  patientId: scan?.patientId,
  aiConfidence: scan?.confidence,
  aiResult: scan?.aiResult || null,
  aiResultLabel: scan?.result,
});

export const getDoctorById = async doctorId => {
  try {
    return await doctorsAPI.getById(doctorId);
  } catch {
    return null;
  }
};

export const getDoctorsBySpecialty = async specialtyId => {
  const doctors = await doctorsAPI.getAll();
  return doctors.filter(doc => doc.specialty === specialtyId);
};

export const getAllDoctors = async () => doctorsAPI.getAll();

export const getNurseById = async nurseId => {
  const users = await authAPI.getUsers();
  return (
    users.find(user => user.role === 'nurse' && (user.id === nurseId || user.userId === nurseId)) ||
    null
  );
};

export const getAllNurses = async () => {
  const users = await authAPI.getUsers();
  return users.filter(user => user.role === 'nurse');
};

export const getNursesByDoctor = async doctorId => {
  const nurses = await getAllNurses();
  return nurses.filter(nurse => nurse.assignedDoctorId === doctorId);
};

export const getPatientById = async patientId => {
  try {
    const patient = await patientsAPI.getById(patientId);
    return normalizePatient(patient);
  } catch {
    return null;
  }
};

export const getPatientsByDoctor = async doctorId => {
  const patients = await doctorsAPI.getPatients(doctorId);
  return patients.map(normalizePatient);
};

export const getAllPatients = async () => {
  const patients = await patientsAPI.getAll();
  return patients.map(normalizePatient);
};

export const getCurrentPatientData = async () => {
  const user = getSessionUser();
  if (!user) return null;
  if (user.role !== 'patient') return normalizePatient(user);

  try {
    const patient = await patientsAPI.getById(user.userId || user.id);
    return normalizePatient(patient);
  } catch {
    return normalizePatient(user);
  }
};

export const getPatientScans = async (patientId = null) => {
  const user = getSessionUser();
  const effectivePatientId = patientId || user?.userId || user?.id || null;
  if (!effectivePatientId) return [];

  try {
    const scans = await patientsAPI.getScans(effectivePatientId);
    return scans.map(normalizeScan);
  } catch {
    return [];
  }
};

export const getPatientStats = async (patientId = null) => {
  const scans = await getPatientScans(patientId);
  if (!scans.length) {
    return {
      totalScans: 0,
      normalResults: 0,
      averageConfidence: 0,
    };
  }

  return {
    totalScans: scans.length,
    normalResults: scans.filter(scan => scan.result === 'Normal').length,
    averageConfidence: Math.round(
      scans.reduce((sum, scan) => sum + Number(scan.confidence || 0), 0) / scans.length
    ),
  };
};

export const getScanById = async scanId => {
  try {
    const scan = await scansAPI.getById(scanId);
    return normalizeScan(scan);
  } catch {
    return null;
  }
};

export const addNewScan = async scanData => {
  const user = getSessionUser();
  const patientId =
    scanData?.patientId || (user?.role === 'patient' ? user.userId || user.id : null);

  if (!patientId) {
    throw new Error('Please select a patient before uploading the scan.');
  }

  const response = await scansAPI.upload({
    ...scanData,
    patientId,
  });
  return response?.scan || response;
};

export const canDoctorAccessPatient = async (doctorId, patientId) => {
  try {
    const patient = await getPatientById(patientId);
    if (!patient) {
      return {
        canAccess: false,
        reason: 'patient_not_found',
        message: 'Patient not found',
      };
    }

    if (patient.assignedDoctorId === doctorId) {
      return {
        canAccess: true,
        reason: 'primary_doctor',
        message: 'You are the primary doctor for this patient',
      };
    }

    const requests = await doctorsAPI.getAccessRequests();
    const approvedRequest = requests.find(
      request =>
        request.patientId === patientId &&
        request.requestingDoctorId === doctorId &&
        request.status === 'approved' &&
        (!request.expiryDate || new Date(request.expiryDate) > new Date())
    );

    if (approvedRequest) {
      return {
        canAccess: true,
        reason: 'approved_access',
        message: `Temporary access granted until ${new Date(approvedRequest.expiryDate).toLocaleDateString()}`,
        expiryDate: approvedRequest.expiryDate,
      };
    }

    const pendingRequest = requests.find(
      request =>
        request.patientId === patientId &&
        request.requestingDoctorId === doctorId &&
        request.status === 'pending'
    );

    if (pendingRequest) {
      return {
        canAccess: false,
        reason: 'pending_request',
        message: 'Access request pending admin approval',
        requestId: pendingRequest.id,
      };
    }

    return {
      canAccess: false,
      reason: 'no_permission',
      message: 'You do not have permission to access this patient',
      primaryDoctor: patient.assignedDoctorName,
    };
  } catch {
    return {
      canAccess: false,
      reason: 'access_check_failed',
      message: 'Unable to verify access right now',
    };
  }
};

export const createAccessRequest = async (doctorId, patientId, reason) => {
  try {
    const request = await doctorsAPI.requestAccess(patientId, reason);
    return {
      success: true,
      message: 'Access request submitted successfully',
      requestId: request.id,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Unable to submit access request',
    };
  }
};

export const approveAccessRequest = async (requestId, adminId, notes = '') => {
  try {
    const request = await accessRequestsAPI.review(
      requestId,
      'approved',
      notes || `Approved by ${adminId}`
    );
    return {
      success: true,
      message: 'Access request approved',
      expiryDate: request.expiryDate,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Unable to approve request',
    };
  }
};

export const rejectAccessRequest = async (requestId, adminId, notes = '') => {
  try {
    await accessRequestsAPI.review(requestId, 'rejected', notes || `Rejected by ${adminId}`);
    return {
      success: true,
      message: 'Access request rejected',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Unable to reject request',
    };
  }
};

export const getPendingAccessRequests = async () => {
  const requests = await accessRequestsAPI.getAll();
  return requests.filter(request => request.status === 'pending');
};

export const getDoctorAccessRequests = async doctorId => {
  const requests = await doctorsAPI.getAccessRequests();
  return requests.filter(request => request.requestingDoctorId === doctorId);
};

export const getAllAccessRequests = async () => accessRequestsAPI.getAll();

export const getAllSpecialties = async () => [];

export const getSpecialtyById = async () => null;
