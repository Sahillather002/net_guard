// ============================================================================
// Core Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  permissions: Permission[];
}

export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  MANAGE_ALERTS = 'manage_alerts',
  MANAGE_FIREWALL = 'manage_firewall',
  MANAGE_USERS = 'manage_users',
  VIEW_LOGS = 'view_logs',
  EXPORT_DATA = 'export_data',
  MANAGE_SETTINGS = 'manage_settings',
}

// ============================================================================
// Alert Types
// ============================================================================

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  sourceIp: string;
  destinationIp?: string;
  port?: number;
  protocol?: string;
  timestamp: string;
  status: AlertStatus;
  assignedTo?: string;
  tags: string[];
  metadata: Record<string, any>;
  threatScore: number;
  recommendations: string[];
}

export enum AlertType {
  PORT_SCAN = 'port_scan',
  DDOS = 'ddos',
  MALWARE = 'malware',
  INTRUSION = 'intrusion',
  ANOMALY = 'anomaly',
  POLICY_VIOLATION = 'policy_violation',
  BRUTE_FORCE = 'brute_force',
  DATA_EXFILTRATION = 'data_exfiltration',
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum AlertStatus {
  NEW = 'new',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  IGNORED = 'ignored',
}

// ============================================================================
// Threat Types
// ============================================================================

export interface Threat {
  id: string;
  name: string;
  type: ThreatType;
  severity: AlertSeverity;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  sourceIps: string[];
  targetIps: string[];
  ports: number[];
  description: string;
  indicators: ThreatIndicator[];
  mitigations: string[];
  relatedAlerts: string[];
}

export enum ThreatType {
  MALWARE = 'malware',
  RANSOMWARE = 'ransomware',
  TROJAN = 'trojan',
  BOTNET = 'botnet',
  APT = 'apt',
  PHISHING = 'phishing',
  EXPLOIT = 'exploit',
  BACKDOOR = 'backdoor',
}

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  confidence: number;
}

// ============================================================================
// Network Types
// ============================================================================

export interface NetworkInterface {
  id: string;
  name: string;
  description: string;
  ipAddress: string;
  macAddress: string;
  status: 'up' | 'down';
  speed: number;
  type: 'ethernet' | 'wifi' | 'virtual';
  monitoring: boolean;
}

export interface NetworkStats {
  interfaceId: string;
  timestamp: string;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errorsIn: number;
  errorsOut: number;
  droppedIn: number;
  droppedOut: number;
}

export interface PacketCapture {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  size: number;
  flags: string[];
  payload?: string;
}

// ============================================================================
// Firewall Types
// ============================================================================

export interface FirewallRule {
  id: string;
  name: string;
  action: 'allow' | 'deny' | 'log';
  direction: 'inbound' | 'outbound' | 'both';
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  sourceIp?: string;
  sourcePort?: string;
  destinationIp?: string;
  destinationPort?: string;
  enabled: boolean;
  priority: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  hitCount: number;
}

export interface BlockedConnection {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: string;
  ruleId: string;
  ruleName: string;
  reason: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalAlerts: number;
  criticalAlerts: number;
  activeThreats: number;
  blockedConnections: number;
  networkTraffic: {
    inbound: number;
    outbound: number;
  };
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
  };
  alertTrends: TimeSeriesData[];
  threatDistribution: CategoryData[];
  topThreats: TopThreat[];
  topBlockedIps: TopBlockedIp[];
  recentActivity: Activity[];
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  category?: string;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface TopThreat {
  name: string;
  count: number;
  severity: AlertSeverity;
  trend: 'up' | 'down' | 'stable';
}

export interface TopBlockedIp {
  ip: string;
  count: number;
  country?: string;
  lastSeen: string;
  threatType: string;
}

export interface Activity {
  id: string;
  type: 'alert' | 'threat' | 'block' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: string;
  severity?: AlertSeverity;
  user?: string;
  icon?: string;
}

// ============================================================================
// ML Types
// ============================================================================

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'anomaly_detection' | 'prediction';
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainedAt: string;
  lastUsed: string;
  status: 'active' | 'training' | 'inactive';
  metrics: Record<string, number>;
}

export interface ThreatPrediction {
  threatType: ThreatType;
  probability: number;
  confidence: number;
  features: Record<string, number>;
  explanation: string;
}

export interface AnomalyDetection {
  id: string;
  timestamp: string;
  anomalyScore: number;
  features: Record<string, number>;
  isAnomaly: boolean;
  explanation: string;
}

// ============================================================================
// System Types
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealth[];
  metrics: SystemMetrics;
  alerts: number;
  uptime: number;
}

export interface ServiceHealth {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    connections: number;
  };
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  severity?: AlertSeverity[];
  type?: string[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WebSocketMessage {
  type: 'alert' | 'threat' | 'stats' | 'notification' | 'system';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// ============================================================================
// Settings Types
// ============================================================================

export interface Settings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  detection: DetectionSettings;
  integrations: IntegrationSettings;
}

export interface GeneralSettings {
  organizationName: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  timeFormat: string;
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  mfaEnabled: boolean;
  ipWhitelist: string[];
  apiRateLimit: number;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    recipients: string[];
    severityThreshold: AlertSeverity;
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
  };
  sms: {
    enabled: boolean;
    phoneNumbers: string[];
  };
  webhook: {
    enabled: boolean;
    url: string;
    headers: Record<string, string>;
  };
}

export interface DetectionSettings {
  portScanThreshold: number;
  ddosThreshold: number;
  anomalyThreshold: number;
  autoBlock: boolean;
  autoBlockDuration: number;
  whitelistedIps: string[];
  blacklistedIps: string[];
  mlEnabled: boolean;
  mlConfidenceThreshold: number;
}

export interface IntegrationSettings {
  siem: {
    enabled: boolean;
    type: 'splunk' | 'elastic' | 'qradar';
    url: string;
    apiKey: string;
  };
  threatIntel: {
    enabled: boolean;
    providers: string[];
    updateInterval: number;
  };
  ticketing: {
    enabled: boolean;
    type: 'jira' | 'servicenow';
    url: string;
    credentials: Record<string, string>;
  };
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  dateRange: {
    from: string;
    to: string;
  };
  includeFields: string[];
  filters: FilterOptions;
}
