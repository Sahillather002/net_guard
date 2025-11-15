# 🚀 Vercel Deployment Guide - SecureCloud Next.js

## 📋 **Overview**

Deploy your SecureCloud Next.js application to Vercel for free with automatic HTTPS, global CDN, and continuous deployment.

---

## ⚡ **Quick Deploy (Recommended)**

### **Method 1: GitHub Integration (Easiest)**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/securecloud-nextjs.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add your variables (see below)

---

## 🔧 **Method 2: Vercel CLI**

### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

### **Step 2: Login**
```bash
vercel login
```

### **Step 3: Deploy**
```bash
cd securecloud-nextjs
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- Project name? **securecloud-nextjs**
- Directory? **./
**
- Override settings? **N**

### **Step 4: Deploy to Production**
```bash
vercel --prod
```

---

## 🔐 **Environment Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

### **Required Variables**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend-api.com/ws
NEXT_PUBLIC_JWT_SECRET=your-production-secret-key
```

### **Optional Variables**
```env
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### **How to Add:**
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - **Key:** Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value:** Your value
   - **Environment:** Select "Production", "Preview", and "Development"
4. Click "Save"

---

## 📁 **Project Configuration**

### **vercel.json** (Optional)

Create `vercel.json` in your project root for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_WS_URL": "@ws-url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🌐 **Custom Domain**

### **Add Custom Domain:**
1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `securecloud.yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

### **DNS Configuration:**
Add these records to your DNS provider:

**For subdomain (e.g., app.yourdomain.com):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**For root domain (e.g., yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

---

## 🔄 **Automatic Deployments**

Once connected to GitHub:
- **Push to main branch** → Deploys to production
- **Push to other branches** → Creates preview deployment
- **Pull requests** → Automatic preview deployments

### **Preview Deployments:**
- Each PR gets a unique URL
- Test changes before merging
- Share with team for review

---

## 📊 **Monitoring & Analytics**

### **Built-in Analytics:**
1. Go to your project dashboard
2. Click "Analytics" tab
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### **Web Vitals:**
- Core Web Vitals tracking
- Performance insights
- Real user monitoring

---

## 🚀 **Performance Optimization**

### **Automatic Optimizations:**
- ✅ Image optimization
- ✅ Code splitting
- ✅ Static generation
- ✅ Edge caching
- ✅ Compression

### **Edge Functions:**
Vercel automatically deploys your API routes as Edge Functions for global performance.

---

## 🔒 **Security**

### **Automatic HTTPS:**
- Free SSL certificates
- Automatic renewal
- HTTPS redirect

### **Security Headers:**
Already configured in `vercel.json`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

### **Environment Variables:**
- Encrypted at rest
- Never exposed to client
- Separate for each environment

---

## 💰 **Pricing (Free Tier)**

Vercel's Hobby plan includes:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Analytics
- ✅ 100 GB-hours serverless function execution

**Perfect for your SecureCloud project!**

---

## 🐛 **Troubleshooting**

### **Build Fails:**
```bash
# Check build locally first
npm run build

# View build logs in Vercel dashboard
```

### **Environment Variables Not Working:**
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Check variable names match exactly

### **API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend allows Vercel domain

### **404 Errors:**
- Check `next.config.js` configuration
- Verify all pages are in `src/app` directory
- Check dynamic routes syntax

---

## 📝 **Deployment Checklist**

### **Before Deployment:**
- [ ] Test build locally (`npm run build`)
- [ ] Configure environment variables
- [ ] Update API URLs to production
- [ ] Test all pages work
- [ ] Check responsive design
- [ ] Verify dark mode works
- [ ] Test authentication flow

### **After Deployment:**
- [ ] Test production URL
- [ ] Verify environment variables loaded
- [ ] Check API connections work
- [ ] Test all pages
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring
- [ ] Share URL with team

---

## 🔗 **Useful Links**

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentation:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
- **Custom Domains:** https://vercel.com/docs/concepts/projects/domains

---

## 📞 **Support**

### **Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Twitter: @vercel

### **Next.js Support:**
- Documentation: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js
- Discord: https://nextjs.org/discord

---

## 🎉 **Example Deployment Commands**

### **First Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### **Update Deployment:**
```bash
# Just push to GitHub (if connected)
git push

# Or use CLI
vercel --prod
```

### **Rollback:**
```bash
# In Vercel dashboard, go to Deployments
# Click on previous deployment
# Click "Promote to Production"
```

---

## 🌟 **Pro Tips**

1. **Use Preview Deployments:** Test changes before production
2. **Set up Notifications:** Get alerts for deployment status
3. **Monitor Analytics:** Track usage and performance
4. **Use Edge Functions:** For better global performance
5. **Enable Caching:** Optimize static assets
6. **Custom Domain:** Professional appearance
7. **Environment per Branch:** Different configs for staging/production

---

## ✅ **Your Deployment URL**

After deployment, you'll get:
- **Production:** `https://securecloud-nextjs.vercel.app`
- **Preview:** `https://securecloud-nextjs-git-branch.vercel.app`
- **Custom:** `https://your-domain.com` (if configured)

---

**🎊 Congratulations! Your SecureCloud app is now live on Vercel!**

Share your deployment URL and start monitoring your security platform! 🚀
