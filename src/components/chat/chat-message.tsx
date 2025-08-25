"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Message, MessageAvatar, MessageContent, MessageActions, MessageAction } from "@/components/ui/message"
import { Message as ConversationMessage } from "@/lib/api/conversations"
import { cn } from "@/lib/utils"
import { Markdown } from "@/components/ui/markdown"
import { useTextStream } from "@/components/ui/response-stream"
import { AnalysisResult, isAnalysisResultMessage, extractAnalysisDataFromMessage } from "./analysis-result"

// Custom component that combines streaming with markdown rendering for real-time messages only
function StreamingMarkdown({ content, speed = 25, isRealTime = false }: { content: string; speed?: number; isRealTime?: boolean }) {
  const { displayedText, startStreaming } = useTextStream({
    textStream: content,
    mode: "typewriter",
    speed: speed,
  })

  useEffect(() => {
    if (isRealTime) {
      startStreaming()
    }
  }, [startStreaming, isRealTime])

  // For real-time messages, show streaming effect with markdown
  if (isRealTime) {
    return (
      <div className="w-full min-w-full">
        <Markdown className="prose prose-sm dark:prose-invert prose-h2:mt-0! prose-h2:scroll-m-0!">
          {displayedText}
        </Markdown>
      </div>
    )
  }

  // For old messages, render directly as markdown without streaming
  return (
    <div className="w-full min-w-full">
      <Markdown className="prose prose-sm dark:prose-invert prose-h2:mt-0! prose-h2:scroll-m-0!">
        {content}
      </Markdown>
    </div>
  )
}

// Function to clean markdown content by removing code block wrappers but preserving outer text
function cleanMarkdownContent(content: string): string {
  if (!content) return content
  
  let cleaned = content.trim()
  
  // Check if content contains code blocks
  if (cleaned.includes('```')) {
    console.log('Found code blocks in content, cleaning...')
    console.log('Original content:', content.substring(0, 200) + '...')
    
    // Find the first and last code block positions
    const firstBackticks = cleaned.indexOf('```')
    const lastBackticks = cleaned.lastIndexOf('```')
    
    if (firstBackticks !== -1 && lastBackticks !== -1 && lastBackticks > firstBackticks) {
      // Get text before the code block
      const beforeCodeBlock = cleaned.substring(0, firstBackticks).trim()
      
      // Get text after the code block
      const afterCodeBlock = cleaned.substring(lastBackticks + 3).trim()
      
      // Extract content from inside the code block
      const startIndex = cleaned.indexOf('\n', firstBackticks)
      let codeBlockContent = ''
      if (startIndex !== -1) {
        codeBlockContent = cleaned.substring(startIndex + 1, lastBackticks).trim()
      }
      
      // Combine all parts: before + code content + after
      const parts = []
      if (beforeCodeBlock) parts.push(beforeCodeBlock)
      if (codeBlockContent) parts.push(codeBlockContent)
      if (afterCodeBlock) parts.push(afterCodeBlock)
      
      cleaned = parts.join('\n\n')
      console.log('Preserved outer text and extracted code block content')
    } else {
      console.log('Using fallback method')
      // Fallback: try to remove opening and closing markers
      // Remove opening code block markers
      if (cleaned.startsWith('```')) {
        const lines = cleaned.split('\n')
        if (lines.length > 1) {
          // Skip the first line (```markdown or ```)
          cleaned = lines.slice(1).join('\n')
        }
      }
      
      // Remove closing code block markers
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3)
      }
    }
    
    console.log('Cleaned content:', cleaned.substring(0, 200) + '...')
  }
  
  return cleaned.trim()
}

interface ChatMessageProps {
  message: ConversationMessage
  // onEdit?: (messageId: string, newContent: string) => void
  // onDelete?: (messageId: string) => void
  className?: string
  isRealTime?: boolean // Add prop to determine if this is a real-time message
}

