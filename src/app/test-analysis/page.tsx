"use client"

import { TestAnalysis } from "@/components/chat/test-analysis"

export default function TestAnalysisPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Test Analysis Response</h1>
        <TestAnalysis />
      </div>
    </div>
  )
}
