// HSB SDP Central API Client
const API_BASE = '/api/v1';

const API = {
  getToken() {
    return localStorage.getItem('hsb_sdp_token');
  },
  
  getUser() {
    const u = localStorage.getItem('hsb_sdp_user');
    return u ? JSON.parse(u) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('hsb_sdp_token', token);
    localStorage.setItem('hsb_sdp_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('hsb_sdp_token');
    localStorage.removeItem('hsb_sdp_user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = options.headers || {};

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.clearAuth();
        if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('index.html')) {
          window.location.href = '/';
        }
        throw new Error('Session expired or unauthorized. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setAuth(data.access_token, data);
    return data;
  },

  async getMe() {
    return await this.request('/auth/me');
  },

  logout() {
    this.clearAuth();
    window.location.href = '/';
  },

  // Periods
  async getPeriods(year, month) {
    let q = '';
    if (year && month) q = `?year=${year}&month=${month}`;
    return await this.request(`/periods${q}`);
  },

  async getCurrentPeriod() {
    return await this.request('/periods/current');
  },

  // Student methods
  async getStudentPeriodsOverview(year, month) {
    let q = '';
    if (year && month) q = `?year=${year}&month=${month}`;
    return await this.request(`/student/periods-overview${q}`);
  },

  async getPeriodEvaluation(periodId) {
    return await this.request(`/student/periods/${periodId}/evaluation`);
  },

  async getMyRecords(periodId, attributeType) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (attributeType) params.append('attribute_type', attributeType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/student/records${qs}`);
  },

  async createRecord(payload) {
    return await this.request('/student/records', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateRecord(recordId, payload) {
    return await this.request(`/student/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteRecord(recordId) {
    return await this.request(`/student/records/${recordId}`, {
      method: 'DELETE'
    });
  },

  async getStudentHistory() {
    return await this.request('/student/history');
  },

  // Management methods
  async getBatchOverview(periodId, mentor) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (mentor) params.append('mentor', mentor);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/management/overview${qs}`);
  },

  async getManagementStudents(filters = {}) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, v);
      }
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/management/students${qs}`);
  },

  async getStudentDrilldown(studentId, periodId) {
    let q = '';
    if (periodId) q = `?period_id=${periodId}`;
    return await this.request(`/management/students/${studentId}${q}`);
  },

  async getAttributeAnalysis(attribute, periodId) {
    const params = new URLSearchParams({ attribute });
    if (periodId) params.append('period_id', periodId);
    return await this.request(`/management/attribute-analysis?${params.toString()}`);
  },

  async approveDeadlineRevision(recordId, newDeadline, reason) {
    return await this.request('/management/deadline-revisions', {
      method: 'POST',
      body: JSON.stringify({
        record_id: recordId,
        new_deadline: newDeadline,
        reason: reason
      })
    });
  },

  async manualStatusOverride(recordId, timelineStatus, reason) {
    return await this.request('/management/manual-override', {
      method: 'POST',
      body: JSON.stringify({
        record_id: recordId,
        timeline_status: timelineStatus,
        reason: reason
      })
    });
  },

  async getFollowUps(studentId, status) {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/management/follow-ups${qs}`);
  },

  async createFollowUp(payload) {
    return await this.request('/management/follow-ups', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateFollowUp(followUpId, payload) {
    return await this.request(`/management/follow-ups/${followUpId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async getAuditLogs(limit = 50) {
    return await this.request(`/management/audit-logs?limit=${limit}`);
  },

  getExcelExportUrl(periodId, mentor) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (mentor) params.append('mentor', mentor);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return `${API_BASE}/export/excel${qs}`;
  }
};
