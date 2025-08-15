# Authentication System Documentation

## Overview

This Next.js application implements a complete authentication system using NextAuth.js with JWT tokens, connecting to the Go backend API for user management.

## Features

- **NextAuth.js Integration**: Secure authentication with JWT tokens
- **Environment-Based Protection**: Development mode allows bypassing auth, production requires authentication
- **API Integration**: Connects to Go backend for user registration and login
- **Protected Routes**: Automatic route protection with middleware
- **User Context**: Global user state management
- **Toast Notifications**: User feedback for authentication actions

## Environment Configuration

### Development (.env.local)
```bash
# Environment
NODE_ENV=development

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars-long

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Authentication Settings
NEXT_PUBLIC_AUTH_REQUIRED=false
NEXT_PUBLIC_DEV_MODE=true
```

### Production (.env.production)
```bash
# Environment
NODE_ENV=production

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-nextauth-secret-key-min-32-chars-long

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Authentication Settings
NEXT_PUBLIC_AUTH_REQUIRED=true
NEXT_PUBLIC_DEV_MODE=false
```

## Environment Variables Explained

- `NEXT_PUBLIC_AUTH_REQUIRED`: When `true`, all routes require authentication
- `NEXT_PUBLIC_DEV_MODE`: When `true`, allows bypassing authentication in development
- `NEXT_PUBLIC_API_URL`: Backend API URL for authentication requests

## Authentication Flow

### Development Mode
- When `NEXT_PUBLIC_DEV_MODE=true` and `NEXT_PUBLIC_AUTH_REQUIRED=false`:
  - Users can access any route without authentication
  - Login/signup pages are still available but optional
  - Perfect for development and testing

### Production Mode
- When `NEXT_PUBLIC_AUTH_REQUIRED=true`:
  - All routes (except login/signup) require authentication
  - Unauthenticated users are redirected to `/login`
  - JWT tokens are validated on each request

## API Integration

The application connects to the Go backend API with the following endpoints:

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update user profile

### API Service (`src/lib/api.ts`)
- Automatic token management
- Request/response interceptors
- Automatic token refresh on 401 errors
- Error handling and user feedback

## Components

### Authentication Components

1. **ProtectedRoute** (`src/components/auth/protected-route.tsx`)
   - Wraps protected content
   - Checks authentication status
   - Redirects to login if not authenticated
   - Respects environment settings

2. **UserMenu** (`src/components/auth/user-menu.tsx`)
   - Shows user information
   - Provides logout functionality
   - Avatar with user initials

3. **AuthProvider** (`src/contexts/auth-context.tsx`)
   - Global authentication state
   - User information management
   - Logout functionality

### Pages

1. **Login Page** (`src/app/login/page.tsx`)
   - Email/password login form
   - NextAuth.js integration
   - Error handling and feedback

2. **Signup Page** (`src/app/signup/page.tsx`)
   - User registration form
   - API integration for account creation
   - Form validation

## Usage

### Protecting Routes

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>This content is protected</div>
    </ProtectedRoute>
  )
}
```

### Using Authentication Context

```tsx
import { useAuth } from "@/contexts/auth-context"

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Environment-Based Behavior

The application automatically adapts based on environment variables:

```typescript
// Check current mode
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true"

// In development with auth disabled
if (isDevMode && !authRequired) {
  // Allow all routes without authentication
}

// In production or when auth is required
if (authRequired) {
  // Require authentication for all routes
}
```

## Middleware

The application uses NextAuth.js middleware for route protection:

- **Development Mode**: Allows all routes when auth is disabled
- **Production Mode**: Protects all routes except login/signup
- **Automatic Redirects**: Redirects unauthenticated users to login

## Security Features

1. **JWT Tokens**: Secure token-based authentication
2. **Token Refresh**: Automatic token refresh on expiration
3. **Environment Isolation**: Different behavior for dev/prod
4. **Input Validation**: Form validation and sanitization
5. **Error Handling**: Comprehensive error handling and user feedback

## Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Development Mode**:
   - Set `NEXT_PUBLIC_DEV_MODE=true` and `NEXT_PUBLIC_AUTH_REQUIRED=false`
   - Access any route without authentication
   - Test features without login

3. **Production Testing**:
   - Set `NEXT_PUBLIC_AUTH_REQUIRED=true`
   - Test authentication flow
   - Verify route protection

4. **API Testing**:
   - Ensure Go backend is running on `http://localhost:8080`
   - Test registration and login flows
   - Verify token management

## Troubleshooting

### Common Issues

1. **Authentication Not Working**:
   - Check environment variables
   - Verify API URL is correct
   - Ensure Go backend is running

2. **Routes Not Protected**:
   - Check `NEXT_PUBLIC_AUTH_REQUIRED` setting
   - Verify middleware configuration
   - Check NextAuth.js setup

3. **Token Issues**:
   - Check JWT secret configuration
   - Verify token expiration settings
   - Check API token refresh logic

### Debug Mode

Enable debug logging by setting:
```bash
NEXTAUTH_DEBUG=true
```

This will show detailed NextAuth.js logs in the console.

## Future Enhancements

1. **OAuth Providers**: Add Google, GitHub, etc.
2. **Two-Factor Authentication**: Implement 2FA
3. **Password Reset**: Add password reset functionality
4. **Email Verification**: Implement email verification
5. **Role-Based Access**: Add user roles and permissions
6. **Session Management**: Advanced session tracking


