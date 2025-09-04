"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Container, 
  Download, 
  Star, 
  Eye, 
  Search, 
  ExternalLink,
  Shield,
  Clock,
  HardDrive,
  Zap,
  Globe,
  Code,
  Database,
  Server,
  TrendingUp,
  Play,
  Copy
} from "lucide-react"

interface DockerImage {
  id: string
  name: string
  description: string
  pulls: number
  stars: number
  tags: string[]
  category: string
  lastUpdated: string
  size: string
  architecture: string[]
  official: boolean
  verified: boolean
  license: string
  maintainer: string
}

// Demo data for Docker images
const demoImages: DockerImage[] = [
  {
    id: "nginx",
    name: "nginx",
    description: "Official build of nginx, a high performance web server and reverse proxy",
    pulls: 2000000000,
    stars: 15000,
    tags: ["web-server", "reverse-proxy", "load-balancer", "http"],
    category: "Web Server",
    lastUpdated: "2024-01-20",
    size: "187MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "BSD-2-Clause",
    maintainer: "NGINX Docker Maintainers"
  },
  {
    id: "postgres",
    name: "postgres",
    description: "The PostgreSQL object-relational database system",
    pulls: 1500000000,
    stars: 12000,
    tags: ["database", "postgresql", "sql", "relational"],
    category: "Database",
    lastUpdated: "2024-01-18",
    size: "376MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "PostgreSQL",
    maintainer: "PostgreSQL Docker Maintainers"
  },
  {
    id: "redis",
    name: "redis",
    description: "Redis is an open source key-value store that functions as a data structure server",
    pulls: 1200000000,
    stars: 8000,
    tags: ["database", "cache", "key-value", "nosql"],
    category: "Database",
    lastUpdated: "2024-01-15",
    size: "117MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "BSD-3-Clause",
    maintainer: "Redis Docker Maintainers"
  },
  {
    id: "node",
    name: "node",
    description: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine",
    pulls: 1800000000,
    stars: 10000,
    tags: ["javascript", "runtime", "v8", "npm"],
    category: "Runtime",
    lastUpdated: "2024-01-19",
    size: "993MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "MIT",
    maintainer: "Node.js Docker Team"
  },
  {
    id: "python",
    name: "python",
    description: "Python is an interpreted, interactive, object-oriented programming language",
    pulls: 1600000000,
    stars: 9000,
    tags: ["python", "programming", "interpreter", "scripting"],
    category: "Runtime",
    lastUpdated: "2024-01-17",
    size: "912MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "PSF",
    maintainer: "Python Docker Maintainers"
  },
  {
    id: "ubuntu",
    name: "ubuntu",
    description: "Ubuntu is a Debian-based Linux operating system",
    pulls: 3000000000,
    stars: 20000,
    tags: ["linux", "ubuntu", "debian", "base"],
    category: "Operating System",
    lastUpdated: "2024-01-21",
    size: "77.8MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "Various",
    maintainer: "Canonical"
  },
  {
    id: "mysql",
    name: "mysql",
    description: "MySQL is a widely used, open-source relational database management system",
    pulls: 1000000000,
    stars: 7000,
    tags: ["database", "mysql", "sql", "relational"],
    category: "Database",
    lastUpdated: "2024-01-16",
    size: "519MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "GPL-2.0",
    maintainer: "MySQL Docker Maintainers"
  },
  {
    id: "mongo",
    name: "mongo",
    description: "MongoDB is a cross-platform document-oriented database program",
    pulls: 800000000,
    stars: 6000,
    tags: ["database", "mongodb", "document", "nosql"],
    category: "Database",
    lastUpdated: "2024-01-14",
    size: "699MB",
    architecture: ["amd64", "arm64"],
    official: true,
    verified: true,
    license: "SSPL-1.0",
    maintainer: "MongoDB Inc."
  }
]

const categories = ["All", "Web Server", "Database", "Runtime", "Operating System", "Development", "Monitoring", "Security"]
const sortOptions = [
  { value: "pulls", label: "Most Pulled" },
  { value: "stars", label: "Most Starred" },
  { value: "name", label: "Name A-Z" },
  { value: "updated", label: "Recently Updated" },
  { value: "size", label: "Size (Smallest First)" }
]

export default function DockerPage() {
  const [images, setImages] = useState<DockerImage[]>(demoImages)
  const [filteredImages, setFilteredImages] = useState<DockerImage[]>(demoImages)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("pulls")
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null)

  // Filter and sort images
  useEffect(() => {
    let filtered = images.filter(image => {
      const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || image.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "pulls":
          return b.pulls - a.pulls
        case "stars":
          return b.stars - a.stars
        case "name":
          return a.name.localeCompare(b.name)
        case "updated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "size":
          return parseFloat(a.size) - parseFloat(b.size)
        default:
          return 0
      }
    })

    setFilteredImages(filtered)
  }, [images, searchQuery, selectedCategory, sortBy])

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B"
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Web Server": return Server
      case "Database": return Database
      case "Runtime": return Code
      case "Operating System": return Globe
      case "Development": return Code
      case "Monitoring": return Eye
      case "Security": return Shield
      default: return Container
    }
  }

  const copyDockerCommand = (imageName: string) => {
    const command = `docker pull ${imageName}`
    navigator.clipboard.writeText(command)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Container className="h-6 w-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Docker Hub</h1>
          </div>
          <p className="text-muted-foreground">
            Discover and manage containerized applications and base images
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
              <Container className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{images.length}</div>
              <p className="text-xs text-muted-foreground">
                Available images
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pulls</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(images.reduce((sum, image) => sum + image.pulls, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all images
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Official Images</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {images.filter(img => img.official).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Verified by Docker
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(images.map(img => img.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Different categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find images by name, description, or category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => {
            const CategoryIcon = getCategoryIcon(image.category)
            return (
              <Card key={image.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-semibold truncate">
                            {image.name}
                          </CardTitle>
                          {image.official && (
                            <Badge variant="default" className="text-xs">
                              Official
                            </Badge>
                          )}
                          {image.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {image.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {image.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Image Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Pulls:</span>
                      <span className="font-medium">{formatNumber(image.pulls)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Stars:</span>
                      <span className="font-medium">{formatNumber(image.stars)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">{image.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="font-medium">{image.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Architecture */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Architecture</h4>
                    <div className="flex flex-wrap gap-1">
                      {image.architecture.map((arch) => (
                        <Badge key={arch} variant="outline" className="text-xs">
                          {arch}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{image.tags.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => copyDockerCommand(image.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Pull Image
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredImages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Container className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No images found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
