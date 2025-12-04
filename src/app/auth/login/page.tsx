'use client';

/**
 * Login Page
 * Allows users to sign in with email/password or social providers
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInUser } from '@/lib/auth/auth-service';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo mode check removed - allow users to access login page even in demo mode

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signInUser({ email, password });

      if (result.isSignedIn) {
        // Redirect based on user role (for now, redirect to home)
        router.push('/');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      const error = err as { name?: string; message?: string };
      
      if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
        setError('Invalid email or password');
      } else if (error.name === 'UserNotConfirmedException') {
        setError('Please verify your email before signing in');
        // TODO: Redirect to verification page
      } else {
        setError(error.message || 'An error occurred during sign in');
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
          <h2 className="text-2xl font-semibold text-gray-700">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
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
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end">
              <Link
                href="/auth/reset-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            <AuthButton type="submit" isLoading={isLoading}>
              Sign In
            </AuthButton>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <AuthButton
                variant="social"
                onClick={() => {
                  // TODO: Implement Google sign in
                  alert('Google sign in coming soon!');
                }}
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              >
                Google
              </AuthButton>

              <AuthButton
                variant="social"
                onClick={() => {
                  // TODO: Implement Apple sign in
                  alert('Apple sign in coming soon!');
                }}
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                }
              >
                Apple
              </AuthButton>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>

        {/* Demo Mode Link */}
        <div className="text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Try Demo Mode
          </Link>
          <p className="mt-2 text-xs text-gray-500">
            Explore the marketplace without signing up
          </p>
        </div>
      </div>
    </div>
  );
}
