import { useState, useEffect } from 'react';
import { Network, Activity, Wifi, Server, Globe, TrendingUp, TrendingDown, RefreshCw, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { formatBytes, formatNumber, cn } from '@/lib/utils';

interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: 'server' | 'workstation' | 'router' | 'switch' | 'firewall' | 'other';
  status: 'online' | 'offline' | 'warning';
  bandwidth: {
    upload: number;
    download: number;
  };
  lastSeen: string;
  location?: string;
}

interface NetworkStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalBandwidth: number;
  avgLatency: number;
  packetLoss: number;
}

export default function NetworkPage() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState<NetworkStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    totalBandwidth: 0,
    avgLatency: 0,
    packetLoss: 0,
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockDevices: NetworkDevice[] = [
      {
        id: '1',
        name: 'Web Server 01',
        ip: '192.168.1.10',
        mac: '00:1B:44:11:3A:B7',
        type: 'server',
        status: 'online',
        bandwidth: { upload: 1024000, download: 2048000 },
        lastSeen: new Date().toISOString(),
        location: 'Data Center A',
      },
      {
        id: '2',
        name: 'Database Server',
        ip: '192.168.1.11',
        mac: '00:1B:44:11:3A:B8',
        type: 'server',
        status: 'online',
        bandwidth: { upload: 512000, download: 1024000 },
        lastSeen: new Date().toISOString(),
        location: 'Data Center A',
      },
      {
        id: '3',
        name: 'Main Router',
        ip: '192.168.1.1',
        mac: '00:1B:44:11:3A:B9',
        type: 'router',
        status: 'online',
        bandwidth: { upload: 5120000, download: 10240000 },
        lastSeen: new Date().toISOString(),
        location: 'Network Room',
      },
      {
        id: '4',
        name: 'Workstation 01',
        ip: '192.168.1.100',
        mac: '00:1B:44:11:3A:C0',
        type: 'workstation',
        status: 'online',
        bandwidth: { upload: 102400, download: 204800 },
        lastSeen: new Date().toISOString(),
        location: 'Floor 3',
      },
      {
        id: '5',
        name: 'Backup Server',
        ip: '192.168.1.12',
        mac: '00:1B:44:11:3A:C1',
        type: 'server',
        status: 'warning',
        bandwidth: { upload: 256000, download: 512000 },
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        location: 'Data Center B',
      },
    ];

    setDevices(mockDevices);
    
    const online = mockDevices.filter(d => d.status === 'online').length;
    const offline = mockDevices.filter(d => d.status === 'offline').length;
    const totalBandwidth = mockDevices.reduce((sum, d) => sum + d.bandwidth.upload + d.bandwidth.download, 0);
    
    setStats({
      totalDevices: mockDevices.length,
      onlineDevices: online,
      offlineDevices: offline,
      totalBandwidth,
      avgLatency: 12.5,
      packetLoss: 0.02,
    });
    
    setLoading(false);
  }, []);

  // Filter devices
  const filteredDevices = devices.filter((device) => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip.includes(searchQuery) ||
      device.mac.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || device.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="w-5 h-5" />;
      case 'router':
        return <Wifi className="w-5 h-5" />;
      case 'workstation':
        return <Activity className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'offline':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Network Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor network devices and traffic in real-time
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalDevices}</p>
            </div>
            <Network className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.onlineDevices}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.offlineDevices}</p>
            </div>
            <Globe className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bandwidth</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{formatBytes(stats.totalBandwidth)}/s</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.avgLatency}ms</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Packet Loss</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.packetLoss}%</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices by name, IP, or MAC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="server">Servers</option>
            <option value="workstation">Workstations</option>
            <option value="router">Routers</option>
            <option value="switch">Switches</option>
            <option value="firewall">Firewalls</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading devices...</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Network className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No devices found</p>
          </div>
        ) : (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    device.status === 'online' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    device.status === 'offline' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  )}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{device.type}</p>
                  </div>
                </div>
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', getStatusColor(device.status))}>
                  {device.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{device.ip}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">MAC Address:</span>
                  <span className="font-mono text-gray-900 dark:text-white text-xs">{device.mac}</span>
                </div>
                {device.location && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="text-gray-900 dark:text-white">{device.location}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Upload:</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(device.bandwidth.upload)}/s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Download:</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(device.bandwidth.download)}/s
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
