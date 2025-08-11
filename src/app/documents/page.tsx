import { DashboardLayout } from "@/components/dashboard-layout"

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Access and manage your important documents.
          </p>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Document {i + 1}.pdf</h3>
                <p className="text-sm text-muted-foreground">
                  Modified 3 days ago • 2.4 MB
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.floor(Math.random() * 100)}% complete
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}