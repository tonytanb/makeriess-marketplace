# Makeriess Authentication Guide

## Quick Start

### For Users

**Sign Up**
1. Visit `/auth/signup`
2. Choose your role (Customer or Vendor)
3. Enter your details
4. Check email for verification code
5. Verify and start using Makeriess

**Sign In**
1. Visit `/auth/login`
2. Enter email and password
3. Or use Google/Apple sign-in (coming soon)

**Forgot Password?**
1. Click "Forgot password?" on login page
2. Enter your email
3. Check email for reset code
4. Enter code and new password

### For Developers

**Protect a Page**
```typescript
import { ProtectedRoute } from '@/lib/auth/protected-route';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

**Get Current User**
```typescript
import { getAuthenticatedUser } from '@/lib/auth/auth-service';

const user = await getAuthenticatedUser();
// { id, email, name, role }
```

**Sign Out**
```typescript
import { signOutUser } from '@/lib/auth/auth-service';

await signOutUser();
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Login Page   │  │ Signup Page  │  │ Reset Page   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │  Auth Service   │                        │
│                   │  (auth-service) │                        │
│                   └────────┬────────┘                        │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  AWS Amplify    │
                    │   Auth Client   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Amazon Cognito  │
                    │   User Pool     │
                    └─────────────────┘
```

## User Roles

### Customer
- Browse products
- Add to cart
- Place orders
- Save favorites
- Track deliveries

### Vendor
- List products
- Manage inventory
- Process orders
- View analytics
- Connect POS systems

## Security Features

✅ **Password Requirements**
- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number

✅ **Account Protection**
- Email verification required
- Account lockout after 5 failed attempts
- Secure password reset flow
- Session management

✅ **Data Protection**
- Encrypted data at rest
- HTTPS-only communication
- Secure token storage
- No sensitive data in URLs

## API Reference

### Sign Up
```typescript
signUpUser({
  email: string,
  password: string,
  name: string,
  role: 'customer' | 'vendor'
})
```

### Sign In
```typescript
signInUser({
  email: string,
  password: string
})
```

### Sign Out
```typescript
signOutUser()
```

### Get User
```typescript
getAuthenticatedUser()
// Returns: { id, email, name, role } | null
```

### Check Auth
```typescript
isAuthenticated()
// Returns: boolean
```

### Reset Password
```typescript
// Step 1: Request code
requestPasswordReset({ email: string })

// Step 2: Confirm with code
confirmPasswordReset({
  email: string,
  code: string,
  newPassword: string
})
```

## Pages

| Route | Description | Protected |
|-------|-------------|-----------|
| `/auth/login` | Sign in page | No |
| `/auth/signup` | Sign up page | No |
| `/auth/verify` | Email verification | No |
| `/auth/reset-password` | Request reset | No |
| `/auth/reset-password/confirm` | Confirm reset | No |
| `/dashboard` | User dashboard | Yes |
| `/` | Home page | No |

## Components

### AuthInput
Reusable input field with label and error handling.

```typescript
<AuthInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  required
/>
```

### AuthButton
Reusable button with loading states and variants.

```typescript
<AuthButton
  variant="primary" // or "secondary" or "social"
  isLoading={isLoading}
  icon={<GoogleIcon />}
>
  Sign In
</AuthButton>
```

### RoleSelector
Customer/vendor role selection component.

```typescript
<RoleSelector
  value={role}
  onChange={setRole}
/>
```

### ProtectedRoute
HOC for protecting authenticated pages.

```typescript
<ProtectedRoute requiredRole="vendor">
  <VendorDashboard />
</ProtectedRoute>
```

## Error Handling

Common errors and their meanings:

| Error | Meaning | Action |
|-------|---------|--------|
| `UserNotFoundException` | User doesn't exist | Check email or sign up |
| `NotAuthorizedException` | Wrong password | Try again or reset |
| `UserNotConfirmedException` | Email not verified | Check email for code |
| `UsernameExistsException` | Email already used | Sign in instead |
| `CodeMismatchException` | Wrong verification code | Check code and retry |
| `ExpiredCodeException` | Code expired | Request new code |
| `InvalidPasswordException` | Weak password | Follow requirements |

## Testing

### Manual Testing Checklist

- [ ] Sign up as customer
- [ ] Sign up as vendor
- [ ] Verify email
- [ ] Sign in
- [ ] Sign out
- [ ] Request password reset
- [ ] Confirm password reset
- [ ] Access protected page (authenticated)
- [ ] Access protected page (not authenticated)
- [ ] Test invalid credentials
- [ ] Test weak password
- [ ] Test duplicate email

### Automated Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests (when implemented)
npm run test:e2e
```

## Troubleshooting

### Email not received
- Check spam folder
- Verify email address is correct
- Wait a few minutes
- Request new code

### Can't sign in
- Verify email first
- Check password is correct
- Try password reset
- Check account isn't locked

### Protected page redirects to login
- Sign in first
- Check session hasn't expired
- Clear browser cache
- Try incognito mode

## Configuration

### Environment Variables
No environment variables needed for basic auth. Amplify handles configuration via `amplify_outputs.json`.

### Social Providers
To enable Google/Apple sign-in:

1. Get OAuth credentials from provider
2. Update `amplify/auth/resource.ts`
3. Deploy: `npm run amplify:deploy`
4. Test OAuth flow

## Best Practices

✅ **Do**
- Always use ProtectedRoute for authenticated pages
- Handle errors gracefully
- Show loading states
- Validate input client-side
- Use TypeScript types
- Log out on sensitive actions

❌ **Don't**
- Store passwords in state
- Expose sensitive data in URLs
- Skip email verification
- Use weak passwords
- Ignore error messages
- Share auth tokens

## Support

For issues or questions:
1. Check this guide
2. Review `src/lib/auth/README.md`
3. Check implementation docs
4. Contact development team

## Changelog

### v1.0.0 (Current)
- ✅ Email/password authentication
- ✅ Sign up with role selection
- ✅ Email verification
- ✅ Password reset
- ✅ Protected routes
- ✅ Social login UI (pending OAuth config)

### Upcoming
- 🔄 Social login (Google, Apple)
- 🔄 Role-based authorization
- 🔄 User profile management
- 🔄 Remember me
- 🔄 Session timeout handling
- 🔄 MFA UI
