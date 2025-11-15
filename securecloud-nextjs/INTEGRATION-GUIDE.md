# 🔧 SecureCloud Next.js - Backend Integration Guide

## 📋 **Overview**

This guide explains how to integrate your Next.js frontend with your backend services (Python/FastAPI, Node.js, etc.).

---

## 🚀 **Quick Start**

### **1. Environment Setup**

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Your backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# WebSocket URL for real-time updates
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# JWT Secret (should match your backend)
NEXT_PUBLIC_JWT_SECRET=your-secret-key-here

# Feature flags
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

---

## 🔌 **API Client Configuration**

The API client is located at `src/lib/api-client.ts` and provides methods for all backend endpoints.

### **Available Methods:**

#### **Authentication**
```typescript
import apiClient from '@/lib/api-client';

// Login
await apiClient.login(email, password);

// Register
await apiClient.register({
  firstName, lastName, email, password, company, role
});

// Logout
await apiClient.logout();

// Get current user
await apiClient.getCurrentUser();
```

#### **Dashboard**
```typescript
// Get dashboard statistics
const stats = await apiClient.getDashboardStats();
```

#### **Alerts**
```typescript
// Get all alerts with filters
const alerts = await apiClient.getAlerts({
  severity: 'high',
  status: 'active',
  search: 'suspicious'
});

// Get single alert
const alert = await apiClient.getAlertById('ALT-001');

// Update alert status
await apiClient.updateAlertStatus('ALT-001', 'resolved');
```

#### **Threats**
```typescript
// Get threats
const threats = await apiClient.getThreats({
  type: 'malware',
  severity: 'critical'
});

// Block threat
await apiClient.blockThreat('THR-001');
```

#### **Network**
```typescript
// Get network devices
const devices = await apiClient.getNetworkDevices({ search: 'server' });

// Get network stats
const stats = await apiClient.getNetworkStats();
```

#### **Firewall**
```typescript
// Get firewall rules
const rules = await apiClient.getFirewallRules({ action: 'deny' });

// Create rule
await apiClient.createFirewallRule({
  name: 'Block Suspicious IP',
  source: '203.0.113.0/24',
  destination: 'Any',
  port: 'Any',
  protocol: 'Any',
  action: 'deny'
});

// Update rule
await apiClient.updateFirewallRule('FW-001', { status: 'disabled' });

// Delete rule
await apiClient.deleteFirewallRule('FW-001');
```

#### **Users**
```typescript
// Get users
const users = await apiClient.getUsers({ role: 'admin' });

// Create user
await apiClient.createUser({
  firstName, lastName, email, role, company
});

// Update user
await apiClient.updateUser('USR-001', { role: 'security_analyst' });

// Delete user
await apiClient.deleteUser('USR-001');
```

#### **Attack Flow**
```typescript
// Get attack flow data for visualization
const flowData = await apiClient.getAttackFlow();
```

---

## 🎨 **Using Zustand Store**

The auth store is configured at `src/store/auth-store.ts`.

### **Example Usage:**

```typescript
'use client'

import { useAuthStore } from '@/store/auth-store';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## 📄 **Updating Pages to Use Real Data**

### **Example: Alerts Page**

Replace the dummy data in `src/app/dashboard/alerts/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [searchQuery, severityFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAlerts({
        search: searchQuery,
        severity: severityFilter !== 'all' ? severityFilter : undefined
      });
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component...
}
```

### **Example: Dashboard Page**

```typescript
'use client'

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Use real stats data...
}
```

---

## 🔄 **WebSocket Integration**

For real-time updates, create a WebSocket hook:

```typescript
// src/hooks/use-websocket.ts
import { useEffect, useRef } from 'react';

