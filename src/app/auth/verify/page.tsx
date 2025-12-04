'use client';

/**
 * Email Verification Page
 * Allows users to verify their email with a confirmation code
 */

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmSignUpCode } from '@/lib/auth/auth-service';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignUpCode(email, code);
      
      // Verification successful, redirect to login
      router.push('/auth/login?verified=true');
    } catch (err) {
      console.error('Verification error:', err);
      const error = err as { name?: string; message?: string };
      
      if (error.name === 'CodeMismatchException') {
        setError('Invalid verification code');
      } else if (error.name === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else {
        setError(error.message || 'An error occurred during verification');
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
          <h2 className="text-2xl font-semibold text-gray-700">Verify your email</h2>
          <p className="mt-2 text-gray-600">
            We sent a verification code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white p-8 rounded-xl shadow-md">
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

            <AuthInput
              label="Verification Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
              maxLength={6}
              autoComplete="one-time-code"
            />

            <AuthButton type="submit" isLoading={isLoading}>
              Verify Email
            </AuthButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-700"
                onClick={() => {
                  // TODO: Implement resend code
                  alert('Resend code coming soon!');
                }}
              >
                Resend
              </button>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-600">
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
