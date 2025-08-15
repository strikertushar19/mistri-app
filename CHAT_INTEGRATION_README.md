# Chat Integration with Conversation Management

## Overview

The Mistri app now features a complete AI chat system with conversation management, integrating with the backend conversation and chat APIs. Users can have persistent conversations with AI models, manage their chat history, and use repository context for enhanced code analysis.

## Features

### 🤖 **AI Chat Capabilities**
- **Multi-Model Support**: Choose from 20+ AI models across 4 providers
- **Real-time Chat**: Send messages and get AI responses instantly
- **Cost Tracking**: See the cost of each AI interaction
- **Model Selection**: Easy switching between different AI models

### 💬 **Conversation Management**
- **Persistent Conversations**: All chats are saved and can be resumed
- **Conversation History**: Browse and search through past conversations
- **Message Editing**: Edit your messages after sending
- **Message Deletion**: Remove individual messages from conversations
- **Conversation Actions**: Archive, duplicate, and delete conversations

### 📁 **Repository Integration**
- **Context Awareness**: Include selected repositories in AI conversations
- **Repository Analysis**: Specialized prompts for codebase analysis
- **Organization Support**: Read-only organization context

### 🎨 **User Interface**
- **Modern Chat Interface**: Clean, responsive design with message bubbles
- **History Sidebar**: Toggle conversation history panel
- **Model Selector**: Visual model selection with cost/speed indicators
- **Template System**: Quick access to common analysis prompts

## Components

### Core Components

#### `ChatInterface`
The main chat component that handles:
- Message sending and receiving
- Conversation loading and management
- Repository context integration
- Model selection
- History sidebar toggle

#### `ConversationHistory`
Sidebar component for managing conversations:
- List all user conversations
- Search and filter conversations
- Archive/unarchive conversations
- Duplicate conversations
- Delete conversations

#### `ChatMessage`
Individual message component with:
- User/Assistant message display
- Message editing capabilities
- Message deletion
- Copy to clipboard
- Cost and metadata display

#### `ModelSelector`
AI model selection component with:
- Provider grouping (OpenAI, Anthropic, DeepSeek, Google)
- Cost indicators (💵 💰 💎)
- Speed indicators (⚡ 🏃 🐌)
- Visual model names

### API Integration

#### `conversationsApi`
Handles all conversation-related operations:
```typescript
// Get conversations with pagination and filtering
getConversations(params?: {
  page?: number
  per_page?: number
  search?: string
  archived?: boolean
})

// Create new conversation
createConversation(data: CreateConversationRequest)

// Get specific conversation
getConversation(id: string)

// Update conversation
updateConversation(id: string, data: UpdateConversationRequest)

// Archive/unarchive conversation
archiveConversation(id: string, archive: boolean)

// Duplicate conversation
duplicateConversation(id: string)

// Delete conversation
deleteConversation(id: string)

// Message operations
createMessage(conversationId: string, data: CreateMessageRequest)
getMessages(conversationId: string, params?: { page?: number, per_page?: number })
updateMessage(messageId: string, data: UpdateMessageRequest)
deleteMessage(messageId: string)
```

#### `chatApi`
Handles AI chat operations:
```typescript
// Get available AI models
getAvailableModels(): Promise<ModelInfo[]>

// Send message to AI
sendMessage(data: ChatRequest): Promise<ChatResponse>
```

## Usage

### Starting a New Conversation

1. Navigate to `/chat`
2. Select an AI model from the model selector
3. Type your message or use a template
4. Click send or press Enter

### Continuing a Conversation

1. Click the history icon in the chat header
2. Select a conversation from the sidebar
3. Continue chatting with full context

### Using Repository Context

1. Click "Add Repos" to open repository tools
2. Select repositories from GitHub, GitLab, or Bitbucket
3. Use repository analysis templates for code-specific questions

### Managing Conversations

#### From History Sidebar:
- **Search**: Use the search bar to find conversations
- **Filter**: Toggle between active and archived conversations
- **Actions**: Use the three-dot menu for each conversation:
  - Archive/Unarchive
  - Duplicate
  - Delete

#### From Chat Interface:
- **Edit Messages**: Click the edit icon on your messages
- **Delete Messages**: Click the delete icon on any message
- **Copy Messages**: Click the copy icon to copy message content

## Navigation

### History Icon
- **Location**: Chat header (left side)
- **Function**: Toggle conversation history sidebar
- **Alternative**: Use `/history` page for full-screen history view

### New Conversation
- **Location**: Chat header (right side)
- **Function**: Start a new conversation
- **Shortcut**: Navigate to `/chat` without conversation parameter

## URL Structure

### Chat Pages
- `/chat` - New conversation
- `/chat?conversation=<id>` - Load specific conversation
- `/history` - Full conversation history page

### Navigation Integration
- **History Icon**: Added to main navigation sidebar
- **Chat Icon**: Existing chat navigation
- **Seamless Navigation**: Click history items to load conversations

## AI Models

### Available Models

#### OpenAI
- `gpt-4o-mini` - Fast and cost-effective
- `gpt-4o` - Most capable GPT-4 model
- `gpt-4` - Standard GPT-4
- `gpt-3.5-turbo` - Fast and reliable

