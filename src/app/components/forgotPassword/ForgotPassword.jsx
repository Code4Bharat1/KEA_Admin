'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7101/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email
      });

      console.log('Response:', response.data);
      
      // Store the reset token (in production, this would be sent via email)
      setResetToken(response.data.resetToken);
      setIsSuccess(true);
      
      // Auto-redirect to reset password page after 3 seconds
      setTimeout(() => {
        window.location.href = `/admin/reset-password?token=${response.data.resetToken}`;
      }, 3000);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      alert(
        error.response?.data?.message ||
        'Failed to process request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-[#0D2847] to-[#1a3a5c]">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo1.png" 
                alt="KEA Logo" 
                className="h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Forgot Password?
            </h1>
            <p className="text-sm text-blue-200">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Form or Success Message */}
          <div className="p-8">
            {isSuccess ? (
              // Success State
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Check Your Email</h3>
                  <p className="text-gray-600">
                    We've sent password reset instructions to
                  </p>
                  <p className="text-[#0D2847] font-medium">{email}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Development Mode - Reset Token:
                  </p>
                  <p className="text-xs text-blue-700 break-all font-mono bg-white p-2 rounded">
                    {resetToken}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Redirecting to reset password page...
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email?{' '}
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setEmail('');
                      }}
                      className="text-[#0D2847] hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </p>

                  <Link
                    href="/admin/login"
                    className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#0D2847] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </div>
            ) : (
              // Form State
              <>
                <p className="text-gray-600 text-center mb-6">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
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
                      'Send Reset Instructions'
                    )}
                  </button>

                  {/* Back to Login Link */}
                  <div className="text-center pt-2">
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#0D2847] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to login</span>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-blue-200 mt-6">
          🔒 Secure password recovery
        </p>
      </div>
    </div>
  );
}