export function useWebSocket(url: string, onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    ws.current = new WebSocket(`${wsUrl}${url}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [url, onMessage]);

  return ws.current;
}
```

### **Usage:**

```typescript
'use client'

import { useWebSocket } from '@/hooks/use-websocket';

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState([]);

  useWebSocket('/alerts', (newAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
  });

  // Render alerts...
}
```

---

## 🎯 **Backend API Requirements**

Your backend should implement these endpoints:

### **Authentication Endpoints**
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### **Dashboard Endpoints**
- `GET /api/dashboard/stats` - Get dashboard statistics

### **Alerts Endpoints**
- `GET /api/alerts` - Get all alerts (with filters)
- `GET /api/alerts/:id` - Get single alert
- `PATCH /api/alerts/:id/status` - Update alert status

### **Threats Endpoints**
- `GET /api/threats` - Get all threats
- `GET /api/threats/:id` - Get single threat
- `POST /api/threats/:id/block` - Block threat
- `GET /api/threats/attack-flow` - Get attack flow data

### **Network Endpoints**
- `GET /api/network/devices` - Get network devices
- `GET /api/network/stats` - Get network statistics

### **Firewall Endpoints**
- `GET /api/firewall/rules` - Get firewall rules
- `POST /api/firewall/rules` - Create rule
- `PUT /api/firewall/rules/:id` - Update rule
- `DELETE /api/firewall/rules/:id` - Delete rule

### **Users Endpoints**
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## 📊 **Expected Data Formats**

### **Alert Object**
```typescript
{
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'blocked';
  timestamp: string; // ISO 8601
  source: string;
}
```

### **Threat Object**
```typescript
{
  id: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'blocked' | 'quarantined' | 'monitoring';
  source: string;
  target: string;
  timestamp: string;
  detections: number;
}
```

### **Network Device Object**
```typescript
{
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: string;
  status: 'online' | 'warning' | 'offline';
  bandwidth: {
    in: number; // bytes per second
    out: number;
  };
  uptime: string;
  lastSeen: string;
}
```

### **Firewall Rule Object**
```typescript
{
  id: string;
  name: string;
  source: string;
  destination: string;
  port: string;
  protocol: string;
  action: 'allow' | 'deny';
  status: 'enabled' | 'disabled';
  priority: number;
  hits: number;
}
```

### **User Object**
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'security_analyst' | 'network_admin' | 'viewer';
  company: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}
```

### **Attack Flow Data**
```typescript
{
  nodes: Array<{
    id: string;
    type?: 'input' | 'output' | 'default';
    data: { label: string };
    position: { x: number; y: number };
    style?: object;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    label?: string;
    style?: object;
  }>;
}
```

---

## 🔐 **Authentication Flow**

1. User submits login form
2. Frontend calls `apiClient.login(email, password)`
3. Backend validates credentials and returns JWT token
4. API client stores token in localStorage
5. All subsequent requests include token in Authorization header
6. If token expires (401 response), user is redirected to login

---

## 🚀 **Deployment to Vercel**

### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

### **Step 2: Configure Environment Variables**

In Vercel dashboard, add these environment variables:
- `NEXT_PUBLIC_API_URL` - Your production API URL
- `NEXT_PUBLIC_WS_URL` - Your production WebSocket URL
- `NEXT_PUBLIC_JWT_SECRET` - Your JWT secret

### **Step 3: Deploy**
```bash
vercel
```

Or connect your GitHub repo for automatic deployments.

---

## 🎨 **Dark Mode**

Dark mode is now fully functional! It uses `next-themes` and persists user preference.

The toggle button in the dashboard layout will switch between light and dark themes.

---

## 📈 **Attack Flow Visualization**

The React Flow component is integrated into the dashboard. To use real data:

```typescript
'use client'

import { useEffect, useState } from 'react';
import { AttackFlowVisualization } from '@/components/attack-flow-visualization';
import apiClient from '@/lib/api-client';

export function AttackFlowPage() {
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttackFlow();
  }, []);

  const fetchAttackFlow = async () => {
    try {
      const data = await apiClient.getAttackFlow();
      setFlowData(data);
    } catch (error) {
      console.error('Failed to fetch attack flow:', error);
    } finally {
      setLoading(false);
    }
  };

  return <AttackFlowVisualization data={flowData} isLoading={loading} />;
}
```

---

## 🧪 **Testing**

### **Test API Integration**
```bash
# Start your backend server
# Then test the frontend
npm run dev
```

### **Test with Mock Data**
The app currently uses dummy data, so it works without a backend. Replace dummy data with API calls when ready.

---

## 📚 **Additional Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Flow Documentation](https://reactflow.dev/)
- [Next Themes Documentation](https://github.com/pacocoursey/next-themes)

---

## 🆘 **Troubleshooting**

### **CORS Issues**
Add CORS headers to your backend:
```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Authentication Errors**
- Check that JWT secret matches between frontend and backend
- Verify token is being sent in Authorization header
- Check token expiration time

### **WebSocket Connection Issues**
- Ensure WebSocket URL is correct
- Check firewall/proxy settings
- Verify backend WebSocket server is running

---

## ✅ **Checklist**

- [ ] Configure `.env.local` with backend URLs
- [ ] Implement backend API endpoints
- [ ] Update pages to use API client
- [ ] Test authentication flow
- [ ] Test real-time WebSocket updates
- [ ] Configure CORS on backend
- [ ] Set up Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Test production deployment

---

**Need help? Check the API client code in `src/lib/api-client.ts` for all available methods!**
