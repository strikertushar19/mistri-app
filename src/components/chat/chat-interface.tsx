"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ArrowRight, X, History, Plus, Loader2, Database } from "lucide-react"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RepositoryTools } from "./repository-tools"
import { Repository, Organization } from "@/lib/api/repositories"
import { ConversationHistory } from "./conversation-history"
import { ChatMessage } from "./chat-message"
import { ModelSelector } from "./model-selector"
import { conversationsApi, Conversation, Message } from "@/lib/api/conversations"
import { chatApi, ChatRequest } from "@/lib/api/chat"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Chat Header Component
interface ChatHeaderProps {
  currentConversation: Conversation | null
  messages: Message[]
  selectedModel: string
  onModelSelect: (model: string) => void
  onCreateNewConversation: () => void
  onToggleHistory: () => void
  showHistory: boolean
}

export function ChatHeader({
  currentConversation,
  messages,
  selectedModel,
  onModelSelect,
  onCreateNewConversation,
  onToggleHistory,
  showHistory
}: ChatHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleHistory}
          className="h-8 w-8 p-0"
        >
          <History className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {currentConversation?.title || "New Conversation"}
          </h2>
          {currentConversation && (
            <p className="text-sm text-[var(--text-secondary)]">
              {messages.length} messages
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ModelSelector
          selectedModel={selectedModel}
          onModelSelect={onModelSelect}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateNewConversation}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
    </>
  )
}

interface ChatInterfaceProps {
  renderHeader?: (headerContent: React.ReactNode) => void
}

