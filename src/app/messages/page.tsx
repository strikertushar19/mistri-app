import { DashboardLayout } from "@/components/dashboard-layout"

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">
            Manage your conversations and communications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold">Message Thread {i + 1}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Latest message content preview...
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>2 hours ago</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  New
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}