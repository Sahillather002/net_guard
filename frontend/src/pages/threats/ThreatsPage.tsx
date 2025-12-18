import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Search, Filter, Download, RefreshCw, Eye, Ban, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { Threat, ThreatSeverity, ThreatStatus } from '@/types';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<ThreatSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ThreatStatus | 'all'>('all');
  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    resolved: 0,
    critical: 0,
    high: 0,
  });

  // Fetch threats
  const fetchThreats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.threats.getAll({
        page: 1,
        limit: 100,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setThreats(response.data);
      
      // Calculate stats
      const active = response.data.filter((t: Threat) => t.status === 'active').length;
      const blocked = response.data.filter((t: Threat) => t.status === 'blocked').length;
      const resolved = response.data.filter((t: Threat) => t.status === 'resolved').length;
      const critical = response.data.filter((t: Threat) => t.severity === 'critical').length;
      const high = response.data.filter((t: Threat) => t.severity === 'high').length;
      
      setStats({
        total: response.data.length,
        active,
        blocked,
        resolved,
        critical,
        high,
      });
    } catch (error) {
      toast.error('Failed to fetch threats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [selectedSeverity, selectedStatus]);

  // Filter threats by search
  const filteredThreats = threats.filter((threat) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      threat.name.toLowerCase().includes(searchLower) ||
      threat.type.toLowerCase().includes(searchLower) ||
      threat.source?.toLowerCase().includes(searchLower)
    );
  });

  // Handle threat action
  const handleThreatAction = async (threatId: string, action: 'block' | 'resolve') => {
    try {
      if (action === 'block') {
        await apiClient.threats.block(threatId);
        toast.success('Threat blocked successfully');
      } else {
        await apiClient.threats.resolve(threatId);
        toast.success('Threat resolved successfully');
      }
      fetchThreats();
    } catch (error) {
      toast.error(`Failed to ${action} threat`);
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: 'block' | 'resolve') => {
    if (selectedThreats.length === 0) {
      toast.error('No threats selected');
      return;
    }

    try {
      await Promise.all(
        selectedThreats.map((id) =>
          action === 'block'
            ? apiClient.threats.block(id)
            : apiClient.threats.resolve(id)
        )
      );
      toast.success(`${selectedThreats.length} threats ${action}ed successfully`);
      setSelectedThreats([]);
      fetchThreats();
    } catch (error) {
      toast.error(`Failed to ${action} threats`);
    }
  };

  // Get severity color
  const getSeverityColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: ThreatStatus) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'blocked':
        return <Ban className="w-4 h-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'investigating':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Threat Detection</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage security threats in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchThreats}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Threats</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.active}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blocked</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.blocked}</p>
            </div>
            <Ban className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.high}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as ThreatSeverity | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ThreatStatus | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="resolved">Resolved</option>
            <option value="investigating">Investigating</option>
          </select>
        </div>

        {selectedThreats.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedThreats.length} threat(s) selected
            </span>
            <button
              onClick={() => handleBulkAction('block')}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              Block Selected
            </button>
            <button
              onClick={() => handleBulkAction('resolve')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Resolve Selected
            </button>
            <button
              onClick={() => setSelectedThreats([])}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Threats List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading threats...</p>
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No threats found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedThreats.length === filteredThreats.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedThreats(filteredThreats.map((t) => t.id));
                        } else {
                          setSelectedThreats([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Threat
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Detected
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredThreats.map((threat) => (
                  <tr
                    key={threat.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedThreats.includes(threat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedThreats([...selectedThreats, threat.id]);
                          } else {
                            setSelectedThreats(selectedThreats.filter((id) => id !== threat.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{threat.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                          {threat.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {threat.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full capitalize',
                          getSeverityColor(threat.severity)
                        )}
                      >
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(threat.status)}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {threat.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {threat.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400" title={formatDate(threat.detectedAt)}>
                        {formatRelativeTime(threat.detectedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleThreatAction(threat.id, 'block')}
                          disabled={threat.status === 'blocked'}
                          className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Block threat"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleThreatAction(threat.id, 'resolve')}
                          disabled={threat.status === 'resolved'}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resolve threat"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
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
    </div>
  );
}