export function ChatInterface({ renderHeader }: ChatInterfaceProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash")
  const [systemMessage, setSystemMessage] = useState("You are a helpful AI assistant specialized in programming and software development.")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // State for conversation management
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  // Repository context
  const [selectedRepositories, setSelectedRepositories] = useState<Repository[]>([])
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([])

  // Get conversation ID from URL params
  const conversationId = searchParams.get('conversation')

  // Load conversation on mount or when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    } else {
      // New conversation
      setCurrentConversation(null)
      setMessages([])
    }
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Render header content when it changes
  useEffect(() => {
    if (renderHeader) {
      const headerContent = (
        <ChatHeader
          currentConversation={currentConversation}
          messages={messages}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          onCreateNewConversation={createNewConversation}
          onToggleHistory={() => setShowHistory(!showHistory)}
          showHistory={showHistory}
        />
      )
      renderHeader(headerContent)
    }
  }, [currentConversation, messages, selectedModel, showHistory, renderHeader])

  const loadConversation = async (id: string) => {
    try {
      setLoading(true)
      const conversation = await conversationsApi.getConversation(id)
      setCurrentConversation(conversation)
      
      // Load messages separately
      const messageResponse = await conversationsApi.getMessages(id)
      setMessages(messageResponse.messages)
    } catch (error) {
      console.error("Failed to load conversation:", error)
      // Redirect to new conversation if loading fails
      router.push('/chat')
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
    router.push('/chat')
  }

  const handleConversationSelect = (conversation: Conversation) => {
    router.push(`/chat?conversation=${conversation.id}`)
    setShowHistory(false)
  }

  // Prompt templates for quick access
  const promptTemplates = [
    { label: "Code Review", prompt: "Please review this code for best practices, potential bugs, and improvements:" },
    { label: "Architecture Analysis", prompt: "Analyze the architecture of this codebase and suggest improvements:" },
    { label: "Performance Audit", prompt: "Conduct a performance audit of this code and suggest optimizations:" },
    { label: "Security Review", prompt: "Review this code for security vulnerabilities and best practices:" },
    { label: "Documentation", prompt: "Generate comprehensive documentation for this code:" },
    { label: "Testing Strategy", prompt: "Suggest a testing strategy for this codebase:" },
    { label: "Refactoring", prompt: "Suggest refactoring opportunities for this code:" },
    { label: "Dependency Analysis", prompt: "Analyze the dependencies and suggest improvements:" },
    { label: "Repository Analysis", prompt: "Analyze the selected repositories and provide insights about the codebase structure, technologies used, and potential improvements:" }
  ]

  const handleTemplateSelect = (prompt: string, label: string) => {
    setContent(prompt)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() || sending) return

    try {
      setSending(true)
      
      // Prepare chat request
      const chatRequest: ChatRequest = {
        conversation_id: currentConversation?.id,
        message: content,
        system_message: systemMessage,
        model: selectedModel,
        max_tokens: 1024,
        repositories: selectedRepositories.length > 0 ? selectedRepositories : undefined,
        organizations: selectedOrganizations.length > 0 ? selectedOrganizations : undefined
      }

      // Send message to AI
      const response = await chatApi.sendMessage(chatRequest)
      
      // Update conversation and messages
      if (!currentConversation) {
        // Load the new conversation
        await loadConversation(response.conversation_id)
      } else {
        // Reload messages for existing conversation
        const messageResponse = await conversationsApi.getMessages(currentConversation.id)
        setMessages(messageResponse.messages)
      }

      setContent("")
    } catch (error) {
      console.error("Failed to send message:", error)
      // You might want to show an error toast here
    } finally {
      setSending(false)
    }
  }

  const handleMessageEdit = async (messageId: string, newContent: string) => {
    try {
      await conversationsApi.updateMessage(messageId, { content: newContent })
      // Reload messages to get updated content
      if (currentConversation) {
        const messageResponse = await conversationsApi.getMessages(currentConversation.id)
        setMessages(messageResponse.messages)
      }
    } catch (error) {
      console.error("Failed to edit message:", error)
    }
  }

  const handleMessageDelete = async (messageId: string) => {
    try {
      await conversationsApi.deleteMessage(messageId)
      // Reload messages to get updated list
      if (currentConversation) {
        const messageResponse = await conversationsApi.getMessages(currentConversation.id)
        setMessages(messageResponse.messages)
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const handleRepositorySelect = (repo: Repository) => {
    setSelectedRepositories(prev => {
      const exists = prev.find(r => r.id === repo.id && r.full_name === repo.full_name)
      if (exists) {
        return prev.filter(r => !(r.id === repo.id && r.full_name === repo.full_name))
      }
      return [...prev, repo]
    })
  }

  const handleOrganizationSelect = (org: Organization) => {
    setSelectedOrganizations(prev => {
      const exists = prev.find(o => o.id === org.id && o.login === org.login)
      if (exists) {
        return prev.filter(o => !(o.id === org.id && o.login === org.login))
      }
      return [...prev, org]
    })
  }

  const clearAllContext = () => {
    setSelectedRepositories([])
    setSelectedOrganizations([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading conversation...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] flex">
      {/* Conversation History Sidebar */}
      {showHistory && (
        <div className="w-80 border-r border-[var(--border-light)] bg-[var(--bg-secondary)]">
          <ConversationHistory
            currentConversationId={currentConversation?.id}
            onConversationSelect={handleConversationSelect}
            onNewConversation={createNewConversation}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="text-center text-muted-foreground mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">Start a conversation</h2>
                <p className="text-sm">Ask me anything about your codebase or project</p>
              </div>
              
              {/* Selected Repositories and Organizations */}
              {(selectedRepositories.length > 0 || selectedOrganizations.length > 0) && (
                <div className="w-full max-w-4xl">
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">Selected Context:</h3>
                    <Button
                      onClick={clearAllContext}
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      title="Clear all context"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  {/* Repositories Grid */}
                  {selectedRepositories.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-[var(--text-secondary)] mb-2 text-center">Repositories ({selectedRepositories.length})</p>
                      <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                        {selectedRepositories.map((repo, index) => (
                          <div 
                            key={index} 
                            className="text-xs text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-light)] px-2 py-1 rounded truncate hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer"
                            title={repo.full_name}
                            onClick={() => handleRepositorySelect(repo)}
                          >
                            {repo.full_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Organizations Grid - Read Only */}
                  {selectedOrganizations.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-2 text-center">Organizations ({selectedOrganizations.length}) - Read Only</p>
                      <div className="grid grid-cols-5 gap-2 max-h-16 overflow-y-auto">
                        {selectedOrganizations.map((org, index) => (
                          <div 
                            key={index} 
                            className="text-xs text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-light)] px-2 py-1 rounded truncate opacity-75"
                            title={`${org.name} (Read Only)`}
                          >
                            {org.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onEdit={handleMessageEdit}
                  onDelete={handleMessageDelete}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--border-light)] bg-[var(--bg-primary)] p-4">
          <div className="max-w-4xl mx-auto">
            {/* Template Dropdown */}
            <div className="mb-4 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="group relative bg-[var(--bg-elevated-secondary)] border border-token-border-light hover:bg-[var(--interactive-bg-secondary-hover)] hover:border-token-border-light text-[var(--text-primary)] transition-all duration-200 ease-out shadow-sm hover:shadow-md rounded-lg px-3 py-2 font-medium text-sm"
                  >
                    <ChevronDown size={14} className="mr-2 transition-transform duration-200 group-hover:rotate-180" />
                    Quick Templates
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-64 p-1 bg-[var(--bg-elevated-secondary)] border border-token-border-light shadow-lg rounded-xl animate-in slide-in-from-top-2 duration-200" 
                  align="start"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    Analysis Templates
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="h-px bg-token-border-light my-1" />
                  
                  <DropdownMenuGroup>
                    {promptTemplates.slice(0, 4).map((template, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleTemplateSelect(template.prompt, template.label)}
                        className="group cursor-pointer mx-1 my-0.5 px-3 py-2.5 rounded-lg text-[var(--text-primary)] text-sm hover:bg-[var(--interactive-bg-secondary-hover)] focus:bg-[var(--interactive-bg-secondary-hover)] transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-base opacity-70">
                            {index === 0 ? '⚙️' : index === 1 ? '🏗️' : index === 2 ? '📋' : '🎨'}
                          </span>
                          <span className="font-medium">{template.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="h-px bg-token-border-light my-1" />
                  
                  <DropdownMenuGroup>
                    {promptTemplates.slice(4, 8).map((template, index) => (
                      <DropdownMenuItem
                        key={index + 4}
                        onClick={() => handleTemplateSelect(template.prompt, template.label)}
                        className="group cursor-pointer mx-1 my-0.5 px-3 py-2.5 rounded-lg text-[var(--text-primary)] text-sm hover:bg-[var(--interactive-bg-secondary-hover)] focus:bg-[var(--interactive-bg-secondary-hover)] transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-base opacity-70">
                            {index === 0 ? '🔍' : index === 1 ? '📊' : index === 2 ? '⚡' : '🛡️'}
                          </span>
                          <span className="font-medium">{template.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  
                  {/* Repository Analysis Template - Only show when repositories are selected */}
                  {selectedRepositories.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="h-px bg-token-border-light my-1" />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => handleTemplateSelect(promptTemplates[8].prompt, promptTemplates[8].label)}
                          className="group cursor-pointer mx-1 my-0.5 px-3 py-2.5 rounded-lg text-[var(--text-primary)] text-sm hover:bg-[var(--interactive-bg-secondary-hover)] focus:bg-[var(--interactive-bg-secondary-hover)] transition-colors duration-150"
                        >
                          <div className="flex items-center">
                            <span className="mr-3 text-base opacity-70">📁</span>
                            <span className="font-medium">{promptTemplates[8].label}</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Repository Context Indicator */}
            {(selectedRepositories.length > 0 || selectedOrganizations.length > 0) && (
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>Context:</span>
                </div>
                {selectedRepositories.length > 0 && (
                  <span className="bg-[var(--bg-secondary)] px-2 py-1 rounded">
                    {selectedRepositories.length} repo{selectedRepositories.length !== 1 ? 's' : ''}
                  </span>
                )}
                {selectedOrganizations.length > 0 && (
                  <span className="bg-[var(--bg-secondary)] px-2 py-1 rounded">
                    {selectedOrganizations.length} org{selectedOrganizations.length !== 1 ? 's' : ''}
                  </span>
                )}
                <Button
                  onClick={clearAllContext}
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Clear all context"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Message Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.value ? `${Math.min(e.target.scrollHeight, 200)}px` : '56px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or select a template above..."
                className="w-full min-h-[56px] max-h-[200px] rounded-xl border border-token-border-light bg-[var(--bg-elevated-secondary)] px-4 py-3 pr-12 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] focus:border-transparent hover:border-token-border-light transition-all duration-200 resize-none overflow-y-auto shadow-sm hover:shadow-md focus:shadow-lg custom-scrollbar"
                disabled={sending}
              />
              
              {/* Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || sending}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  content.trim() && !sending
                    ? 'bg-[var(--text-primary)] hover:bg-[var(--text-primary)]/90 text-[var(--text-inverted)] shadow-sm hover:shadow-md hover:scale-105' 
                    : 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] cursor-not-allowed'
                )}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Tools */}
      <RepositoryTools
        onRepositorySelect={handleRepositorySelect}
      />
    </div>
  )
}
