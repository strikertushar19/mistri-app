"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CodeAnalysisDashboard } from "@/components/codebase/code-analysis-dashboard"

export default function CodebasePage() {
  return (
    <DashboardLayout>
      <CodeAnalysisDashboard />
    </DashboardLayout>
  )
}

