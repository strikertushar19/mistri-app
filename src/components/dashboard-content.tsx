"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardContent() {

  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      description: "+12% from last month",
    },
    {
      title: "Revenue",
      value: "$45,231",
      description: "+8% from last month",
    },
    {
      title: "Active Sessions",
      value: "1,234",
      description: "+23% from last hour",
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      description: "+2% from last week",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Here's what's happening with your dashboard today.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest dashboard interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, name: "Activity 1", time: "10 minutes ago" },
              { id: 2, name: "Activity 2", time: "12 minutes ago" },
              { id: 3, name: "Activity 3", time: "35 minutes ago" },
              { id: 4, name: "Activity 4", time: "42 minutes ago" },
              { id: 5, name: "Activity 5", time: "51 minutes ago" }
            ].map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">{activity.id}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}