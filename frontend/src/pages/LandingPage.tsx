import { Link } from 'react-router-dom';
import { Shield, Lock, Activity, Zap, Users, Globe, ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SecureCloud
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Star className="w-3 h-3 mr-1" />
            Enterprise Security Platform
          </Badge>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Protect Your Digital Assets with AI-Powered Security
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Real-time threat detection, intelligent firewall management, and comprehensive network monitoring—all in one powerful platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-3xl opacity-20"></div>
            <Card className="relative overflow-hidden border-2">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-t-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg">
                    <Activity className="w-8 h-8 text-white mb-2" />
                    <p className="text-white/80 text-sm">Active Threats</p>
                    <p className="text-3xl font-bold text-white">24</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg">
                    <Shield className="w-8 h-8 text-white mb-2" />
                    <p className="text-white/80 text-sm">Protected Assets</p>
                    <p className="text-3xl font-bold text-white">1,247</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg">
                    <Zap className="w-8 h-8 text-white mb-2" />
                    <p className="text-white/80 text-sm">Response Time</p>
                    <p className="text-3xl font-bold text-white">0.3s</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features for Complete Protection</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to secure your infrastructure
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Real-time Threat Detection',
              description: 'AI-powered threat detection identifies and neutralizes security risks before they impact your business.',
              color: 'from-blue-500 to-blue-600',
            },
            {
              icon: Lock,
              title: 'Advanced Firewall',
              description: 'Intelligent firewall rules with automatic threat blocking and custom policy management.',
              color: 'from-purple-500 to-purple-600',
            },
            {
              icon: Activity,
              title: 'Network Monitoring',
              description: 'Comprehensive network visibility with real-time bandwidth tracking and device management.',
              color: 'from-green-500 to-green-600',
            },
            {
              icon: Zap,
              title: 'Instant Alerts',
              description: 'Get notified immediately about critical security events via email, Slack, or SMS.',
              color: 'from-orange-500 to-orange-600',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              description: 'Role-based access control and team management for seamless security operations.',
              color: 'from-indigo-500 to-indigo-600',
            },
            {
              icon: Globe,
              title: 'Global Coverage',
              description: 'Protect your infrastructure across multiple regions with distributed threat intelligence.',
              color: 'from-cyan-500 to-cyan-600',
            },
          ].map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold mb-2">99.9%</p>
                <p className="text-blue-100">Uptime SLA</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">10M+</p>
                <p className="text-blue-100">Threats Blocked</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">500+</p>
                <p className="text-blue-100">Enterprise Clients</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">&lt;1s</p>
                <p className="text-blue-100">Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '$49',
              description: 'Perfect for small teams',
              features: ['Up to 10 users', 'Basic threat detection', 'Email support', '1GB storage', 'Basic analytics'],
            },
            {
              name: 'Professional',
              price: '$149',
              description: 'For growing businesses',
              features: ['Up to 50 users', 'Advanced AI detection', 'Priority support', '10GB storage', 'Advanced analytics', 'Custom integrations'],
              popular: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'For large organizations',
              features: ['Unlimited users', 'Enterprise AI', '24/7 phone support', 'Unlimited storage', 'Custom analytics', 'Dedicated account manager', 'SLA guarantee'],
            },
          ].map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary border-2 shadow-2xl scale-105' : 'border-2'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-500">/month</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Infrastructure?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies protecting their digital assets with SecureCloud
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">SecureCloud</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Enterprise-grade security platform for modern businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
                <li><a href="#" className="hover:text-primary">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
                <li><a href="#" className="hover:text-primary">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 SecureCloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
