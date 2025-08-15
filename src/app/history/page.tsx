"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ConversationHistory } from "@/components/chat/conversation-history"
import { useState } from "react"
import { Conversation } from "@/lib/api/conversations"
import { useRouter } from "next/navigation"

export default function HistoryPage() {
  const router = useRouter()
  const [currentConversationId, setCurrentConversationId] = useState<string>()

  const handleConversationSelect = (conversation: Conversation) => {
    // Navigate to chat page with the selected conversation
    router.push(`/chat?conversation=${conversation.id}`)
  }

  const handleNewConversation = () => {
    // Navigate to chat page for new conversation
    router.push('/chat')
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <ConversationHistory
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>
    </DashboardLayout>
  )
}
