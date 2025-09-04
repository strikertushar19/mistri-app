"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Brain, 
  Download, 
  Cpu, 
  HardDrive, 
  Clock, 
  Search, 
  Star,
  ExternalLink,
  Play,
  Pause,
  Settings,
  Zap,
  Shield,
  Globe
} from "lucide-react"

interface OllamaModel {
  id: string
  name: string
  description: string
  size: string
  downloads: number
  lastModified: string
  tags: string[]
  category: string
  performance: {
    speed: number
    accuracy: number
    memory: number
  }
  status: "available" | "downloading" | "installed" | "running"
}

// Demo data for Ollama models
const demoModels: OllamaModel[] = [
  {
    id: "llama2-7b",
    name: "llama2:7b",
    description: "Meta's Llama 2 7B parameter model, optimized for general-purpose tasks",
    size: "3.8GB",
    downloads: 2500000,
    lastModified: "2024-01-15",
    tags: ["text-generation", "chat", "general-purpose", "meta"],
    category: "Large Language Model",
    performance: { speed: 85, accuracy: 92, memory: 75 },
    status: "available"
  },
  {
    id: "codellama-13b",
    name: "codellama:13b",
    description: "Code Llama 13B model specialized for code generation and understanding",
    size: "7.3GB",
    downloads: 1800000,
    lastModified: "2024-01-12",
    tags: ["code-generation", "programming", "python", "javascript"],
    category: "Code Generation",
    performance: { speed: 78, accuracy: 95, memory: 88 },
    status: "installed"
  },
  {
    id: "mistral-7b",
    name: "mistral:7b",
    description: "Mistral 7B Instruct model with excellent instruction following",
    size: "4.1GB",
    downloads: 3200000,
    lastModified: "2024-01-18",
    tags: ["instruction-following", "chat", "reasoning", "french"],
    category: "Instruction Following",
    performance: { speed: 90, accuracy: 89, memory: 70 },
    status: "running"
  },
  {
    id: "neural-chat-7b",
    name: "neural-chat:7b",
    description: "Intel's Neural Chat model optimized for conversational AI",
    size: "3.9GB",
    downloads: 950000,
    lastModified: "2024-01-10",
    tags: ["conversation", "intel", "optimized", "chat"],
    category: "Conversational AI",
    performance: { speed: 88, accuracy: 87, memory: 72 },
    status: "available"
  },
  {
    id: "phi-3-mini",
    name: "phi3:mini",
    description: "Microsoft's Phi-3 Mini model with 3.8B parameters",
    size: "2.3GB",
    downloads: 2100000,
    lastModified: "2024-01-20",
    tags: ["microsoft", "small-model", "efficient", "reasoning"],
    category: "Small Language Model",
    performance: { speed: 95, accuracy: 85, memory: 55 },
    status: "available"
  },
  {
    id: "gemma-7b",
    name: "gemma:7b",
    description: "Google's Gemma 7B model for research and development",
    size: "4.8GB",
    downloads: 1600000,
    lastModified: "2024-01-14",
    tags: ["google", "research", "development", "multilingual"],
    category: "Research Model",
    performance: { speed: 82, accuracy: 91, memory: 80 },
    status: "downloading"
  }
]

const categories = ["All", "Large Language Model", "Code Generation", "Instruction Following", "Conversational AI", "Small Language Model", "Research Model"]
const sortOptions = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "name", label: "Name A-Z" },
  { value: "size", label: "Size (Smallest First)" },
  { value: "performance", label: "Best Performance" }
]

export default function OllamaPage() {
  const [models, setModels] = useState<OllamaModel[]>(demoModels)
  const [filteredModels, setFilteredModels] = useState<OllamaModel[]>(demoModels)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("downloads")
  const [selectedModel, setSelectedModel] = useState<OllamaModel | null>(null)

  // Filter and sort models
  useEffect(() => {
    let filtered = models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || model.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort models
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return b.downloads - a.downloads
        case "name":
          return a.name.localeCompare(b.name)
        case "size":
          return parseFloat(a.size) - parseFloat(b.size)
        case "performance":
          return (b.performance.speed + b.performance.accuracy) - (a.performance.speed + a.performance.accuracy)
        default:
          return 0
      }
    })

    setFilteredModels(filtered)
  }, [models, searchQuery, selectedCategory, sortBy])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500"
      case "installed": return "bg-blue-500"
      case "downloading": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "running": return "Running"
      case "installed": return "Installed"
      case "downloading": return "Downloading"
      default: return "Available"
    }
  }

  const handleModelAction = (model: OllamaModel, action: string) => {
    // Simulate model action
    setModels(prev => prev.map(m => 
      m.id === model.id 
        ? { ...m, status: action === "install" ? "downloading" : action === "run" ? "running" : m.status }
        : m
    ))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Ollama Models</h1>
          </div>
          <p className="text-muted-foreground">
            Discover, download, and manage large language models locally
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
              <p className="text-xs text-muted-foreground">
                Available models
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
                {formatNumber(models.reduce((sum, model) => sum + model.downloads, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all models
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Models</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {models.filter(m => m.status === "running").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Installed Models</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {models.filter(m => m.status === "installed" || m.status === "running").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Local storage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find models by name, description, or tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
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

        {/* Models Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <Card key={model.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {model.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {model.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(model.status)} text-white`}
                  >
                    {getStatusText(model.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Model Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{model.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Downloads:</span>
                    <span className="font-medium">{formatNumber(model.downloads)}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Performance</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{model.performance.speed}%</div>
                      <div className="text-muted-foreground">Speed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{model.performance.accuracy}%</div>
                      <div className="text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{model.performance.memory}%</div>
                      <div className="text-muted-foreground">Memory</div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {model.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {model.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{model.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {model.status === "available" && (
                    <Button
                      size="sm"
                      onClick={() => handleModelAction(model, "install")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  )}
                  {model.status === "installed" && (
                    <Button
                      size="sm"
                      onClick={() => handleModelAction(model, "run")}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run
                    </Button>
                  )}
                  {model.status === "running" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModelAction(model, "stop")}
                      className="flex-1"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedModel(model)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No models found</h3>
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
