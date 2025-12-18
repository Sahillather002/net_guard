import { useState, useEffect } from 'react';
import { Flame, Plus, Edit, Trash2, Shield, Globe, Lock, Unlock, RefreshCw, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FirewallRule {
  id: string;
  name: string;
  action: 'allow' | 'deny' | 'log';
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  sourceIp: string;
  sourcePort: string;
  destinationIp: string;
  destinationPort: string;
  enabled: boolean;
  priority: number;
  description?: string;
  createdAt: string;
}

export default function FirewallPage() {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    blockedConnections: 0,
    allowedConnections: 0,
  });

  // Mock data
  useEffect(() => {
    const mockRules: FirewallRule[] = [
      {
        id: '1',
        name: 'Block Malicious IPs',
        action: 'deny',
        protocol: 'any',
        sourceIp: '192.168.100.0/24',
        sourcePort: 'any',
        destinationIp: 'any',
        destinationPort: 'any',
        enabled: true,
        priority: 1,
        description: 'Block known malicious IP range',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Allow HTTP Traffic',
        action: 'allow',
        protocol: 'tcp',
        sourceIp: 'any',
        sourcePort: 'any',
        destinationIp: 'any',
        destinationPort: '80',
        enabled: true,
        priority: 10,
        description: 'Allow incoming HTTP traffic',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Allow HTTPS Traffic',
        action: 'allow',
        protocol: 'tcp',
        sourceIp: 'any',
        sourcePort: 'any',
        destinationIp: 'any',
        destinationPort: '443',
        enabled: true,
        priority: 10,
        description: 'Allow incoming HTTPS traffic',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Block SSH from External',
        action: 'deny',
        protocol: 'tcp',
        sourceIp: '0.0.0.0/0',
        sourcePort: 'any',
        destinationIp: 'any',
        destinationPort: '22',
        enabled: true,
        priority: 5,
        description: 'Block SSH access from external networks',
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Log Database Access',
        action: 'log',
        protocol: 'tcp',
        sourceIp: 'any',
        sourcePort: 'any',
        destinationIp: '192.168.1.11',
        destinationPort: '3306',
        enabled: true,
        priority: 15,
        description: 'Log all database access attempts',
        createdAt: new Date().toISOString(),
      },
    ];

    setRules(mockRules);
    setStats({
      totalRules: mockRules.length,
      activeRules: mockRules.filter(r => r.enabled).length,
      blockedConnections: 1247,
      allowedConnections: 45892,
    });
    setLoading(false);
  }, []);

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch = 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.sourceIp.includes(searchQuery) ||
      rule.destinationIp.includes(searchQuery);
    
    const matchesAction = selectedAction === 'all' || rule.action === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  // Toggle rule
  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast.success('Rule updated successfully');
  };

  // Delete rule
  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success('Rule deleted successfully');
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'deny':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'log':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'allow':
        return <Unlock className="w-4 h-4" />;
      case 'deny':
        return <Lock className="w-4 h-4" />;
      case 'log':
        return <Globe className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Firewall Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure and manage firewall rules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalRules}</p>
            </div>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeRules}</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blocked</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.blockedConnections.toLocaleString()}</p>
            </div>
            <Lock className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allowed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.allowedConnections.toLocaleString()}</p>
            </div>
            <Unlock className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules by name or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Actions</option>
            <option value="allow">Allow</option>
            <option value="deny">Deny</option>
            <option value="log">Log</option>
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-12 text-center">
            <Flame className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No firewall rules found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protocol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {rule.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{rule.name}</p>
                        {rule.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize flex items-center gap-1', getActionColor(rule.action))}>
                          {getActionIcon(rule.action)}
                          {rule.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white uppercase">
                        {rule.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-mono text-gray-900 dark:text-white">{rule.sourceIp}</p>
                        <p className="text-gray-600 dark:text-gray-400">:{rule.sourcePort}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-mono text-gray-900 dark:text-white">{rule.destinationIp}</p>
                        <p className="text-gray-600 dark:text-gray-400">:{rule.destinationPort}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-full',
                          rule.enabled
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        )}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Edit rule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete rule"
                        >
                          <Trash2 className="w-4 h-4" />
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
