import { API_BASE_URL, API_TIMEOUT_MS } from '../config/api';

const getToken = () => sessionStorage.getItem('auth_token');
const setToken = token => sessionStorage.setItem('auth_token', token);
const clearToken = () => sessionStorage.removeItem('auth_token');

const buildHeaders = (extraHeaders = {}) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

const parseJsonResponse = async response => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const fileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(options.headers),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      sessionStorage.removeItem('secure_user');
    }
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

const toUploadPayload = async formData => {
  if (!(formData instanceof FormData)) return formData;

  const file = formData.get('image');
  const payload = {
    patientId: formData.get('patientId') || null,
    scanType: formData.get('scanType') || 'Medical Scan',
    notes: formData.get('notes') || '',
    fileName: file?.name || 'scan',
    fileSize: file?.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '0 MB',
  };

  if (file) {
    payload.imageBase64 = await fileToBase64(file);
  }

  return payload;
};

export const authTokenStorage = {
  getToken,
  setToken,
  clearToken,
};

export const authAPI = {
  login: async (identifier, password, role) => {
    const data = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, userId: identifier, password, role }),
    });

    if (data?.token) setToken(data.token);
    return { token: data.token, ...data.user };
  },

  register: async userData => {
    const data = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData || {}),
    });
    return data;
  },

  getMe: async () => {
    const data = await request('/auth/me');
    return data.user;
  },

  logout: async () => {
    try {
      const data = await request('/auth/logout', { method: 'POST' });
      return data;
    } finally {
      clearToken();
    }
  },

  getUsers: async () => {
    const data = await request('/users');
    return data.users || [];
  },

  deleteUser: async id => {
    const data = await request(`/users/${id}`, { method: 'DELETE' });
    return data;
  },
};

export const patientsAPI = {
  getAll: async () => {
    const data = await request('/patients');
    return data.patients || [];
  },

  getById: async id => {
    const data = await request(`/patients/${id}`);
    return data.patient;
  },

  update: async (id, payload) => {
    const data = await request(`/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return data.patient;
  },

  getScans: async id => {
    const data = await request(`/patients/${id}/scans`);
    return data.scans || [];
  },

  getAccessRequests: async id => {
    const data = await request(`/patients/${id}/access-requests`);
    return data.requests || [];
  },
};

export const doctorsAPI = {
  getAll: async () => {
    const data = await request('/doctors');
    return data.doctors || [];
  },

  getById: async id => {
    const data = await request(`/doctors/${id}`);
    return data.doctor;
  },

  getPatients: async id => {
    const data = await request(`/doctors/${id}/patients`);
    return data.patients || [];
  },

  requestAccess: async (patientId, reason) => {
    const data = await request('/doctors/access-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, reason }),
    });
    return data.request;
  },

  getAccessRequests: async () => {
    const data = await request('/doctors/access-requests');
    return data.requests || [];
  },
};

export const accessRequestsAPI = {
  getAll: async () => {
    const data = await request('/access-requests');
    return data.requests || [];
  },

  review: async (id, status, reviewNotes = '') => {
    const data = await request(`/access-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes }),
    });
    return data.request;
  },
};

export const scansAPI = {
  getAll: async (params = {}) => {
    const search = new URLSearchParams();
    if (params.patientId) search.set('patientId', params.patientId);
    const suffix = search.toString() ? `?${search.toString()}` : '';
    const data = await request(`/scans${suffix}`);
    return data.scans || [];
  },

  getById: async id => {
    const data = await request(`/scans/${id}`);
    return data.scan;
  },

  upload: async formData => {
    const payload = await toUploadPayload(formData);
    const data = await request('/scans/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data;
  },

  update: async (id, payload) => {
    const data = await request(`/scans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return data.scan;
  },

  delete: async id => {
    const data = await request(`/scans/${id}`, { method: 'DELETE' });
    return data;
  },
};

export const messagesAPI = {
  getAll: async () => {
    const data = await request('/messages');
    return data.messages || [];
  },

  getConversation: async userId => {
    const data = await request(`/messages/${userId}`);
    return data.messages || [];
  },

  send: async (receiverId, content) => {
    const data = await request('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId, content }),
    });
    return data.message;
  },

  markAsRead: async id => {
    const data = await request(`/messages/${id}/read`, { method: 'POST' });
    return data.message;
  },

  delete: async id => {
    const data = await request(`/messages/${id}`, { method: 'DELETE' });
    return data;
  },
};

const api = {
  auth: authAPI,
  patients: patientsAPI,
  doctors: doctorsAPI,
  scans: scansAPI,
  messages: messagesAPI,
};

export default api;
