"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Package, 
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
  Copy,
  GitBranch,
  Users
} from "lucide-react"

interface NPMPackage {
  id: string
  name: string
  description: string
  downloads: number
  stars: number
  version: string
  tags: string[]
  category: string
  lastUpdated: string
  size: string
  license: string
  author: string
  homepage: string
  repository: string
  keywords: string[]
  dependencies: number
  devDependencies: number
  weeklyDownloads: number
  monthlyDownloads: number
}

// Demo data for NPM packages
const demoPackages: NPMPackage[] = [
  {
    id: "react",
    name: "react",
    description: "React is a JavaScript library for building user interfaces",
    downloads: 25000000,
    stars: 220000,
    version: "18.2.0",
    tags: ["react", "ui", "virtual-dom", "declarative"],
    category: "Frontend Framework",
    lastUpdated: "2024-01-20",
    size: "2.1MB",
    license: "MIT",
    author: "Facebook",
    homepage: "https://reactjs.org/",
    repository: "https://github.com/facebook/react",
    keywords: ["react", "ui", "javascript", "frontend"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 25000000,
    monthlyDownloads: 100000000
  },
  {
    id: "lodash",
    name: "lodash",
    description: "A modern JavaScript utility library delivering modularity, performance & extras",
    downloads: 20000000,
    stars: 60000,
    version: "4.17.21",
    tags: ["utility", "functional", "performance", "modular"],
    category: "Utility Library",
    lastUpdated: "2024-01-18",
    size: "1.2MB",
    license: "MIT",
    author: "John-David Dalton",
    homepage: "https://lodash.com/",
    repository: "https://github.com/lodash/lodash",
    keywords: ["utility", "lodash", "javascript", "functional"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 20000000,
    monthlyDownloads: 80000000
  },
  {
    id: "express",
    name: "express",
    description: "Fast, unopinionated, minimalist web framework for node",
    downloads: 18000000,
    stars: 65000,
    version: "4.18.2",
    tags: ["web", "framework", "http", "server"],
    category: "Backend Framework",
    lastUpdated: "2024-01-19",
    size: "208KB",
    license: "MIT",
    author: "TJ Holowaychuk",
    homepage: "https://expressjs.com/",
    repository: "https://github.com/expressjs/express",
    keywords: ["express", "framework", "web", "http"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 18000000,
    monthlyDownloads: 72000000
  },
  {
    id: "axios",
    name: "axios",
    description: "Promise based HTTP client for the browser and node.js",
    downloads: 15000000,
    stars: 105000,
    version: "1.6.2",
    tags: ["http", "client", "promise", "ajax"],
    category: "HTTP Client",
    lastUpdated: "2024-01-17",
    size: "45KB",
    license: "MIT",
    author: "Matt Zabriskie",
    homepage: "https://axios-http.com/",
    repository: "https://github.com/axios/axios",
    keywords: ["axios", "http", "client", "promise"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 15000000,
    monthlyDownloads: 60000000
  },
  {
    id: "moment",
    name: "moment",
    description: "Parse, validate, manipulate, and display dates",
    downloads: 12000000,
    stars: 48000,
    version: "2.29.4",
    tags: ["date", "time", "parse", "format"],
    category: "Date Library",
    lastUpdated: "2024-01-15",
    size: "67KB",
    license: "MIT",
    author: "Iskren Ivov Chernev",
    homepage: "https://momentjs.com/",
    repository: "https://github.com/moment/moment",
    keywords: ["moment", "date", "time", "parse"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 12000000,
    monthlyDownloads: 48000000
  },
  {
    id: "webpack",
    name: "webpack",
    description: "A bundler for javascript and friends. Packs many modules into a few bundled assets",
    downloads: 8000000,
    stars: 65000,
    version: "5.89.0",
    tags: ["bundler", "modules", "assets", "build"],
    category: "Build Tool",
    lastUpdated: "2024-01-16",
    size: "2.8MB",
    license: "MIT",
    author: "Tobias Koppers",
    homepage: "https://webpack.js.org/",
    repository: "https://github.com/webpack/webpack",
    keywords: ["webpack", "bundler", "modules", "build"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 8000000,
    monthlyDownloads: 32000000
  },
  {
    id: "typescript",
    name: "typescript",
    description: "TypeScript is a language for application-scale JavaScript development",
    downloads: 10000000,
    stars: 95000,
    version: "5.3.3",
    tags: ["typescript", "language", "compiler", "types"],
    category: "Language",
    lastUpdated: "2024-01-21",
    size: "15.2MB",
    license: "Apache-2.0",
    author: "Microsoft",
    homepage: "https://www.typescriptlang.org/",
    repository: "https://github.com/Microsoft/TypeScript",
    keywords: ["typescript", "language", "compiler", "types"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 10000000,
    monthlyDownloads: 40000000
  },
  {
    id: "next",
    name: "next",
    description: "The React Framework for Production",
    downloads: 6000000,
    stars: 120000,
    version: "14.0.4",
    tags: ["react", "framework", "ssr", "ssg"],
    category: "Frontend Framework",
    lastUpdated: "2024-01-22",
    size: "1.5MB",
    license: "MIT",
    author: "Vercel",
    homepage: "https://nextjs.org/",
    repository: "https://github.com/vercel/next.js",
    keywords: ["next", "react", "framework", "ssr"],
    dependencies: 0,
    devDependencies: 0,
    weeklyDownloads: 6000000,
    monthlyDownloads: 24000000
  }
]

const categories = ["All", "Frontend Framework", "Backend Framework", "Utility Library", "HTTP Client", "Date Library", "Build Tool", "Language", "Testing", "Styling"]
const sortOptions = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "stars", label: "Most Starred" },
  { value: "name", label: "Name A-Z" },
  { value: "updated", label: "Recently Updated" },
  { value: "weekly", label: "Weekly Downloads" }
]

export default function NPMPage() {
  const [packages, setPackages] = useState<NPMPackage[]>(demoPackages)
  const [filteredPackages, setFilteredPackages] = useState<NPMPackage[]>(demoPackages)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("downloads")
  const [selectedPackage, setSelectedPackage] = useState<NPMPackage | null>(null)

  // Filter and sort packages
  useEffect(() => {
    let filtered = packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort packages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return b.downloads - a.downloads
        case "stars":
          return b.stars - a.stars
        case "name":
          return a.name.localeCompare(b.name)
        case "updated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "weekly":
          return b.weeklyDownloads - a.weeklyDownloads
        default:
          return 0
      }
    })

    setFilteredPackages(filtered)
  }, [packages, searchQuery, selectedCategory, sortBy])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Frontend Framework": return Code
      case "Backend Framework": return Server
      case "Utility Library": return Package
      case "HTTP Client": return Globe
      case "Date Library": return Clock
      case "Build Tool": return Zap
      case "Language": return Code
      case "Testing": return Shield
      case "Styling": return Code
      default: return Package
    }
  }

  const copyInstallCommand = (packageName: string) => {
    const command = `npm install ${packageName}`
    navigator.clipboard.writeText(command)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Package className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">NPM</h1>
          </div>
          <p className="text-muted-foreground">
            Discover and manage JavaScript packages and libraries
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
              <p className="text-xs text-muted-foreground">
                Available packages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(packages.reduce((sum, pkg) => sum + pkg.downloads, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all packages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(packages.reduce((sum, pkg) => sum + pkg.stars, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                GitHub stars
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
                {new Set(packages.map(pkg => pkg.category)).size}
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
              Find packages by name, description, or keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
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

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => {
            const CategoryIcon = getCategoryIcon(pkg.category)
            return (
              <Card key={pkg.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {pkg.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {pkg.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      v{pkg.version}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Package Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Downloads:</span>
                      <span className="font-medium">{formatNumber(pkg.downloads)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Stars:</span>
                      <span className="font-medium">{formatNumber(pkg.stars)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">{pkg.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="font-medium">{pkg.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Weekly Downloads */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Weekly Downloads</h4>
                    <div className="text-2xl font-bold text-primary">
                      {formatNumber(pkg.weeklyDownloads)}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1">
                    {pkg.keywords.slice(0, 4).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {pkg.keywords.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{pkg.keywords.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => copyInstallCommand(pkg.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install
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

        {filteredPackages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No packages found</h3>
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