#### Anthropic
- `claude-3-7-sonnet-latest` - Latest Claude 3.7 Sonnet
- `claude-3-5-sonnet-latest` - Latest Claude 3.5 Sonnet
- `claude-3-opus-20240229` - Most capable Claude 3 Opus
- `claude-3-haiku-20240307` - Fast Claude 3 Haiku
- And 8 more Claude models...

#### DeepSeek
- `deepseek-chat` - General purpose chat
- `deepseek-coder` - Code-focused model

#### Google
- `gemini-1.5-flash` - Fast and efficient (default)
- `gemini-2.0-flash-lite` - Ultra-fast, lightweight
- `gemini-2.0-flash` - Balanced performance
- `gemini-2.5-flash` - Latest flash model
- `gemini-2.5-pro` - Most capable model

### Model Selection Indicators

#### Cost Indicators
- 💵 **Cheap**: Haiku, GPT-3.5, Gemini Flash Lite
- 💰 **Medium**: Sonnet, GPT-4, Gemini Flash
- 💎 **Expensive**: Opus, GPT-4o, Gemini Pro

#### Speed Indicators
- ⚡ **Fast**: Flash, Haiku, GPT-3.5 models
- 🏃 **Medium**: Sonnet, GPT-4o models
- 🐌 **Slow**: Opus, GPT-4, Pro models

## Templates

### Analysis Templates
1. **Code Review** - Review code for best practices and bugs
2. **Architecture Analysis** - Analyze codebase architecture
3. **Performance Audit** - Conduct performance analysis
4. **Security Review** - Review for security vulnerabilities
5. **Documentation** - Generate comprehensive documentation
6. **Testing Strategy** - Suggest testing approaches
7. **Refactoring** - Identify refactoring opportunities
8. **Dependency Analysis** - Analyze dependencies
9. **Repository Analysis** - Analyze selected repositories (context-aware)

## Error Handling

### Common Scenarios
- **API Key Missing**: Shows error when AI provider API key is not configured
- **Network Errors**: Graceful handling of connection issues
- **Invalid Models**: Validation of model selection
- **Conversation Not Found**: Redirects to new conversation
- **Message Errors**: Retry mechanisms for failed operations

### User Feedback
- **Loading States**: Spinners and progress indicators
- **Error Messages**: Clear error descriptions
- **Success Feedback**: Visual confirmation of actions
- **Disabled States**: Proper button states during operations

## Performance

### Optimizations
- **Lazy Loading**: Conversations loaded on demand
- **Pagination**: Efficient message loading
- **Caching**: Conversation data caching
- **Debounced Search**: Efficient conversation search
- **Virtual Scrolling**: For large message lists (future)

### Responsive Design
- **Mobile Friendly**: Works on all screen sizes
- **Touch Support**: Optimized for touch interactions
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions

## Security

### Data Protection
- **JWT Authentication**: All API calls require authentication
- **User Isolation**: Users can only access their own conversations
- **Input Validation**: All user inputs are validated
- **XSS Protection**: Sanitized message content

### Privacy
- **No Data Logging**: Sensitive data is not logged
- **Secure Storage**: Conversations stored securely in database
- **API Key Security**: Keys stored in environment variables

## Future Enhancements

### Planned Features
- [ ] **Streaming Responses**: Real-time message streaming
- [ ] **File Uploads**: Support for code file uploads
- [ ] **Code Highlighting**: Syntax highlighting in messages
- [ ] **Export Conversations**: Export chat history
- [ ] **Conversation Sharing**: Share conversations with others
- [ ] **Advanced Search**: Full-text search across conversations
- [ ] **Conversation Templates**: Save and reuse conversation starters
- [ ] **Voice Input**: Voice-to-text message input
- [ ] **Multi-language Support**: Internationalization
- [ ] **Dark/Light Mode**: Theme switching

### Technical Improvements
- [ ] **WebSocket Support**: Real-time updates
- [ ] **Offline Support**: Work without internet connection
- [ ] **Push Notifications**: New message notifications
- [ ] **Advanced Analytics**: Usage statistics and insights
- [ ] **Performance Monitoring**: Real-time performance tracking

## Troubleshooting

### Common Issues

#### "Failed to load conversation"
- Check if the conversation ID is valid
- Verify user authentication
- Check network connection

#### "AI model not responding"
- Verify API keys are configured
- Check model availability
- Review rate limits

#### "Message not sending"
- Check network connection
- Verify authentication token
- Review message content length

#### "History not loading"
- Check authentication status
- Verify API endpoint availability
- Review browser console for errors

### Debug Information
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Monitor API requests
- **Application State**: Use React DevTools for state inspection
- **API Logs**: Check backend logs for server errors

## Integration Points

### Backend APIs
- **Conversation API**: `/api/conversations/*`
- **Chat API**: `/api/chat/*`
- **Authentication**: JWT-based auth middleware

### Frontend Routes
- **Chat**: `/chat` and `/chat?conversation=<id>`
- **History**: `/history`
- **Navigation**: Updated sidebar with history icon

### External Services
- **AI Providers**: OpenAI, Anthropic, DeepSeek, Google
- **Repository APIs**: GitHub, GitLab, Bitbucket
- **Authentication**: JWT token management

This integration provides a complete, production-ready chat system with full conversation management capabilities, making it easy for users to have persistent, contextual conversations with AI models about their codebases.
