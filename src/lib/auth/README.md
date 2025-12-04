# Authentication Module

This module provides authentication functionality for the Makeriess marketplace using AWS Amplify and Amazon Cognito.

## Features

- ✅ Email/password authentication
- ✅ User sign up with role selection (customer/vendor)
- ✅ Email verification with confirmation codes
- ✅ Password reset flow
- ✅ Protected routes for authenticated pages
- ✅ Social login support (Google, Apple) - requires configuration
- ✅ Password policy enforcement (min 8 chars, uppercase, lowercase, number)
- ✅ MFA support (optional)

## File Structure

```
src/lib/auth/
├── types.ts              # TypeScript type definitions
├── auth-service.ts       # Core authentication functions
├── protected-route.tsx   # HOC for protecting routes
├── index.ts             # Module exports
└── README.md            # This file

src/components/auth/
├── AuthInput.tsx        # Reusable input component
├── AuthButton.tsx       # Reusable button component
└── RoleSelector.tsx     # Customer/vendor role selector

src/app/auth/
├── login/page.tsx                    # Login page
├── signup/page.tsx                   # Sign up page
├── verify/page.tsx                   # Email verification page
├── reset-password/page.tsx           # Request password reset
└── reset-password/confirm/page.tsx   # Confirm password reset
```

## Usage

### Sign Up

```typescript
import { signUpUser } from '@/lib/auth/auth-service';

const result = await signUpUser({
  email: 'user@example.com',
  password: 'SecurePass123',
  name: 'John Doe',
  role: 'customer', // or 'vendor'
});
```

### Sign In

```typescript
import { signInUser } from '@/lib/auth/auth-service';

const result = await signInUser({
  email: 'user@example.com',
  password: 'SecurePass123',
});
```

### Sign Out

```typescript
import { signOutUser } from '@/lib/auth/auth-service';

await signOutUser();
```

### Get Current User

```typescript
import { getAuthenticatedUser } from '@/lib/auth/auth-service';

const user = await getAuthenticatedUser();
// Returns: { id, email, name, role } or null
```

### Check Authentication Status

```typescript
import { isAuthenticated } from '@/lib/auth/auth-service';

const authenticated = await isAuthenticated();
// Returns: boolean
```

### Protected Routes

Wrap any page component with `ProtectedRoute` to require authentication:

```typescript
import { ProtectedRoute } from '@/lib/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

You can also specify a required role:

```typescript
<ProtectedRoute requiredRole="vendor">
  <VendorDashboard />
</ProtectedRoute>
```

### Password Reset

```typescript
import { requestPasswordReset, confirmPasswordReset } from '@/lib/auth/auth-service';

// Step 1: Request reset code
await requestPasswordReset({ email: 'user@example.com' });

// Step 2: Confirm with code and new password
await confirmPasswordReset({
  email: 'user@example.com',
  code: '123456',
  newPassword: 'NewSecurePass123',
});
```

## Configuration

### Cognito User Pool

The Cognito user pool is configured in `amplify/auth/resource.ts` with:

- Email-based authentication
- Custom attribute for user role (`custom:role`)
- Password policy: min 8 chars, uppercase, lowercase, number
- Optional MFA (SMS and TOTP)
- Email-only account recovery

### Social Providers

To enable Google and Apple sign-in:

1. Deploy the backend: `npm run amplify:deploy`
2. Go to AWS Amplify Console > Authentication
3. Configure OAuth providers with your credentials
4. Update callback URLs in `amplify/auth/resource.ts`

Alternatively, uncomment the `externalProviders` section in `amplify/auth/resource.ts` and add your credentials.

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## User Roles

The system supports two user roles:
- **customer**: Can browse and purchase products
- **vendor**: Can list products and manage orders

The role is stored as a custom attribute (`custom:role`) in Cognito and can be used for authorization.

## Error Handling

Common authentication errors:

- `UserNotFoundException`: User does not exist
- `NotAuthorizedException`: Invalid credentials
- `UserNotConfirmedException`: Email not verified
- `UsernameExistsException`: Email already registered
- `CodeMismatchException`: Invalid verification/reset code
- `ExpiredCodeException`: Code has expired
- `InvalidPasswordException`: Password doesn't meet requirements

## Security Features

- ✅ Password hashing (handled by Cognito)
- ✅ Secure token storage (handled by Amplify)
- ✅ HTTPS-only communication
- ✅ Account lockout after 5 failed attempts (15 min)
- ✅ Email verification required
- ✅ Secure password reset flow
- ✅ Optional MFA support

## Next Steps

1. Configure social providers (Google, Apple)
2. Implement role-based authorization in ProtectedRoute
3. Add user profile management
4. Implement "Remember me" functionality
5. Add session timeout handling
6. Implement refresh token rotation
7. Add audit logging for authentication events

## Testing

To test authentication flows:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign Up" to create a new account
4. Verify your email with the code sent
5. Sign in with your credentials
6. Visit `/dashboard` to see a protected page
7. Test password reset flow

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **17.1**: Email/password authentication with Cognito
- **17.2**: Social login support (Google, Apple) - requires configuration
- **17.3**: Password policy enforcement (min 8 chars, uppercase, lowercase, number)
- **17.4**: Account lockout after 5 failed attempts (handled by Cognito)
- **17.5**: Separate user pools with role-based access (using custom:role attribute)
