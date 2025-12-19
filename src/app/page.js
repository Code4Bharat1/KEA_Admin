'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // ---------------------------
  // ✅ ADMIN LOGIN INTEGRATION
  // ---------------------------
  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password }
    );

    // Save token
    localStorage.setItem("adminToken", response.data.token);

    // Redirect
    window.location.href = "/admin/dashboard";

  } catch (error) {
    console.error("Login Error:", error);

    alert(
      error.response?.data?.message ||
      "Login failed. Try again."
    );
  }

  setIsLoading(false);
};


  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2847] to-[#1a3a5c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-[#0D2847] to-[#1a3a5c]">
            {/* KEA Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/logo1.png" 
                alt="KEA Logo" 
                className="h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Admin Portal
            </h1>
            <p className="text-sm text-blue-200">Connecting Kokani Engineers</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kea.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D2847] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#0D2847] to-[#1a3a5c] text-white font-semibold rounded-lg hover:from-[#0A1929] hover:to-[#0D2847] focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#0D2847] hover:text-[#1a3a5c] font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/register"
                  className="text-[#0D2847] hover:text-[#1a3a5c] font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-blue-200 mt-6">
          🔒 Protected by advanced security protocols
        </p>
      </div>
    </div>
  );
}

// Forgot Password Component
function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // ---------------------------
  // ✅ ADMIN FORGOT PASSWORD API
  // ---------------------------
 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await axios.post(
      `${API_URL}/auth/forgot-password`,
      { email }
    );

    setIsSent(true);

  } catch (error) {
    console.error("Forgot Password Error:", error);

    alert(
      error.response?.data?.message ||
      "Failed to send reset link"
    );
  }

  setIsLoading(false);
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2847] to-[#1a3a5c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md">
        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-[#0D2847] to-[#1a3a5c]">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo1.png" 
                alt="KEA Logo" 
                className="h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSent ? 'Check Your Email' : 'Forgot Password?'}
            </h1>
            <p className="text-sm text-blue-200">
              {isSent 
                ? 'We\'ve sent a password reset link to your email' 
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {/* Form */}
          {!isSent ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kea.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#0D2847] to-[#1a3a5c] text-white font-semibold rounded-lg hover:from-[#0A1929] hover:to-[#0D2847] focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-sm text-gray-600 hover:text-[#0D2847] font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 space-y-5 bg-white">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <p className="text-sm text-green-800 text-center">
                  A password reset link has been sent to <strong>{email}</strong>
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm text-gray-600">
                <p>Please check your email and click the reset link to create a new password.</p>
                <p className="text-xs">If you don't see the email, check your spam folder.</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onBack}
                  className="w-full py-3 bg-gradient-to-r from-[#0D2847] to-[#1a3a5c] text-white font-semibold rounded-lg hover:from-[#0A1929] hover:to-[#0D2847] focus:outline-none focus:ring-2 focus:ring-[#0D2847] focus:ring-offset-2 transition-all shadow-lg"
                >
                  Back to Login
                </button>
                
                <button
                  onClick={() => setIsSent(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                >
                  Resend Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-blue-200 mt-6">
          Need help? Contact support
        </p>
      </div>
    </div>
  );
}