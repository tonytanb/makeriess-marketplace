'use client';

/**
 * Reset Password Page
 * Allows users to request a password reset
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth/auth-service';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset({ email });
      setSuccess(true);
      
      // Redirect to confirm page after a short delay
      setTimeout(() => {
        router.push(`/auth/reset-password/confirm?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      const error = err as { name?: string; message?: string };
      
      if (error.name === 'UserNotFoundException') {
        // Don't reveal if user exists for security
        setSuccess(true);
        setTimeout(() => {
          router.push(`/auth/reset-password/confirm?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Makeriess</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Reset your password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We&apos;ve sent a password reset code to <span className="font-medium">{email}</span>
                </p>
              </div>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <AuthInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <AuthButton type="submit" isLoading={isLoading}>
                Send Reset Code
              </AuthButton>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
