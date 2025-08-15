"use client"

import { useState } from "react"
import { User, Bot, Edit2, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Message } from "@/lib/api/conversations"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
  onEdit?: (messageId: string, newContent: string) => void
  onDelete?: (messageId: string) => void
  className?: string
}

export function ChatMessage({ message, onEdit, onDelete, className }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseMetadata = (metadata?: string) => {
    if (!metadata) return null
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  const metadata = parseMetadata(message.metadata)
  const cost = metadata?.cost

  return (
    <div className={cn("group relative", className)}>
      <div className={cn(
        "flex gap-4 p-4 transition-colors",
        isUser ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-secondary)]"
      )}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isUser 
              ? "bg-[var(--accent-primary)] text-[var(--text-inverted)]" 
              : "bg-[var(--accent-secondary)] text-[var(--text-primary)]"
          )}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {isUser ? "You" : "Assistant"}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {formatDate(message.created_at)}
              </span>
              {message.is_edited && (
                <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-1 rounded">
                  edited
                </span>
              )}
            </div>

            {/* Message Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={handleCopy}
                title="Copy message"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              
              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  onClick={() => setIsEditing(true)}
                  title="Edit message"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-red-500"
                  onClick={() => onDelete(message.id)}
                  title="Delete message"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Message Text */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[100px] p-3 text-sm bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] resize-none"
                placeholder="Edit your message..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || editContent.trim() === message.content}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-[var(--text-primary)]">
                {message.content}
              </div>
            </div>
          )}

          {/* Message Metadata */}
          {isAssistant && (cost || message.model_used || message.token_count) && (
            <div className="mt-3 pt-3 border-t border-[var(--border-light)]">
              <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                {message.model_used && (
                  <span>Model: {message.model_used}</span>
                )}
                {message.token_count && (
                  <span>Tokens: {message.token_count}</span>
                )}
                {cost && (
                  <span>Cost: ${cost.total_cost.toFixed(6)}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
