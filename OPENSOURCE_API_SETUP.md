# Open Source API Setup Guide

This guide explains how to set up API integrations for the Open Source section of Mistri.

## 🔑 Required API Keys

### 1. GitHub API
- **Required**: No (works without token, but limited)
- **Get Token**: https://github.com/settings/tokens (optional, for higher limits)
- **Scopes Needed**: `public_repo`, `read:user` (if using token)
- **Rate Limit**: 5,000 requests/hour (with token), 60/hour (without token)
- **Note**: Works great without token for basic usage!

### 2. Docker Hub API
- **Required**: No (but recommended for better rate limits)
- **Get Token**: https://hub.docker.com/settings/security
- **Rate Limit**: 100 requests/hour

### 3. Hugging Face API
- **Required**: No (public access available)
- **Get Token**: https://huggingface.co/settings/tokens
- **Rate Limit**: No strict limits

### 4. NPM API
- **Required**: No (public access)
- **Rate Limit**: 1,000 requests/hour

### 5. Ollama API
- **Required**: No (local installation)
- **Setup**: Install Ollama locally
- **Rate Limit**: None (local)

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# GitHub API
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here

# Docker Hub API (optional)
NEXT_PUBLIC_DOCKER_TOKEN=your_docker_token_here

# Hugging Face API (optional)
NEXT_PUBLIC_HUGGINGFACE_TOKEN=your_huggingface_token_here
```

### 2. GitHub API Setup

**Option A: Without Token (Recommended for testing)**
- No setup required! GitHub API works without authentication
- Rate limit: 60 requests per hour
- Perfect for basic usage and testing

**Option B: With Token (For production use)**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `public_repo` - Access public repositories
   - `read:user` - Read user profile data
4. Copy the token and add it to your `.env.local` file
5. Rate limit: 5,000 requests per hour (83x more!)

### 3. Docker Hub API Setup

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Give it a name and select "Read" permissions
4. Copy the token and add it to your `.env.local` file

### 4. Hugging Face API Setup

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Select "Read" access
4. Copy the token and add it to your `.env.local` file

### 5. Ollama Setup

1. Install Ollama from https://ollama.ai/
2. Start Ollama service:
   ```bash
   ollama serve
   ```
3. Pull some models:
   ```bash
   ollama pull llama2:7b
   ollama pull codellama:13b
   ```

## 📊 API Features

### GitHub API
- ✅ Search repositories
- ✅ Get trending repositories
- ✅ Repository details and statistics
- ✅ Language filtering
- ✅ Star and fork counts

### Hugging Face API
- ✅ List models
- ✅ List datasets
- ✅ Search functionality
- ✅ Model details and statistics
- ✅ Task-based filtering

### Docker Hub API
- ✅ Search container images
- ✅ Image details and statistics
- ✅ Official image verification
- ✅ Pull count and star count

### NPM API
- ✅ Search packages
- ✅ Package details and statistics
- ✅ Download counts
- ✅ Version information
- ✅ Dependency analysis

### Ollama API
- ✅ List available models
- ✅ Model management (pull, run, stop)
- ✅ Local model status
- ✅ Performance metrics

## 🔧 Configuration

### Rate Limiting
The app includes built-in rate limiting to respect API limits:

```typescript
// Default rate limits per hour
const rateLimits = {
  github: 5000,      // requests per hour
  huggingface: 1000, // requests per hour
  docker: 100,       // requests per hour
  npm: 1000,         // requests per hour
  ollama: Infinity   // local, no limit
}
```

### Caching
API responses are cached for 5 minutes by default to reduce API calls:

```typescript
// Cache configuration
const cacheConfig = {
  ttl: 300000, // 5 minutes in milliseconds
  maxSize: 100 // maximum cached items
}
```

### Error Handling
The app includes comprehensive error handling:

- **Rate Limit Exceeded**: Automatic retry with exponential backoff
- **Network Errors**: Graceful fallback to demo data
- **API Errors**: User-friendly error messages
- **Timeout Handling**: Configurable timeouts for each service

## 🚨 Troubleshooting

### Common Issues

1. **GitHub API Rate Limited**
   - Solution: Add a GitHub token to increase rate limit
   - Check: Ensure token has correct scopes

2. **Docker Hub API Errors**
   - Solution: Add a Docker Hub token
   - Alternative: Use without token (limited functionality)

3. **Ollama Not Available**
   - Solution: Install and start Ollama locally
   - Check: Ensure Ollama is running on port 11434

4. **Hugging Face API Slow**
   - Solution: Add Hugging Face token for better performance
   - Alternative: Use without token (slower but functional)

### Debug Mode

Enable debug mode to see API calls:

```typescript
// In your component
const [debugMode, setDebugMode] = useState(false)

// Log API calls
if (debugMode) {
  console.log('API Call:', { service, endpoint, params })
}
```

## 📈 Performance Optimization

### 1. Caching Strategy
- **Short-term cache**: 5 minutes for search results
- **Long-term cache**: 1 hour for static data
- **Invalidation**: Manual cache clear on user action

### 2. Request Batching
- **Batch requests**: Combine multiple API calls
- **Parallel requests**: Use Promise.all for independent calls
- **Debouncing**: Delay search requests to reduce API calls

### 3. Fallback Data
- **Demo data**: Always available when APIs fail
- **Progressive enhancement**: Start with demo, enhance with real data
- **Graceful degradation**: Show partial data when possible

## 🔒 Security Considerations

### 1. API Key Security
- **Environment variables**: Never commit API keys to code
- **Client-side exposure**: Only use public APIs on client-side
- **Token rotation**: Regularly rotate API keys

### 2. Rate Limiting
- **Respect limits**: Always respect API rate limits
- **Exponential backoff**: Implement retry logic with backoff
- **User feedback**: Show rate limit status to users

### 3. Data Privacy
- **No sensitive data**: Only fetch public information
- **User consent**: Inform users about data collection
- **Data retention**: Don't store unnecessary data

## 🚀 Future Enhancements

### Planned Features
- [ ] **Real-time updates**: WebSocket connections for live data
- [ ] **Advanced filtering**: More sophisticated search and filter options
- [ ] **Favorites**: Save favorite repositories, models, and packages
- [ ] **Notifications**: Get notified about updates and new releases
- [ ] **Analytics**: Track usage and popular items
- [ ] **Export functionality**: Export search results and favorites

### API Improvements
- [ ] **GraphQL support**: More efficient data fetching
- [ ] **Webhook integration**: Real-time updates from services
- [ ] **Batch operations**: Bulk operations for better performance
- [ ] **Custom endpoints**: Proxy APIs for better rate limiting

## 📚 Additional Resources

### API Documentation
- [GitHub API](https://docs.github.com/en/rest)
- [Hugging Face API](https://huggingface.co/docs/api-inference)
- [Docker Hub API](https://docs.docker.com/docker-hub/api/)
- [NPM API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)

### Rate Limit Information
- [GitHub Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Docker Hub Rate Limits](https://docs.docker.com/docker-hub/api/#rate-limiting)
- [NPM Rate Limits](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#rate-limiting)

### Community
- [GitHub Community](https://github.com/community)
- [Hugging Face Community](https://huggingface.co/community)
- [Docker Community](https://www.docker.com/community)
- [NPM Community](https://www.npmjs.com/community)
