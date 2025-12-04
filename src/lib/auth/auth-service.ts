/**
 * Authentication Service
 * Handles all authentication operations using AWS Amplify
 */

import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
} from 'aws-amplify/auth';
import type {
  SignUpData,
  SignInData,
  ResetPasswordData,
  ConfirmResetPasswordData,
  AuthUser,
} from './types';

/**
 * Sign up a new user
 */
export async function signUpUser(data: SignUpData) {
  const { email, password, name, role } = data;

  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
        'custom:role': role,
      },
      autoSignIn: true,
    },
  });

  return result;
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUpCode(email: string, code: string) {
  const result = await confirmSignUp({
    username: email,
    confirmationCode: code,
  });

  return result;
}

/**
 * Sign in a user
 */
export async function signInUser(data: SignInData) {
  const { email, password } = data;

  const result = await signIn({
    username: email,
    password,
  });

  return result;
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  await signOut();
}

/**
 * Request password reset
 */
export async function requestPasswordReset(data: ResetPasswordData) {
  const { email } = data;

  const result = await resetPassword({
    username: email,
  });

  return result;
}

/**
 * Confirm password reset with code
 */
export async function confirmPasswordReset(data: ConfirmResetPasswordData) {
  const { email, code, newPassword } = data;

  const result = await confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });

  return result;
}

/**
 * Get the current authenticated user
 */
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();

    return {
      id: user.userId,
      email: attributes.email || '',
      name: attributes.name,
      role: (attributes['custom:role'] as 'customer' | 'vendor') || 'customer',
    };
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current auth session
 */
export async function getAuthSession() {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch {
    return null;
  }
}

/**
 * Update user attributes
 */
export async function updateUserProfile(attributes: Record<string, string>) {
  const result = await updateUserAttributes({
    userAttributes: attributes,
  });

  return result;
}
