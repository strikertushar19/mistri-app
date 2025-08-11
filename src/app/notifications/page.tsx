import { DashboardLayout } from "@/components/dashboard-layout"

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with your latest notifications and alerts.
          </p>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm">
              <div className={`h-2 w-2 rounded-full mt-2 ${i < 3 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Notification {i + 1}</h3>
                  <span className="text-xs text-muted-foreground">
                    {i < 3 ? 'Just now' : `${i} hours ago`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This is a sample notification message that provides important information.
                </p>
                {i < 3 && (
                  <span className="inline-block mt-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}