# 🚀 SecureCloud Frontend - Complete Installation Guide

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Building for Production](#building-for-production)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)
8. [Available Scripts](#available-scripts)

---

## ✅ **Prerequisites**

Before you begin, ensure you have the following installed:

### **Required Software**

- **Node.js** 18.0.0 or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm** 9.0.0 or higher (comes with Node.js)
  - Verify: `npm --version`
  
- **Git** (optional, for version control)
  - Download from: https://git-scm.com/
  - Verify: `git --version`

### **System Requirements**

- **OS:** Windows 10/11, macOS 10.15+, or Linux
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 500MB for dependencies

---

## 📥 **Installation Steps**

### **Step 1: Navigate to Frontend Directory**

```bash
cd netguard-project/frontend
```

### **Step 2: Install Dependencies**

This will install all required packages listed in `package.json`:

```bash
npm install
```

**Expected output:**
```
added 1247 packages, and audited 1248 packages in 45s

234 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**Installation time:** Approximately 1-3 minutes depending on your internet speed.

### **Step 3: Verify Installation**

Check that all dependencies were installed correctly:

```bash
npm list --depth=0
```

You should see all major dependencies listed, including:
- react@18.2.0
- typescript@5.3.3
- vite@5.0.8
- tailwindcss@3.3.6
- And many more...

---

## ⚙️ **Configuration**

### **Step 1: Create Environment File**

Create a `.env` file in the `frontend` directory:

```bash
# On Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# On macOS/Linux
touch .env
```

### **Step 2: Add Environment Variables**

Open `.env` and add the following configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws

# Application Configuration
VITE_APP_NAME=SecureCloud
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Enterprise Security Platform

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENABLE_WEBSOCKET=true

# Optional: Third-party Services
# VITE_SENTRY_DSN=your-sentry-dsn
# VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

### **Step 3: Verify Configuration**

The configuration is automatically loaded by Vite. You can verify it's working by checking the console when you start the dev server.

---

## 🏃 **Running the Application**

### **Development Mode**

Start the development server with hot module replacement:

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h to show help
```

**Access the application:**
- Open your browser and navigate to: `http://localhost:3000`
- The page will automatically reload when you make changes

### **Development with Custom Port**

If port 3000 is already in use:

```bash
npm run dev -- --port 3001
```

### **Development with Network Access**

To access from other devices on your network:

```bash
npm run dev -- --host
```

---

## 🏗️ **Building for Production**

### **Step 1: Build the Application**

```bash
npm run build
```

**Expected output:**
```
vite v5.0.8 building for production...
✓ 1247 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-a1b2c3d4.css  45.67 kB │ gzip: 12.34 kB
dist/assets/index-e5f6g7h8.js  234.56 kB │ gzip: 78.90 kB
✓ built in 12.34s
```

**Build output location:** `dist/` directory

### **Step 2: Preview Production Build**

Test the production build locally:

```bash
npm run preview
```

**Expected output:**
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: http://192.168.1.100:4173/
```

### **Step 3: Deploy**

The `dist/` directory contains all the files needed for deployment. You can:

1. **Deploy to a static hosting service:**
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

2. **Deploy with Docker:**
   ```bash
   docker build -t securecloud-frontend .
   docker run -p 80:80 securecloud-frontend
   ```

3. **Deploy to a web server:**
   - Copy the `dist/` directory to your web server
   - Configure your web server to serve the files

---

## 🐛 **Troubleshooting**

### **Common Issues and Solutions**

#### **Issue 1: Port Already in Use**

**Error:**
```
Port 3000 is in use, trying another one...
```

**Solution:**
```bash
# Use a different port
npm run dev -- --port 3001

# Or kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

#### **Issue 2: Module Not Found**

**Error:**
```
Cannot find module 'react' or its corresponding type declarations
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for a clean install
npm ci
```

#### **Issue 3: TypeScript Errors**

**Error:**
```
Could not find a declaration file for module 'react'
```

**Solution:**
```bash
# Install type definitions
npm install --save-dev @types/react @types/react-dom

# Or reinstall all dependencies
npm install
```

#### **Issue 4: Build Fails**

**Error:**
```
Build failed with errors
```

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

#### **Issue 5: Environment Variables Not Working**

**Error:**
```
undefined is not a valid URL
```

**Solution:**
1. Ensure `.env` file exists in the `frontend` directory
2. Restart the dev server after changing `.env`
3. Verify variable names start with `VITE_`
4. Check for typos in variable names

#### **Issue 6: Slow Development Server**

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS=--max_old_space_size=4096
npm run dev

# Or on Windows:
set NODE_OPTIONS=--max_old_space_size=4096
npm run dev
```

---

## 📁 **Project Structure**

```
frontend/
├── public/                     # Static assets
│   └── favicon.ico
│
├── src/
│   ├── components/             # React components
│   │   ├── layouts/           # Layout components (400 lines)
│   │   │   └── DashboardLayout.tsx
│   │   └── ui/                # UI components
│   │
│   ├── hooks/                  # Custom hooks
│   │   └── useWebSocket.ts    # WebSocket hook (320 lines)
│   │
│   ├── lib/                    # Utilities
│   │   ├── api-client.ts      # API client (600 lines)
│   │   └── utils.ts           # Helpers (500 lines)
│   │
│   ├── pages/                  # Page components
│   │   ├── auth/
│   │   │   └── LoginPage.tsx  # Login page (300 lines)
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx  # Dashboard (530 lines)
│   │   └── alerts/
│   │       └── AlertsPage.tsx # Alerts page (470 lines)
│   │
│   ├── store/                  # State management
│   │   ├── auth-store.ts      # Auth state (120 lines)
│   │   └── dashboard-store.ts # Dashboard state (80 lines)
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts           # All types (500 lines)
│   │
│   ├── App.tsx                 # Main app (150 lines)
│   ├── main.tsx                # Entry point (10 lines)
│   └── index.css               # Global styles (350 lines)
│
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── tailwind.config.js          # Tailwind config
├── postcss.config.js           # PostCSS config
└── README.md                   # Documentation
```

---

## 📜 **Available Scripts**

### **Development**

```bash
# Start development server
npm run dev

# Start with custom port
npm run dev -- --port 3001

# Start with network access
npm run dev -- --host
```

### **Building**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### **Code Quality**

```bash
# Run TypeScript type checker
npm run type-check

# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### **Testing**

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### **Utilities**

```bash
# Clean build artifacts
npm run clean

# Analyze bundle size
npm run analyze

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

---

## 🔍 **Verification Checklist**

After installation, verify everything works:

- [ ] Dependencies installed successfully
- [ ] No errors in `npm install`
- [ ] `.env` file created and configured
- [ ] Development server starts without errors
- [ ] Application loads in browser at `http://localhost:3000`
- [ ] No console errors in browser developer tools
- [ ] Hot module replacement works (changes reflect immediately)
- [ ] Production build completes successfully
- [ ] Preview server works correctly

---

## 📊 **Performance Tips**

### **Development**

1. **Use Fast Refresh:** Vite's HMR is very fast, keep the dev server running
2. **Lazy Load Routes:** Use React.lazy() for code splitting
3. **Optimize Images:** Use WebP format and appropriate sizes
4. **Minimize Re-renders:** Use React.memo() and useMemo()

### **Production**

1. **Enable Compression:** Use gzip or brotli compression
2. **Use CDN:** Serve static assets from a CDN
3. **Cache Assets:** Configure proper cache headers
4. **Minimize Bundle:** Remove unused dependencies

---

## 🔒 **Security Considerations**

1. **Environment Variables:**
   - Never commit `.env` to version control
   - Use different `.env` files for different environments
   - Rotate API keys regularly

2. **Dependencies:**
   - Regularly update dependencies: `npm update`
   - Check for vulnerabilities: `npm audit`
   - Fix vulnerabilities: `npm audit fix`

3. **Build:**
   - Always build from a clean state
   - Verify build output before deployment
   - Use HTTPS in production

---

## 🆘 **Getting Help**

### **Resources**

- **Documentation:** See `README.md` and `WEBSITE-README.md`
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **TypeScript Docs:** https://www.typescriptlang.org/
- **Tailwind Docs:** https://tailwindcss.com/

### **Common Commands Reference**

```bash
# Installation
npm install                    # Install dependencies
npm ci                         # Clean install

# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview build

# Maintenance
npm update                     # Update dependencies
npm audit                      # Check vulnerabilities
npm audit fix                  # Fix vulnerabilities

# Cleanup
rm -rf node_modules           # Remove dependencies
rm -rf dist                   # Remove build output
rm -rf node_modules/.vite     # Clear Vite cache
```

---

## ✅ **Next Steps**

After successful installation:

1. **Explore the Application:**
   - Navigate to `http://localhost:3000`
   - Try logging in (use mock credentials if backend isn't running)
   - Explore different pages

2. **Start Development:**
   - Read the code in `src/` directory
   - Understand the project structure
   - Make your first changes

3. **Connect to Backend:**
   - Ensure backend services are running
   - Update `.env` with correct API URLs
   - Test API integration

4. **Customize:**
   - Update branding and colors
   - Add new features
   - Modify existing components

---

## 🎉 **Success!**

If you've followed all the steps, you should now have:

- ✅ A fully functional development environment
- ✅ All dependencies installed
- ✅ Application running locally
- ✅ Hot module replacement working
- ✅ Production build capability

**You're ready to start developing!** 🚀

---

**Built with ❤️ for SecureCloud Enterprise Security Platform**
