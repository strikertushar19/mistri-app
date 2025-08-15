"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Trash2, Archive, Copy, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { conversationsApi, Conversation } from "@/lib/api/conversations"
import { cn } from "@/lib/utils"

interface ConversationHistoryProps {
  currentConversationId?: string
  onConversationSelect: (conversation: Conversation) => void
  onNewConversation: () => void
  className?: string
}

export function ConversationHistory({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  className
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await conversationsApi.getConversations({
        per_page: 50,
        search: searchQuery || undefined,
        archived: showArchived
      })
      setConversations(response.conversations)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [searchQuery, showArchived])

  // Handle conversation actions
  const handleArchive = async (conversation: Conversation) => {
    try {
      await conversationsApi.archiveConversation(conversation.id, !conversation.is_archived)
      loadConversations() // Reload to update the list
    } catch (error) {
      console.error("Failed to archive conversation:", error)
    }
  }

  const handleDuplicate = async (conversation: Conversation) => {
    try {
      const duplicated = await conversationsApi.duplicateConversation(conversation.id)
      onConversationSelect(duplicated)
      loadConversations() // Reload to show the new conversation
    } catch (error) {
      console.error("Failed to duplicate conversation:", error)
    }
  }

  const handleDelete = async (conversation: Conversation) => {
    try {
      await conversationsApi.deleteConversation(conversation.id)
      loadConversations() // Reload to remove from list
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Conversations</h3>
        <Button
          onClick={onNewConversation}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="New conversation"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[var(--border-light)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)]"
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="px-3 py-2">
        <Button
          onClick={() => setShowArchived(!showArchived)}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start text-sm",
            showArchived ? "text-[var(--text-primary)] bg-[var(--interactive-bg-secondary-hover)]" : "text-[var(--text-secondary)]"
          )}
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? "Show Active" : "Show Archived"}
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  currentConversationId === conversation.id
                    ? "bg-[var(--interactive-bg-secondary-hover)] border border-[var(--border-primary)]"
                    : "hover:bg-[var(--interactive-bg-secondary-hover)] border border-transparent"
                )}
                onClick={() => onConversationSelect(conversation)}
              >
                {/* Conversation Icon */}
                <div className="flex-shrink-0">
                  <MessageCircle className={cn(
                    "h-4 w-4",
                    conversation.is_archived ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                  )} />
                </div>

                {/* Conversation Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      conversation.is_archived ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                    )}>
                      {conversation.title}
                    </h4>
                    <span className="text-xs text-[var(--text-secondary)] ml-2">
                      {formatDate(conversation.updated_at)}
                    </span>
                  </div>
                  {conversation.last_message && (
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                      {truncateText(conversation.last_message, 60)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {conversation.message_count} messages
                    </span>
                    {conversation.is_archived && (
                      <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1 rounded">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchive(conversation)
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {conversation.is_archived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(conversation)
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(conversation)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