export function ChatMessage({ message, /* onEdit, onDelete, */ className, isRealTime = false }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Determine if message is real-time based on creation time (within last 30 seconds)
  const isMessageRealTime = isRealTime || (() => {
    const messageTime = new Date(message.created_at).getTime()
    const currentTime = Date.now()
    return (currentTime - messageTime) < 30000 // 30 seconds
  })()

  const handleEdit = () => {
    // if (onEdit && editContent.trim() !== message.content) {
    //   onEdit(message.id, editContent.trim())
    // }
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

  return (
    <div className={cn("group relative mb-6 w-full", className)}>
      <div className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "w-full",
          isUser ? "max-w-3xl" : "w-full"
        )}>
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            {!isUser && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-secondary)]">
                  Assistant
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatDate(message.created_at)}
                </span>
                {message.is_edited && (
                  <span className="text-xs text-[var(--text-secondary)] bg-transparent px-2 py-1 rounded border border-[var(--border-light)]">
                    edited
                  </span>
                )}
              </div>
            )}
            {isUser && (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-[var(--text-secondary)]">
                  You
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatDate(message.created_at)}
                </span>
                {message.is_edited && (
                  <span className="text-xs text-[var(--text-secondary)] bg-transparent px-2 py-1 rounded border border-[var(--border-light)]">
                    edited
                  </span>
                )}
              </div>
            )}
          </div>

                                {isUser ? (
             /* User Message - Custom Component without Avatar */
             <div className="flex justify-end w-full">
               <div className="max-w-3xl">
                 {isEditing ? (
                   <div className="space-y-3 p-3 rounded-2xl shadow-md bg-[var(--bg-primary)] border border-[var(--border-light)]">
                     <textarea
                       value={editContent}
                       onChange={(e) => setEditContent(e.target.value)}
                       className="w-full min-h-[120px] p-4 text-sm bg-transparent border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] resize-none"
                       placeholder="Edit your message..."
                     />
                     <div className="flex gap-3">
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
                                    <div className="px-4 py-2 rounded-2xl shadow-md bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-light)] text-left">
                   {message.content || "No content available"}
                 </div>
                 )}

                 {/* Message Actions */}
                 <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                   <Button
                     variant="ghost"
                     size="sm"
                     className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                     onClick={handleCopy}
                     title="Copy message"
                   >
                     {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                   </Button>
                   
                                       {/* {onEdit && (
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
                    )} */}
                 </div>
               </div>
             </div>
          ) : (
                         /* Assistant Message - Custom Component without Border */
             <div className="flex gap-3 w-full">
               <div className="h-8 w-8 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-sm font-semibold shrink-0">
                 M
               </div>
              
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[120px] p-4 text-sm bg-transparent border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] resize-none"
                      placeholder="Edit your message..."
                    />
                    <div className="flex gap-3">
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
                  <div className="rounded-lg p-2 text-[var(--text-primary)] prose prose-sm max-w-none break-words whitespace-normal">
                    {isAnalysisResultMessage(message.content) ? (
                      (() => {
                        const analysisData = extractAnalysisDataFromMessage(message.content)
                        return analysisData.analysisId ? (
                          <AnalysisResult
                            analysisId={analysisData.analysisId}
                            repositoryName={analysisData.repositoryName || 'Unknown Repository'}
                            analysisType={analysisData.analysisType || 'analysis'}
                            summary={analysisData.summary || undefined}
                            keyInsights={analysisData.keyInsights}
                            className="mb-4"
                          />
                        ) : (
                          <StreamingMarkdown
                            content={cleanMarkdownContent(message.content) || "No content available"}
                            speed={25}
                            isRealTime={isMessageRealTime}
                          />
                        )
                      })()
                    ) : (
                      <StreamingMarkdown
                        content={cleanMarkdownContent(message.content) || "No content available"}
                        speed={25}
                        isRealTime={isMessageRealTime}
                      />
                    )}
                  </div>
                )}

                {/* Message Actions */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-secondary)] flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    onClick={handleCopy}
                    title="Copy message"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  
                                     {/* {onDelete && (
                     <Button
                       variant="ghost"
                       size="sm"
                       className="h-7 w-7 p-0 text-[var(--text-secondary)] hover:text-red-500"
                       onClick={() => onDelete(message.id)}
                       title="Delete message"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   )} */}
                </div>

                {/* Message Metadata */}
                {message.model_used && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                      <span>Model: {message.model_used}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
