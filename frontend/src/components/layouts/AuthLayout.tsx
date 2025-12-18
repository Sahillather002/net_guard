import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <Shield className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SecureCloud
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/features" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/docs" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Docs
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Branding */}
              <div className="hidden lg:block">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Enterprise Security Platform
                    </span>
                  </div>
                  
                  <h1 className="text-5xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Protect Your
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      Digital Assets
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Advanced threat detection, real-time monitoring, and AI-powered security 
                    for modern enterprises.
                  </p>

                  {/* Features List */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Real-time Threat Detection</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered monitoring 24/7</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Advanced Analytics</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive security insights</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Enterprise Grade</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Trusted by Fortune 500 companies</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-3xl font-bold text-primary">99.9%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">10M+</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Threats Blocked</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary">500+</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enterprises</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Auth Form */}
              <div className="w-full">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  © 2024 SecureCloud. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/privacy" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link 
                    to="/terms" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    Terms
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
