import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Alert,
  Threat,
  NetworkInterface,
  NetworkStats,
  FirewallRule,
  BlockedConnection,
  DashboardStats,
  MLModel,
  ThreatPrediction,
  AnomalyDetection,
  SystemHealth,
  Settings,
  FilterOptions,
  ExportOptions,
} from '@/types';

// ============================================================================
// API Client Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const API_TIMEOUT = 30000;

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ============================================================================
  // Interceptors
  // ============================================================================

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data.data;
        this.setTokens(access_token, newRefreshToken);
        return access_token;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  private handleAuthError() {
    this.clearTokens();
    window.location.href = '/login';
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  private async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  private async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  private async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  private async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // ============================================================================
  // Authentication API
  // ============================================================================

  async login(email: string, password: string): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const response = await this.post<{ user: User; access_token: string; refresh_token: string }>('/auth/login', {
      email,
      password,
    });
    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async register(data: { email: string; password: string; name: string }): Promise<{ user: User }> {
    return this.post('/auth/register', data);
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.get('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.put('/auth/profile', data);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
  }

  async resetPassword(email: string): Promise<void> {
    return this.post('/auth/reset-password', { email });
  }

  // ============================================================================
  // Alerts API
  // ============================================================================

  async getAlerts(filters?: FilterOptions): Promise<PaginatedResponse<Alert>> {
    return this.get('/alerts', { params: filters });
  }

  async getAlert(id: string): Promise<Alert> {
    return this.get(`/alerts/${id}`);
  }

  async createAlert(data: Partial<Alert>): Promise<Alert> {
    return this.post('/alerts', data);
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    return this.put(`/alerts/${id}`, data);
  }

  async deleteAlert(id: string): Promise<void> {
    return this.delete(`/alerts/${id}`);
  }

  async bulkUpdateAlerts(ids: string[], data: Partial<Alert>): Promise<void> {
    return this.post('/alerts/bulk-update', { ids, data });
  }

  async assignAlert(id: string, userId: string): Promise<Alert> {
    return this.post(`/alerts/${id}/assign`, { user_id: userId });
  }

  async resolveAlert(id: string, resolution: string): Promise<Alert> {
    return this.post(`/alerts/${id}/resolve`, { resolution });
  }

  async exportAlerts(options: ExportOptions): Promise<Blob> {
    const response = await this.client.post('/alerts/export', options, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ============================================================================
  // Threats API
  // ============================================================================

  async getThreats(filters?: FilterOptions): Promise<PaginatedResponse<Threat>> {
    return this.get('/threats', { params: filters });
  }

  async getThreat(id: string): Promise<Threat> {
    return this.get(`/threats/${id}`);
  }

  async analyzeThreat(data: any): Promise<ThreatPrediction> {
    return this.post('/threats/analyze', data);
  }

  async getTopThreats(limit: number = 10): Promise<Threat[]> {
    return this.get('/threats/top', { params: { limit } });
  }

  async getThreatTimeline(id: string): Promise<any[]> {
    return this.get(`/threats/${id}/timeline`);
  }

  // ============================================================================
  // Network API
  // ============================================================================

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    return this.get('/network/interfaces');
  }

  async getNetworkInterface(id: string): Promise<NetworkInterface> {
    return this.get(`/network/interfaces/${id}`);
  }

  async startMonitoring(interfaceId: string): Promise<void> {
    return this.post(`/network/interfaces/${interfaceId}/start`);
  }

  async stopMonitoring(interfaceId: string): Promise<void> {
    return this.post(`/network/interfaces/${interfaceId}/stop`);
  }

  async getNetworkStats(interfaceId: string, timeRange?: string): Promise<NetworkStats[]> {
    return this.get(`/network/interfaces/${interfaceId}/stats`, {
      params: { time_range: timeRange },
    });
  }

  async getNetworkTraffic(timeRange?: string): Promise<any> {
    return this.get('/network/traffic', { params: { time_range: timeRange } });
  }

  async getPacketCaptures(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/network/packets', { params: filters });
  }

  // ============================================================================
  // Firewall API
  // ============================================================================

  async getFirewallRules(filters?: FilterOptions): Promise<PaginatedResponse<FirewallRule>> {
    return this.get('/firewall/rules', { params: filters });
  }

  async getFirewallRule(id: string): Promise<FirewallRule> {
    return this.get(`/firewall/rules/${id}`);
  }

  async createFirewallRule(data: Partial<FirewallRule>): Promise<FirewallRule> {
    return this.post('/firewall/rules', data);
  }

  async updateFirewallRule(id: string, data: Partial<FirewallRule>): Promise<FirewallRule> {
    return this.put(`/firewall/rules/${id}`, data);
  }

  async deleteFirewallRule(id: string): Promise<void> {
    return this.delete(`/firewall/rules/${id}`);
  }

  async toggleFirewallRule(id: string, enabled: boolean): Promise<FirewallRule> {
    return this.patch(`/firewall/rules/${id}/toggle`, { enabled });
  }

  async reorderFirewallRules(ruleIds: string[]): Promise<void> {
    return this.post('/firewall/rules/reorder', { rule_ids: ruleIds });
  }

  async getBlockedConnections(filters?: FilterOptions): Promise<PaginatedResponse<BlockedConnection>> {
    return this.get('/firewall/blocked', { params: filters });
  }

  async unblockIp(ip: string): Promise<void> {
    return this.post('/firewall/unblock', { ip });
  }

  // ============================================================================
  // Dashboard API
  // ============================================================================

  async getDashboardStats(timeRange?: string): Promise<DashboardStats> {
    return this.get('/dashboard/stats', { params: { time_range: timeRange } });
  }

  async getAlertTrends(timeRange?: string): Promise<any[]> {
    return this.get('/dashboard/alert-trends', { params: { time_range: timeRange } });
  }

  async getThreatDistribution(): Promise<any[]> {
    return this.get('/dashboard/threat-distribution');
  }

  async getNetworkMetrics(timeRange?: string): Promise<any> {
    return this.get('/dashboard/network-metrics', { params: { time_range: timeRange } });
  }

  async getRecentActivity(limit: number = 20): Promise<any[]> {
    return this.get('/dashboard/recent-activity', { params: { limit } });
  }

  // ============================================================================
  // ML API
  // ============================================================================

  async getMLModels(): Promise<MLModel[]> {
    return this.get('/ml/models');
  }

  async getMLModel(id: string): Promise<MLModel> {
    return this.get(`/ml/models/${id}`);
  }

  async trainMLModel(modelId: string, data: any): Promise<void> {
    return this.post(`/ml/models/${modelId}/train`, data);
  }

  async predictThreat(data: any): Promise<ThreatPrediction> {
    return this.post('/ml/predict', data);
  }

  async detectAnomalies(data: any): Promise<AnomalyDetection[]> {
    return this.post('/ml/detect-anomalies', data);
  }

  async getModelMetrics(modelId: string): Promise<any> {
    return this.get(`/ml/models/${modelId}/metrics`);
  }

  // ============================================================================
  // System API
  // ============================================================================

  async getSystemHealth(): Promise<SystemHealth> {
    return this.get('/system/health');
  }

  async getSystemMetrics(timeRange?: string): Promise<any> {
    return this.get('/system/metrics', { params: { time_range: timeRange } });
  }

  async getSystemLogs(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/system/logs', { params: filters });
  }

  async restartService(serviceName: string): Promise<void> {
    return this.post(`/system/services/${serviceName}/restart`);
  }

  // ============================================================================
  // Users API
  // ============================================================================

  async getUsers(filters?: FilterOptions): Promise<PaginatedResponse<User>> {
    return this.get('/users', { params: filters });
  }

  async getUser(id: string): Promise<User> {
    return this.get(`/users/${id}`);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.post('/users', data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.put(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete(`/users/${id}`);
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    return this.patch(`/users/${id}/role`, { role });
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    return this.patch(`/users/${id}/permissions`, { permissions });
  }

  // ============================================================================
  // Settings API
  // ============================================================================

  async getSettings(): Promise<Settings> {
    return this.get('/settings');
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return this.put('/settings', data);
  }

  async getNotificationSettings(): Promise<any> {
    return this.get('/settings/notifications');
  }

  async updateNotificationSettings(data: any): Promise<any> {
    return this.put('/settings/notifications', data);
  }

  async testNotification(type: string, config: any): Promise<void> {
    return this.post('/settings/notifications/test', { type, config });
  }

  // ============================================================================
  // Reports API
  // ============================================================================

  async generateReport(type: string, options: any): Promise<Blob> {
    const response = await this.client.post(`/reports/${type}`, options, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getReportHistory(): Promise<any[]> {
    return this.get('/reports/history');
  }

  async scheduleReport(config: any): Promise<void> {
    return this.post('/reports/schedule', config);
  }

  // ============================================================================
  // Search API
  // ============================================================================

  async globalSearch(query: string): Promise<any> {
    return this.get('/search', { params: { q: query } });
  }

  async searchAlerts(query: string, filters?: FilterOptions): Promise<Alert[]> {
    return this.get('/search/alerts', { params: { q: query, ...filters } });
  }

  async searchThreats(query: string, filters?: FilterOptions): Promise<Threat[]> {
    return this.get('/search/threats', { params: { q: query, ...filters } });
  }

  // ============================================================================
  // Integrations API
  // ============================================================================

  async getIntegrations(): Promise<any[]> {
    return this.get('/integrations');
  }

  async testIntegration(type: string, config: any): Promise<any> {
    return this.post(`/integrations/${type}/test`, config);
  }

  async syncIntegration(type: string): Promise<void> {
    return this.post(`/integrations/${type}/sync`);
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const apiClient = new ApiClient();
export default apiClient;
