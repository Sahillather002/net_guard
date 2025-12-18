import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import type { Alert, PaginationParams, FilterOptions } from '@/types';
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeTime, getSeverityColor } from '@/lib/utils';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    severity: undefined,
    status: undefined,
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch alerts
  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PaginationParams & FilterOptions = {
        page: currentPage,
        limit: pageSize,
        sort_by: sortBy,
        order: sortOrder,
        ...filters,
      };

      const response = await apiClient.getAlerts(params);
      setAlerts(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotalItems(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch alerts');
      toast.error('Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [currentPage, sortBy, sortOrder, filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field: 'timestamp' | 'severity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle select alert
  const handleSelectAlert = (id: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAlerts(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map((a) => a.id)));
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: 'resolve' | 'delete' | 'assign') => {
    if (selectedAlerts.size === 0) {
      toast.warning('No alerts selected');
      return;
    }

    try {
      const alertIds = Array.from(selectedAlerts);
      
      switch (action) {
        case 'resolve':
          await Promise.all(
            alertIds.map((id) => apiClient.resolveAlert(id))
          );
          toast.success(`Resolved ${alertIds.length} alert(s)`);
          break;
        case 'delete':
          await Promise.all(
            alertIds.map((id) => apiClient.deleteAlert(id))
          );
          toast.success(`Deleted ${alertIds.length} alert(s)`);
          break;
        case 'assign':
          // Show assign dialog
          toast.info('Assign functionality coming soon');
          break;
      }

      setSelectedAlerts(new Set());
      fetchAlerts();
    } catch (err: any) {
      toast.error('Bulk action failed');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('Exporting alerts...');
      // Export functionality would be implemented here
    } catch (err: any) {
      toast.error('Export failed');
    }
  };

  // Get severity badge color
  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      info: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[severity.toLowerCase() as keyof typeof colors] || colors.info;
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status.toLowerCase() as keyof typeof colors] || colors.open;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor security alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={fetchAlerts}
            disabled={isLoading}
            className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search alerts..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={filters.severity || ''}
                onChange={(e) => handleFilterChange('severity', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg dark:bg-gray-800"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-border rounded-lg dark:bg-gray-800"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg dark:bg-gray-800"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedAlerts.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedAlerts.size} alert(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('resolve')}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Resolve
              </button>
              <button
                onClick={() => handleBulkAction('assign')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Assign
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchAlerts}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No alerts found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.size === alerts.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('severity')}
                        className="flex items-center gap-1 font-semibold hover:text-primary"
                      >
                        Severity
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Alert</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Source</th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('timestamp')}
                        className="flex items-center gap-1 font-semibold hover:text-primary"
                      >
                        Time
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-t border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.has(alert.id)}
                          onChange={() => handleSelectAlert(alert.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/alerts/${alert.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {alert.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {alert.source_ip || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(alert.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/alerts/${alert.id}`}
                            className="text-primary hover:text-primary/80 text-sm"
                          >
                            View
                          </Link>
                          {alert.status === 'open' && (
                            <button
                              onClick={() => apiClient.resolveAlert(alert.id).then(fetchAlerts)}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems} alerts
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
