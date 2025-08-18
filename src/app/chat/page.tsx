"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  const [headerContent, setHeaderContent] = useState<React.ReactNode>(null)

  return (
    <DashboardLayout headerContent={headerContent} showDefaultHeader={false}>
      <ChatInterface renderHeader={setHeaderContent} />
    </DashboardLayout>
  )
}
