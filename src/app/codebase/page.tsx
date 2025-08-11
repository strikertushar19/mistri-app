import { DashboardLayout } from "@/components/dashboard-layout"

export default function CodebasePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Codebase</h2>
          <p className="text-muted-foreground">Explore and manage your repository.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Recent Changes</h3>
            <p className="text-sm text-muted-foreground">No recent commits.</p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Open Tasks</h3>
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

