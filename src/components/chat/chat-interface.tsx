"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ArrowRight, X, History, Plus, Loader2, Database, Code2 } from "lucide-react"
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
import { ErrorBoundary } from "@/components/error-boundary"
import { ModelSelector } from "./model-selector"
import { LLDDemo } from "./lld-demo"
import { conversationsApi, Conversation, Message } from "@/lib/api/conversations"
import { chatApi, ChatRequest } from "@/lib/api/chat"
import { umlDiagramApi } from "@/lib/api/uml-diagram"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

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
  const { isAuthenticated, isLoading: authLoading } = useAuth()
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
  
  // UML diagram generation state
  const [generatingUML, setGeneratingUML] = useState(false)
  
  // LLD Demo state
  const [showLLDDemo, setShowLLDDemo] = useState(false)

  // Get conversation ID from URL params
  const conversationId = searchParams.get('conversation')

  // Load conversation on mount or when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      // Check if user is authenticated
      if (authLoading) {
        return // Wait for auth to load
      }
      
      if (!isAuthenticated) {
        console.error("User not authenticated")
        toast({
          title: "Authentication Error",
          description: "Please log in to view conversations.",
          variant: "destructive",
        })
        return
      }
      loadConversation(conversationId)
    } else {
      // New conversation
      setCurrentConversation(null)
      setMessages([])
    }
  }, [conversationId, isAuthenticated, authLoading])

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

  // Function to manually generate UML diagram for a specific repository path
  const generateUMLForRepository = async (repoPath: string) => {
    if (!repoPath.trim()) return
    
    setGeneratingUML(true)
    
    try {
      const response = await umlDiagramApi.generateRepositoryDiagram(repoPath, 'png')
      
      if (response.success && response.image_url) {
        // Add the UML diagram to the current message input
        const imageReference = `\n\n![UML Diagram for ${repoPath}](${response.image_url})\n\n`
        setContent(prev => prev + imageReference)
        
        toast({
          title: "UML Diagram Generated",
          description: `Generated UML diagram for ${repoPath}`,
        })
      } else {
        toast({
          title: "UML Generation Failed",
          description: response.error || "Failed to generate UML diagram",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating UML diagram:", error)
      toast({
        title: "Error",
        description: "Failed to generate UML diagram. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingUML(false)
    }
  }

  // Function to detect repository paths and PlantUML code in messages and generate UML diagrams
  const detectAndGenerateUMLDiagrams = async (messageContent: string): Promise<string> => {
    let processedContent = messageContent
    let hasChanges = false
    
    // First, check for existing PlantUML code blocks that need to be converted to images
    const plantUMLRegex = /@startuml[\s\S]*?@enduml/g
    const plantUMLMatches = [...messageContent.matchAll(plantUMLRegex)]
    
    if (plantUMLMatches.length > 0) {
      console.log("Found PlantUML code blocks in message, converting to images...")
      console.log("Number of PlantUML blocks found:", plantUMLMatches.length)
      setGeneratingUML(true)
      
      try {
        for (const match of plantUMLMatches) {
          const plantUMLCode = match[0]
          console.log("Processing PlantUML code block:", plantUMLCode.substring(0, 100) + "...")
          
                     try {
             // Generate UML diagram from PlantUML code using repository endpoint
             const response = await umlDiagramApi.generateRepositoryDiagram(plantUMLCode, 'png')
            
            if (response.success && response.image_url) {
              // Replace the PlantUML code with an image reference
              const imageReference = `\n\n![UML Diagram](${response.image_url})\n\n`
              processedContent = processedContent.replace(plantUMLCode, imageReference)
              hasChanges = true
              
              toast({
                title: "UML Diagram Generated",
                description: "Converted PlantUML code to diagram",
              })
            } else {
              console.warn("Failed to generate UML diagram from PlantUML code:", response.error)
            }
          } catch (error) {
            console.error("Error generating UML diagram from PlantUML code:", error)
          }
        }
      } finally {
        setGeneratingUML(false)
      }
    }
    
    // Then check for repository paths that might be mentioned in messages
    const repoPathRegex = /(?:repository|repo|path|directory|folder|analyze|generate UML for)\s*[:\s]*([\/\w\-\.]+)/gi
    const repoMatches = [...processedContent.matchAll(repoPathRegex)]
    
    if (repoMatches.length > 0) {
      console.log("Found repository paths in message, generating UML diagrams...")
      setGeneratingUML(true)
      
      try {
        for (const match of repoMatches) {
          const repoPath = match[1]?.trim()
          if (!repoPath || repoPath.length < 3) continue
          
          // Check if this looks like a valid repository path
          if (repoPath.includes('/') || repoPath.includes('\\') || repoPath.includes('.')) {
            console.log("Detected repository path in message:", repoPath)
            
            try {
              // Generate UML diagram for the repository
              const response = await umlDiagramApi.generateRepositoryDiagram(repoPath, 'png')
              
              if (response.success && response.image_url) {
                // Replace the repository path mention with the UML diagram image
                const imageReference = `\n\n![UML Diagram for ${repoPath}](${response.image_url})\n\n`
                processedContent = processedContent.replace(match[0], imageReference)
                hasChanges = true
                
                toast({
                  title: "UML Diagram Generated",
                  description: `Generated UML diagram for ${repoPath}`,
                })
              } else {
                console.warn("Failed to generate UML diagram for:", repoPath, response.error)
              }
            } catch (error) {
              console.error("Error generating UML diagram for", repoPath, ":", error)
            }
          }
        }
      } finally {
        setGeneratingUML(false)
      }
    }
    
    return processedContent
  }

  const loadConversation = async (id: string) => {
    try {
      setLoading(true)
      console.log("Loading conversation:", id)
      
      const conversation = await conversationsApi.getConversation(id)
      console.log("Conversation loaded:", conversation)
      setCurrentConversation(conversation)
      
      // Load messages separately
      const messageResponse = await conversationsApi.getMessages(id)
      console.log("Messages loaded:", messageResponse.messages)
      
      // Check if messages have the expected structure
      if (messageResponse.messages && Array.isArray(messageResponse.messages)) {
        messageResponse.messages.forEach((msg, index) => {
          console.log(`Message ${index}:`, {
            id: msg.id,
            role: msg.role,
            content: msg.content?.substring(0, 100) + "...",
            hasMetadata: !!msg.metadata
          })
        })
        
        // Process messages to detect and generate UML diagrams
        console.log("Processing messages for UML diagrams...")
        const processedMessages = await Promise.all(
          messageResponse.messages.map(async (msg, index) => {
            console.log(`Processing message ${index}: role=${msg.role}, content length=${msg.content?.length || 0}`)
            if (msg.role === 'assistant' && msg.content) {
              console.log(`Message ${index} content preview:`, msg.content.substring(0, 200) + "...")
              const processedContent = await detectAndGenerateUMLDiagrams(msg.content)
              console.log(`Message ${index} processed, content changed:`, processedContent !== msg.content)
              return { ...msg, content: processedContent }
            }
            return msg
          })
        )
        
        setMessages(processedMessages)
        
        // Debug: Test UML generation for any assistant message
        const assistantMessages = processedMessages.filter(msg => msg.role === 'assistant')
        if (assistantMessages.length > 0) {
          console.log("Found assistant messages, testing UML generation...")
          const testMessage = assistantMessages[0]
          if (testMessage.content && testMessage.content.length > 100) {
            console.log("Testing UML generation with first assistant message...")
                         // Force a test call to see if API is working
             try {
               const testResponse = await umlDiagramApi.generateRepositoryDiagram(".", 'png')
               console.log("Test UML generation response:", testResponse)
             } catch (error) {
               console.error("Test UML generation failed:", error)
             }
          }
        }
      } else {
        console.error("Invalid messages response:", messageResponse)
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to load conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      })
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
    { label: "Repository Analysis", prompt: "Analyze the selected repositories and provide insights about the codebase structure, technologies used, and potential improvements:" },
    { label: "LLD Analysis", prompt: "Perform a detailed Low-Level Design (LLD) analysis of this codebase including class diagrams, component architecture, and design patterns:" },
    { label: "Design Patterns", prompt: "Identify and analyze design patterns used in this codebase:" },
    { label: "API Documentation", prompt: "Generate comprehensive API documentation and specifications for this codebase:" },
    { label: "Generate UML Diagram", prompt: "Generate UML class diagram for this repository:", action: "uml" }
  ]

  const handleTemplateSelect = (prompt: string, label: string, action?: string) => {
    if (action === "uml") {
      // For UML generation, prompt user for repository path
      const repoPath = window.prompt("Enter repository path to generate UML diagram:")
      if (repoPath) {
        generateUMLForRepository(repoPath)
      }
    } else {
      setContent(prompt)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() || sending) return

    try {
      setSending(true)
      
      // Show loading toast for long-running operations
      if (selectedRepositories.length > 0) {
        toast({
          title: "Processing repository analysis...",
          description: "This may take a few minutes for complex analysis.",
        })
      }
      
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
      
      // Process UML diagrams in the AI response
      const processedResponse = await detectAndGenerateUMLDiagrams(response.response)
      
      // Update conversation and messages
      if (!currentConversation) {
        // Load the new conversation
        await loadConversation(response.conversation_id)
      } else {
        // Reload messages for existing conversation
        const messageResponse = await conversationsApi.getMessages(currentConversation.id)
        
        // Update the last message with processed UML diagrams if it's an assistant message
        const updatedMessages = messageResponse.messages.map((msg, index) => {
          if (index === messageResponse.messages.length - 1 && msg.role === 'assistant') {
            return { ...msg, content: processedResponse }
          }
          return msg
        })
        
        setMessages(updatedMessages)
      }

      setContent("")
      
      // Show success toast
      toast({
        title: "Message sent successfully",
        description: "AI response received.",
      })
    } catch (error: any) {
      console.error("Failed to send message:", error)
      
      // Show appropriate error message
      let errorMessage = "Failed to send message. Please try again."
      
      if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. This operation may take longer than expected. Please try again."
      } else if (error.message?.includes('Network error')) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
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
      <div className="flex-1 overflow-y-auto pb-32">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)] mb-4" />
            <p className="text-sm text-[var(--text-secondary)]">Loading authentication...</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--text-secondary)] mb-4" />
            <p className="text-sm text-[var(--text-secondary)]">Loading conversation...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center text-muted-foreground mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">Authentication Required</h2>
              <p className="text-sm">Please log in to view conversations</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center text-muted-foreground mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">
                {currentConversation ? "No messages in this conversation" : "Start a conversation"}
              </h2>
              <p className="text-sm">
                {currentConversation ? "This conversation appears to be empty." : "Ask me anything about your codebase or project"}
              </p>
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
              <ErrorBoundary key={message.id}>
                <ChatMessage
                  message={message}
                  onEdit={handleMessageEdit}
                  onDelete={handleMessageDelete}
                />
              </ErrorBoundary>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
  
      {/* Fixed Transparent Input Area */}
      <div className={cn("fixed bottom-0 left-0 right-0 p-4", (loading || !isAuthenticated) && "opacity-50 pointer-events-none", showHistory && "left-80")}>
        <div className="max-w-4xl mx-auto bg-transparent">
          {/* Template Dropdown and LLD Demo Button */}
          <div className="mb-4 flex justify-start gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group relative bg-[var(--bg-elevated-secondary)]/80 backdrop-blur-md border border-token-border-light hover:bg-[var(--interactive-bg-secondary-hover)]/80 hover:border-token-border-light text-[var(--text-primary)] transition-all duration-200 ease-out shadow-sm hover:shadow-md rounded-lg px-3 py-2 font-medium text-sm"
                >
                  <ChevronDown size={14} className="mr-2 transition-transform duration-200 group-hover:rotate-180" />
                  Quick Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 p-1 bg-[var(--bg-elevated-secondary)]/95 backdrop-blur-md border border-token-border-light shadow-lg rounded-xl animate-in slide-in-from-top-2 duration-200" 
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
                      onClick={() => handleTemplateSelect(template.prompt, template.label, (template as any).action)}
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
                      onClick={() => handleTemplateSelect(template.prompt, template.label, (template as any).action)}
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
  
                <DropdownMenuSeparator className="h-px bg-token-border-light my-1" />
                
                <DropdownMenuGroup>
                  {promptTemplates.slice(8, 12).map((template, index) => (
                    <DropdownMenuItem
                      key={index + 8}
                      onClick={() => handleTemplateSelect(template.prompt, template.label, (template as any).action)}
                      className="group cursor-pointer mx-1 my-0.5 px-3 py-2.5 rounded-lg text-[var(--text-primary)] text-sm hover:bg-[var(--interactive-bg-secondary-hover)] focus:bg-[var(--interactive-bg-secondary-hover)] transition-colors duration-150"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-base opacity-70">
                          {index === 0 ? '📐' : index === 1 ? '🎯' : index === 2 ? '📚' : '📊'}
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
                        onClick={() => handleTemplateSelect(promptTemplates[8].prompt, promptTemplates[8].label, (promptTemplates[8] as any).action)}
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
            
            {/* LLD Demo Button */}
            <Button
              onClick={() => setShowLLDDemo(true)}
              variant="outline"
              size="sm"
              className="group relative bg-[var(--bg-elevated-secondary)]/80 backdrop-blur-md border border-token-border-light hover:bg-[var(--interactive-bg-secondary-hover)]/80 hover:border-token-border-light text-[var(--text-primary)] transition-all duration-200 ease-out shadow-sm hover:shadow-md rounded-lg px-3 py-2 font-medium text-sm"
            >
              <Code2 size={14} className="mr-2" />
              LLD Demo
            </Button>
          </div>
  
          {/* Repository Context Indicator */}
          {(selectedRepositories.length > 0 || selectedOrganizations.length > 0) && (
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>Context:</span>
              </div>
              {selectedRepositories.length > 0 && (
                <span className="bg-[var(--bg-secondary)]/80 backdrop-blur-md px-2 py-1 rounded">
                  {selectedRepositories.length} repo{selectedRepositories.length !== 1 ? 's' : ''}
                </span>
              )}
              {selectedOrganizations.length > 0 && (
                <span className="bg-[var(--bg-secondary)]/80 backdrop-blur-md px-2 py-1 rounded">
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
              className="w-full min-h-[56px] max-h-[200px] rounded-xl border border-token-border-light bg-[var(--bg-elevated-secondary)]/80 backdrop-blur-md px-4 py-3 pr-12 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] focus:border-transparent hover:border-token-border-light transition-all duration-200 resize-none overflow-y-auto shadow-sm hover:shadow-md focus:shadow-lg custom-scrollbar"
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
            
            {/* UML Generation Loading Indicator */}
            {generatingUML && (
              <div className="absolute -top-8 right-0 flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)]/80 backdrop-blur-md px-2 py-1 rounded border border-[var(--border-light)]">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Generating UML diagrams...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  
    {/* Repository Tools */}
    <RepositoryTools
      onRepositorySelect={handleRepositorySelect}
    />
    
    {/* LLD Demo Modal */}
    <LLDDemo
      isOpen={showLLDDemo}
      onClose={() => setShowLLDDemo(false)}
    />
  </div>
  )
}
