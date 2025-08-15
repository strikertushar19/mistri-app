# API Setup and Configuration

## Overview

This document explains the API setup for the Mistri app, including the API client configuration, authentication, and error handling.

## API Client

### Configuration

The API client is configured in `src/lib/api/client.ts` and uses the following setup:

- **Base URL**: `http://localhost:8080` (configurable via `NEXT_PUBLIC_API_URL`)
- **Timeout**: 30 seconds
- **Authentication**: JWT Bearer token
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Features

#### Authentication
- Automatic token injection in request headers
- Token expiration handling
- Automatic token cleanup on 401 errors

#### Error Handling
- Network error detection
- Server error handling (5xx status codes)
- Authentication error handling (401)
- User-friendly error messages

#### Request/Response Interceptors
- **Request Interceptor**: Adds authentication token to all requests
- **Response Interceptor**: Handles common error scenarios

## Token Management

### TokenManager Class

Located in `src/lib/auth/token-manager.ts`, provides utilities for:

- **Token Storage**: Secure localStorage management
- **Token Retrieval**: Safe token access
- **Token Validation**: Expiration checking
- **Token Cleanup**: Secure token removal

### Usage

```typescript
import { TokenManager } from '@/lib/auth/token-manager'

// Set token after login
TokenManager.setToken('your-jwt-token')

// Get token for API calls
const token = TokenManager.getToken()

// Check if user is authenticated
const isAuth = TokenManager.isAuthenticated()

// Clear tokens on logout
TokenManager.clearAllTokens()
```

## API Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### API Endpoints

All API endpoints are defined in `src/config/api.ts`:

#### Conversations
- `GET /conversations` - List conversations
- `POST /conversations` - Create conversation
- `GET /conversations/:id` - Get conversation
- `PUT /conversations/:id` - Update conversation
- `DELETE /conversations/:id` - Delete conversation
- `POST /conversations/:id/archive` - Archive conversation
- `POST /conversations/:id/duplicate` - Duplicate conversation
- `GET /conversations/search` - Search conversations
- `GET /conversations/stats` - Get conversation stats

#### Messages
- `POST /conversations/:id/messages` - Create message
- `GET /conversations/:id/messages` - Get messages
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

#### Chat
- `GET /chat/models` - Get available AI models
- `POST /chat/completion` - Send message to AI

#### Repositories
- `GET /repositories/github` - Get GitHub repositories
- `GET /repositories/gitlab` - Get GitLab repositories
- `GET /repositories/bitbucket` - Get Bitbucket repositories

## Usage Examples

### Making API Calls

```typescript
import { apiClient } from '@/lib/api/client'
import { API_CONFIG } from '@/config/api'

// GET request
const response = await apiClient.get(API_CONFIG.ENDPOINTS.CONVERSATIONS.LIST)

// POST request
const newConversation = await apiClient.post(
  API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE,
  { title: 'New Conversation' }
)

// PUT request
await apiClient.put(
  API_CONFIG.ENDPOINTS.CONVERSATIONS.UPDATE('conversation-id'),
  { title: 'Updated Title' }
)

// DELETE request
await apiClient.delete(
  API_CONFIG.ENDPOINTS.CONVERSATIONS.DELETE('conversation-id')
)
```

### Error Handling

```typescript
try {
  const response = await apiClient.get('/conversations')
  // Handle success
} catch (error) {
  if (error.message === 'Network error. Please check your connection.') {
    // Handle network error
  } else if (error.message === 'Authentication failed. Please log in again.') {
    // Handle authentication error
  } else {
    // Handle other errors
    console.error('API Error:', error.message)
  }
}
```

## Authentication Flow

### Login Process
1. User submits login credentials
2. Backend validates credentials and returns JWT token
3. Frontend stores token using `TokenManager.setToken()`
4. Subsequent API calls automatically include the token

### Token Refresh
1. API client detects 401 error
2. TokenManager clears expired tokens
3. User is redirected to login page
4. User logs in again to get new token

### Logout Process
1. User clicks logout
2. `TokenManager.clearAllTokens()` removes all tokens
3. User is redirected to login page

## Error Messages

### Common Error Messages
- **Network Error**: "Network error. Please check your connection."
- **Server Error**: "Server error. Please try again later."
- **Authentication Error**: "Authentication failed. Please log in again."
- **Not Found**: "Resource not found."
- **Validation Error**: "Invalid data provided."
- **Unknown Error**: "An unexpected error occurred."

## Security Considerations

### Token Security
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Tokens are automatically cleared on authentication errors
- Token expiration is checked before API calls

### API Security
- All API calls require authentication (except public endpoints)
- CORS is configured for localhost development
- HTTPS should be used in production

### Error Handling
- Sensitive information is not logged
- User-friendly error messages are displayed
- Detailed errors are logged for debugging

## Development Setup

### Prerequisites
1. Backend server running on `http://localhost:8080`
2. Node.js and npm installed
3. Environment variables configured

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing API Connection
1. Ensure backend server is running
2. Check browser console for API errors
3. Verify authentication token is being sent
4. Test API endpoints using browser dev tools

## Troubleshooting

### Common Issues

#### "Module not found: Can't resolve './client'"
- Ensure `src/lib/api/client.ts` exists
- Check import paths in API service files
- Verify file structure matches imports

#### "Network error" messages
- Check if backend server is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration on backend

#### Authentication errors
- Verify JWT token is valid
- Check token expiration
- Ensure token is being sent in headers

#### CORS errors
- Backend must allow requests from `http://localhost:3000`
- Check backend CORS configuration
- Verify request headers are allowed

### Debug Information
- Check browser Network tab for API requests
- Review browser Console for error messages
- Verify localStorage contains authentication tokens
- Check backend logs for server-side errors

## Production Considerations

### Environment Configuration
- Use HTTPS in production
- Configure proper CORS settings
- Set secure cookie options
- Use environment-specific API URLs

### Security Enhancements
- Implement token refresh mechanism
- Add rate limiting
- Use httpOnly cookies for tokens
- Implement proper session management

### Performance Optimization
- Add request caching
- Implement request deduplication
- Add request/response compression
- Monitor API performance metrics
