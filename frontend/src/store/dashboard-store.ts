import { create } from 'zustand';
import type { DashboardStats, Activity } from '@/types';
import { apiClient } from '@/lib/api-client';

interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: Activity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  timeRange: string;
  autoRefresh: boolean;
  refreshInterval: number;

  // Actions
  fetchStats: (timeRange?: string) => Promise<void>;
  fetchRecentActivity: (limit?: number) => Promise<void>;
  setTimeRange: (range: string) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  recentActivity: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  timeRange: '24h',
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds

  fetchStats: async (timeRange?: string) => {
    set({ isLoading: true, error: null });
    try {
      const range = timeRange || get().timeRange;
      const stats = await apiClient.getDashboardStats(range);
      set({
        stats,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch dashboard stats',
        isLoading: false,
      });
    }
  },

  fetchRecentActivity: async (limit = 20) => {
    try {
      const activity = await apiClient.getRecentActivity(limit);
      set({ recentActivity: activity });
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error);
    }
  },

  setTimeRange: (range: string) => {
    set({ timeRange: range });
    get().fetchStats(range);
  },

  setAutoRefresh: (enabled: boolean) => {
    set({ autoRefresh: enabled });
  },

  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
  },

  refresh: async () => {
    await Promise.all([
      get().fetchStats(),
      get().fetchRecentActivity(),
    ]);
  },
}));
