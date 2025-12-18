import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Users,
  Network,
  Lock,
  Zap,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import type { DashboardStats, TimeSeriesData } from '@/types';

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

function MetricCard({ title, value, change, icon, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="metric-card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <h3 className="metric-value mt-2">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`metric-change ${trend === 'up' ? 'positive' : 'negative'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Time Range Selector
interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges = [
    { label: '1H', value: '1h' },
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
  ];

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === range.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

// Alert Trends Chart Component (placeholder structure)
function AlertTrendsChart({ data }: { data: TimeSeriesData[] }) {
  return (
    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
      <div className="text-center">
        <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Chart visualization would render here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.length} data points
        </p>
      </div>
    </div>
  );
}

// Threat Distribution Chart Component (placeholder structure)
function ThreatDistributionChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
      <div className="text-center">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Pie chart visualization would render here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.length} threat types
        </p>
      </div>
    </div>
  );
}

// Recent Activity List
function RecentActivityList({ activities }: { activities: any[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      case 'threat':
        return <Shield className="w-4 h-4" />;
      case 'block':
        return <Lock className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="empty-state py-8">
          <Activity className="empty-state-icon" />
          <p className="empty-state-title">No recent activity</p>
          <p className="empty-state-description">
            Activity will appear here as events occur
          </p>
        </div>
      ) : (
        <div className="timeline">
          {activities.map((activity) => (
            <div key={activity.id} className="timeline-item">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    {activity.user && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {activity.user}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Top Threats Table
function TopThreatsTable({ threats }: { threats: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Threat</th>
            <th>Count</th>
            <th>Severity</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {threats.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No threats detected</p>
              </td>
            </tr>
          ) : (
            threats.map((threat, index) => (
              <tr key={index}>
                <td className="font-medium">{threat.name}</td>
                <td>
                  <span className="badge badge-primary">{threat.count}</span>
                </td>
                <td>
                  <span className={`badge badge-${threat.severity === 'critical' ? 'danger' : threat.severity === 'high' ? 'warning' : 'info'}`}>
                    {threat.severity}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    {threat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    )}
                    <span className={threat.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                      {threat.trend}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const {
    stats,
    recentActivity,
    isLoading,
    error,
    timeRange,
    autoRefresh,
    refreshInterval,
    fetchStats,
    fetchRecentActivity,
    setTimeRange,
    setAutoRefresh,
    refresh,
  } = useDashboardStore();

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket(true, {
    onMessage: (message) => {
      if (message.type === 'stats') {
        // Refresh dashboard stats when stats update is received
        refresh();
      }
    },
  });

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Manual refresh handler
  const handleRefresh = async () => {
    await refresh();
    setLastRefresh(new Date());
  };

  // Export data handler
  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting dashboard data...');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time security monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-muted rounded-lg hover:bg-muted/80"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Time Range Selector */}
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Alerts"
          value={stats?.totalAlerts || 0}
          change={12}
          trend="up"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="yellow"
        />
        <MetricCard
          title="Critical Alerts"
          value={stats?.criticalAlerts || 0}
          change={5}
          trend="down"
          icon={<Shield className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Active Threats"
          value={stats?.activeThreats || 0}
          change={8}
          trend="up"
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Blocked Connections"
          value={stats?.blockedConnections || 0}
          change={15}
          trend="up"
          icon={<Lock className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Trends */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Alert Trends</h2>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <AlertTrendsChart data={stats?.alertTrends || []} />
        </div>

        {/* Threat Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Threat Distribution</h2>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <ThreatDistributionChart data={stats?.threatDistribution || []} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Threats */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Top Threats</h2>
          <TopThreatsTable threats={stats?.topThreats || []} />
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            <RecentActivityList activities={recentActivity} />
          </div>
        </div>
      </div>

      {/* System Health */}
      {stats?.systemHealth && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm font-medium">{stats.systemHealth.cpu}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${stats.systemHealth.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Memory Usage</span>
                <span className="text-sm font-medium">{stats.systemHealth.memory}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.systemHealth.memory}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Disk Usage</span>
                <span className="text-sm font-medium">{stats.systemHealth.disk}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.systemHealth.disk}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
