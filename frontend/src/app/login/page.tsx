'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (isSignUp) {
      const success = await register({ username, password });
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Registration failed. Username may already exist.');
      }
    } else {
      const success = await login({ username, password });
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    }
    
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
  };

  // Animated stock ticker data for decoration
  const tickerItems = [
    { symbol: 'AAPL', change: '+2.34%', positive: true },
    { symbol: 'NVDA', change: '+5.67%', positive: true },
    { symbol: 'MSFT', change: '-0.89%', positive: false },
    { symbol: 'GOOGL', change: '+1.23%', positive: true },
    { symbol: 'AMZN', change: '+3.45%', positive: true },
    { symbol: 'TSLA', change: '-1.56%', positive: false },
    { symbol: 'META', change: '+2.78%', positive: true },
    { symbol: 'JPM', change: '+0.92%', positive: true },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-700" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Stock Ticker - Top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden py-3 bg-gradient-to-r from-gray-950 via-gray-900/50 to-gray-950 border-b border-white/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={index} className="flex items-center gap-2 mx-6">
              <span className="text-gray-400 font-medium text-sm">{item.symbol}</span>
              <span className={`text-xs font-semibold ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-md">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-6">
              <span className="text-2xl font-bold text-white">ST</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-400">
              {isSignUp ? 'Join thousands of investors today' : 'Sign in to access your trading dashboard'}
            </p>
          </div>

          {/* Auth Card */}
          <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-16 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password Field - Only for Sign Up */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-16 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                        required
                      />

                    </div>
                    {/* Password Match Indicator */}
                    {confirmPassword && (
                      <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                        {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                )}

                {/* Terms & Conditions - Only for Sign Up */}
                {isSignUp && (
                  <p className="text-xs text-gray-500 text-center">
                    By creating an account, you agree to our{' '}
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms of Service</span> and{' '}
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>
                  </p>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || (isSignUp && password !== confirmPassword)}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  ) : (
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Toggle Mode Link */}
          <p className="mt-6 text-center text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={toggleMode} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {isSignUp ? 'Sign in' : 'Create one now'}
            </button>
          </p>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span className="text-xs">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">🔒</span>
                <span className="text-xs">Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">⚡</span>
                <span className="text-xs">Fast Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats Bar */}
      <div className="border-t border-white/5 bg-gradient-to-r from-gray-950 via-gray-900/50 to-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Active Traders:</span>
            <span className="text-white font-semibold">24,500+</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total Volume:</span>
            <span className="text-emerald-400 font-semibold">₹12.5B+</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Markets:</span>
            <span className="text-blue-400 font-semibold">NSE • BSE • NASDAQ</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
