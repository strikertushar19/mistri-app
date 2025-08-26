"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Cloud, Database, Server } from "lucide-react"

export default function CloudProvidersPage() {
  const cloudProviders = [
    {
      id: "aws",
      name: "Amazon Web Services",
      description: "Connect your AWS account to analyze cloud infrastructure and costs",
      icon: Cloud,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      id: "azure",
      name: "Microsoft Azure",
      description: "Integrate with Azure to monitor resources and optimize spending",
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      id: "gcp",
      name: "Google Cloud Platform",
      description: "Connect GCP to analyze cloud services and performance",
      icon: Server,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
  ]

  const handleConnect = (providerId: string) => {
    console.log(`Connecting to ${providerId}...`)
    // TODO: Implement connection logic
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Cloud Providers</h1>
        <p className="text-[var(--text-secondary)]">Connect your cloud infrastructure for analysis and optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cloudProviders.map((provider) => {
          const Icon = provider.icon
          return (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${provider.bgColor}`}>
                    <Icon className={`h-6 w-6 ${provider.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[var(--text-primary)]">{provider.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-[var(--text-secondary)] mb-4">
                  {provider.description}
                </CardDescription>
                <Button 
                  onClick={() => handleConnect(provider.id)}
                  className="w-full"
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
