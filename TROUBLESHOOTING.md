# Troubleshooting Guide

## Common Issues and Solutions

### 1. CORS Error: "Access to XMLHttpRequest has been blocked by CORS policy"

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:8080/integrations' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Solution:**
1. **Ensure backend server is running:**
   ```bash
   cd github-go-agenticAI
   make server
   ```

2. **Check CORS configuration in backend:**
   - Verify `FRONTEND_URL` environment variable is set in backend `.env`
   - Default fallback is `http://localhost:3000`

3. **Test backend connectivity:**
   ```bash
   curl -X GET http://localhost:8080/
   ```

4. **Check environment variables:**
   ```bash
   # Backend .env should have:
   FRONTEND_URL=http://localhost:3000
   
   # Frontend .env.local should have:
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

### 2. Authentication Error: "Missing Token"

**Error Message:**
```
{"error":"Missing Token","message":"Authorization header is required","code":401}
```

**Solution:**
1. **Ensure user is logged in:**
   - Check if user is authenticated in the frontend
   - Verify access token is stored in localStorage

2. **Check authentication flow:**
   - Login through `/login` page
   - Verify tokens are properly stored

3. **Debug authentication:**
   - Open browser dev tools
   - Check localStorage for `accessToken`
   - Verify token is being sent in Authorization header

### 3. Network Error: "ERR_NETWORK"

**Error Message:**
```
AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK'}
```

**Solution:**
1. **Check if backend is running:**
   ```bash
   cd github-go-agenticAI
   make server
   ```

2. **Verify ports:**
   - Backend should be running on port 8080
   - Frontend should be running on port 3000

3. **Check firewall/network:**
   - Ensure no firewall blocking localhost connections
   - Try accessing backend directly: `http://localhost:8080`

### 4. OAuth Integration Issues

**Common Problems:**
1. **OAuth callback fails:**
   - Ensure OAuth apps are properly configured
   - Check callback URLs match exactly
   - Verify environment variables for OAuth credentials

2. **State parameter issues:**
   - Backend now uses user ID in state parameter
   - Ensure user is authenticated before OAuth flow

### 5. Database Connection Issues

**Error Message:**
```
Failed to connect to database
```

**Solution:**
1. **Start database:**
   ```bash
   cd github-go-agenticAI
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   make migrate
   ```

3. **Check database URL:**
   - Verify `DB_URL` in backend `.env`
   - Default: `postgres://root:secret@localhost:5444/agenticai?sslmode=disable`

## Debug Steps

### 1. Backend Debugging
```bash
cd github-go-agenticAI
make server
```

Check logs for:
- CORS configuration
- Database connection
- OAuth setup errors

### 2. Frontend Debugging
1. Open browser dev tools
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify localStorage has tokens

### 3. API Testing
```bash
# Test health endpoint
curl http://localhost:8080/

# Test CORS
curl -X OPTIONS http://localhost:8080/integrations \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Test authentication (should return 401)
curl -X GET http://localhost:8080/integrations \
  -H "Content-Type: application/json"
```

## Environment Variables Checklist

### Backend (.env)
```bash
DB_URL=postgres://root:secret@localhost:5444/agenticai?sslmode=disable
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=30
FRONTEND_URL=http://localhost:3000

# OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URL=http://localhost:8080/auth/github/callback

GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
GITLAB_REDIRECT_URL=http://localhost:8080/auth/gitlab/callback

BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
BITBUCKET_REDIRECT_URL=http://localhost:8080/auth/bitbucket/callback
```

### Frontend (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_REQUIRED=true
NEXT_PUBLIC_DEV_MODE=false
```

## Quick Fix Commands

```bash
# 1. Start database
cd github-go-agenticAI
docker-compose up -d

# 2. Run migrations
make migrate

# 3. Start backend
make server

# 4. In another terminal, start frontend
cd ../mistri-app
npm run dev
```

## Still Having Issues?

1. **Check all logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Ensure all services are running** (database, backend, frontend)
4. **Clear browser cache** and localStorage
5. **Restart all services** in the correct order
