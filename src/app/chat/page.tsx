"use client"

import { useState, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  const [headerContent, setHeaderContent] = useState<React.ReactNode>(null)

  return (
    <DashboardLayout headerContent={headerContent} showDefaultHeader={false}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading chat...</h2>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      }>
        <ChatInterface renderHeader={setHeaderContent} />
      </Suspense>
    </DashboardLayout>
  )
}
