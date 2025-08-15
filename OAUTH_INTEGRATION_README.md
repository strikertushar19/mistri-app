# OAuth Integration Setup

This document explains how to set up OAuth integrations for GitHub, GitLab, and Bitbucket in the Mistri application.

## Backend Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file in the `github-go-agenticAI` directory:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URL=http://localhost:8080/auth/github/callback

# GitLab OAuth
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
GITLAB_REDIRECT_URL=http://localhost:8080/auth/gitlab/callback

# BitBucket OAuth
BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
BITBUCKET_REDIRECT_URL=http://localhost:8080/auth/bitbucket/callback
```

### 2. OAuth Application Setup

#### GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Mistri
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8080/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file

#### GitLab OAuth App
1. Go to GitLab > User Settings > Applications
2. Click "Add new application"
3. Fill in the details:
   - **Name**: Mistri
   - **Redirect URI**: `http://localhost:8080/auth/gitlab/callback`
   - **Scopes**: `read_user`, `read_api`, `read_repository`
4. Copy the Application ID and Secret to your `.env` file

#### Bitbucket OAuth App
1. Go to Bitbucket Settings > OAuth consumers
2. Click "Add consumer"
3. Fill in the details:
   - **Name**: Mistri
   - **Callback URL**: `http://localhost:8080/auth/bitbucket/callback`
   - **Permissions**: Account (Read), Repositories (Read)
4. Copy the Key and Secret to your `.env` file

## Frontend Integration

### 1. Code Providers Page

The code providers page (`/code-providers`) now includes:

- **Authentication required**: Users must be logged in to access integrations
- **Real-time integration status**: Shows which providers are connected
- **OAuth flow**: Redirects to provider OAuth pages (requires authentication)
- **Success feedback**: Shows success messages after OAuth completion
- **Disconnect functionality**: Allows users to disconnect integrations
- **Error handling**: Proper error messages for authentication failures

### 2. API Integration

The frontend uses the following API endpoints (all require authentication):

- `GET /integrations` - Get all user integrations
- `DELETE /integrations/{provider}/disconnect` - Disconnect a provider
- `GET /auth/{provider}` - Initiate OAuth flow (requires authentication)
- `GET /auth/{provider}/callback` - Handle OAuth callback

### 3. Features

#### Connected State
- Shows green checkmark for connected providers
- Displays connected username
- Shows "Disconnect" button instead of "Connect"

#### Loading States
- Loading spinner while fetching integrations
- Disabled buttons during connection/disconnection
- Success/error toast notifications

#### OAuth Flow
1. User must be logged in (authentication required)
2. User clicks "Connect" button
3. Backend validates user authentication
4. Redirected to provider OAuth page with user ID in state parameter
5. User authorizes the application
6. Redirected back to `/code-providers?success=true&provider={provider}`
7. Integration status updates automatically

## Database Schema

The following tables store integration data:

### github_integrations
- `id`: UUID primary key
- `user_id`: UUID foreign key to users table
- `access_token`: OAuth access token
- `refresh_token`: OAuth refresh token (optional)
- `username`: GitHub username
- `email`: GitHub email
- `avatar_url`: GitHub avatar URL
- `is_active`: Integration status
- `created_at`, `updated_at`: Timestamps

### gitlab_integrations
- Same structure as github_integrations

### bitbucket_integrations
- Same structure as github_integrations

## Security Features

- **Protected routes**: All integration endpoints require authentication
- **Token storage**: Access tokens are stored securely in the database
- **User isolation**: Users can only access their own integrations
- **Cascade deletion**: Integrations are deleted when users are deleted

## Development Workflow

1. **Set up OAuth apps** in each provider
2. **Add environment variables** to backend `.env`
3. **Run migrations** to create integration tables
4. **Start backend server** with `make server`
5. **Start frontend** with `npm run dev`
6. **Test OAuth flow** by visiting `/code-providers`

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure the callback URL in your OAuth app matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found"**
   - Verify environment variables are loaded correctly
   - Check that the backend server has been restarted

3. **"Authorization failed"**
   - Ensure the user is authenticated before accessing OAuth endpoints
   - Check that the AuthMiddleware is working correctly

4. **"Database connection error"**
   - Verify the database is running and accessible
   - Check that migrations have been applied

### Debug Mode

Enable debug logging by setting the log level in your backend:

```bash
export LOG_LEVEL=debug
```

This will show detailed OAuth flow information in the server logs.
