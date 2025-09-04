"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Github, 
  Database, 
  Brain, 
  Package, 
  Container,
  ExternalLink,
  Star,
  GitFork,
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react"

const openSourceServices = [
  {
    id: "github",
    name: "GitHub",
    description: "Discover and explore popular open source repositories, trending projects, and developer communities.",
    icon: Github,
    href: "/opensource/github",
    color: "bg-gray-900 text-white",
    stats: {
      repositories: "100M+",
      users: "100M+",
      languages: "200+"
    },
    features: ["Repository Discovery", "Trending Analysis", "Community Insights", "Code Search"]
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Explore and manage large language models, AI models, and machine learning frameworks.",
    icon: Brain,
    href: "/opensource/ollama",
    color: "bg-blue-600 text-white",
    stats: {
      models: "500+",
      downloads: "1M+",
      frameworks: "50+"
    },
    features: ["Model Library", "Local Deployment", "Model Comparison", "Performance Metrics"]
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Access the world's largest collection of pre-trained models, datasets, and AI tools.",
    icon: Database,
    href: "/opensource/huggingface",
    color: "bg-yellow-500 text-black",
    stats: {
      models: "500K+",
      datasets: "100K+",
      downloads: "10M+"
    },
    features: ["Model Hub", "Dataset Library", "Spaces", "Transformers"]
  },
  {
    id: "docker",
    name: "Docker Hub",
    description: "Browse containerized applications, base images, and deployment-ready solutions.",
    icon: Container,
    href: "/opensource/docker",
    color: "bg-blue-500 text-white",
    stats: {
      images: "8M+",
      pulls: "100B+",
      repositories: "1M+"
    },
    features: ["Container Registry", "Base Images", "Multi-arch Support", "Security Scanning"]
  },
  {
    id: "npm",
    name: "NPM",
    description: "Explore JavaScript packages, libraries, and tools for web development.",
    icon: Package,
    href: "/opensource/npm",
    color: "bg-red-500 text-white",
    stats: {
      packages: "2M+",
      downloads: "1B+",
      developers: "17M+"
    },
    features: ["Package Registry", "Version Management", "Dependency Analysis", "Security Audits"]
  }
]

export default function OpenSourcePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Github className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Open Source</h1>
          </div>
          <p className="text-muted-foreground">
            Explore and discover open source projects, models, and tools across different platforms
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openSourceServices.length}</div>
              <p className="text-xs text-muted-foreground">
                Integrated platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">110M+</div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127M+</div>
              <p className="text-xs text-muted-foreground">
                Global community
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Major ecosystems
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {openSourceServices.map((service) => {
            const IconComponent = service.icon
            return (
              <Card key={service.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${service.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {service.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={service.href}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(service.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-foreground">{value}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={service.href} className="flex items-center gap-2">
                      Explore {service.name}
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Jump directly to your favorite open source platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {openSourceServices.map((service) => {
                const IconComponent = service.icon
                return (
                  <Button
                    key={service.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                    asChild
                  >
                    <Link href={service.href}>
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm font-medium">{service.name}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}