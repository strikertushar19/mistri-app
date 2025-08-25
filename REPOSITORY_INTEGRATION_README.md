# Repository Integration for Mistri Chat

This document describes the repository integration features that allow users to fetch and analyze repositories from GitHub, GitLab, and Bitbucket directly within the chat interface.

## 🚀 Features

### Repository Tools Panel
- **Floating Repository Tools**: A collapsible panel accessible via a floating button in the chat interface
- **Multi-Provider Support**: Fetch repositories from GitHub, GitLab, and Bitbucket
- **Tabbed Interface**: Easy switching between different providers
- **Real-time Data**: Live repository and organization data from connected accounts

### Repository Display
- **Repository Listings**: View all repositories with key information
- **Organization Support**: Display organizations/workspaces/groups
- **Repository Details**: Name, description, language, stars, forks, last updated
- **Privacy Indicators**: Visual indicators for public/private repositories
- **External Links**: Direct links to repository pages

### Chat Integration
- **Context Selection**: Click repositories/organizations to add them to chat context
- **Selected Context Display**: Visual indicator of selected repositories in chat
- **Repository Analysis Template**: Special prompt template for repository analysis
- **Smart Templates**: Repository analysis template only appears when repositories are selected

## 📁 File Structure

```
src/
├── lib/
│   └── api/
│       └── repositories.ts          # Repository API functions
├── components/
│   └── chat/
│       ├── repository-display.tsx   # Repository display component
│       ├── repository-tools.tsx     # Repository tools panel
│       └── chat-interface.tsx       # Updated chat interface
└── test-repository-apis.js          # API testing script
```

## 🔧 API Endpoints

The integration uses the following backend API endpoints:

- `GET /repositories/github` - Fetch GitHub repositories and organizations
- `GET /repositories/gitlab` - Fetch GitLab repositories and groups  
- `GET /repositories/bitbucket` - Fetch Bitbucket repositories and workspaces

### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 30, max: 100)

### Response Format

The API can return two types of responses:

#### 1. Repository Response (when integration exists)
```typescript
interface RepositoryResponse {
  repositories: Repository[]
  organizations: Organization[]
  total: number
  page: number
  per_page: number
}
```

#### 2. No Integration Response (when account not connected)
```typescript
interface NoIntegrationResponse {
  integration: false
  message: string  // e.g., "Please integrate your GitHub account"
}
```

**Note**: When no integration is found, the API returns a 200 status with the no-integration message instead of a 404 error.

### Error Handling

The frontend handles different response types gracefully:

- **No Integration**: Shows a "Connect Account" button that redirects to settings
- **Authentication Expired**: Shows a "Go to Settings" button for reconnection
- **Other Errors**: Shows a "Retry" button to attempt the request again

All error states are displayed with appropriate action buttons to help users resolve issues.

## 🎯 Usage

### 1. Access Repository Tools
- Click the floating repository button (📁) in the bottom-right corner of the chat interface
- The repository tools panel will expand

### 2. Browse Repositories
- Switch between GitHub, GitLab, and Bitbucket tabs
- View repositories and organizations from each provider
- Use "Load More" to fetch additional repositories

### 3. Select Context
- Click on any repository to add it to your chat context
- Click on any organization to add it to your chat context
- Selected items appear in the chat area as context

### 4. Analyze Repositories
- When repositories are selected, a "Repository Analysis" template becomes available
- Use the template to get AI insights about your selected repositories

## 🔐 Authentication

The repository APIs require authentication. Make sure:
1. Users are logged in with valid authentication tokens
2. Users have connected their GitHub, GitLab, and/or Bitbucket accounts
3. The backend server is running and accessible

## 🧪 Testing

Use the provided test script to verify API functionality:

```bash
# Edit the test script to add your auth token
node test-repository-apis.js
```

## 🎨 UI Components

### RepositoryDisplay
- Displays repositories and organizations for a specific provider
- Handles loading states and error messages
- Supports pagination with "Load More" functionality
- Shows repository metadata (language, stars, forks, etc.)

### RepositoryTools
- Floating panel with tabbed interface
- Collapsible design for better UX
- Provider-specific icons and styling
- Integration with chat context selection

### ChatInterface Updates
- Added repository context display
- Enhanced prompt templates with repository analysis
- Repository selection state management

## 🔄 State Management

The chat interface manages:
- `selectedRepositories`: Array of selected repositories
- `selectedOrganizations`: Array of selected organizations
- Repository selection/deselection logic
- Context display in chat area

## 🚨 Error Handling

- Network errors are caught and displayed to users
- API errors show meaningful error messages
- Loading states provide user feedback
- Graceful degradation when providers are unavailable

## 🔮 Future Enhancements

Potential improvements:
- Repository search and filtering
- Repository cloning and analysis
- Code review integration
- Repository comparison tools
- Advanced repository metrics
- Integration with code analysis tools

## 📝 Notes

- The integration requires the backend repository APIs to be implemented and working
- Users must have valid OAuth connections to their Git providers
- The floating panel design ensures it doesn't interfere with chat functionality
- Repository context is maintained during the chat session
