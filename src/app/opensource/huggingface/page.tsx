"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  Download, 
  Star, 
  GitFork, 
  Eye, 
  Search, 
  ExternalLink,
  Zap,
  Shield,
  Globe,
  BookOpen,
  Play,
  Code,
  Image,
  MessageSquare,
  Brain,
  TrendingUp
} from "lucide-react"

interface HuggingFaceModel {
  id: string
  name: string
  description: string
  downloads: number
  likes: number
  tags: string[]
  task: string
  library: string
  lastModified: string
  author: string
  size: string
  language: string[]
  license: string
  type: "model" | "dataset" | "space"
}

// Demo data for Hugging Face models, datasets, and spaces
const demoModels: HuggingFaceModel[] = [
  {
    id: "bert-base-uncased",
    name: "bert-base-uncased",
    description: "BERT base model (uncased) pre-trained on English language using a masked language modeling (MLM) objective.",
    downloads: 15000000,
    likes: 2500,
    tags: ["bert", "pytorch", "tensorflow", "transformers", "fill-mask"],
    task: "Fill-Mask",
    library: "transformers",
    lastModified: "2024-01-15",
    author: "Google",
    size: "440MB",
    language: ["en"],
    license: "Apache 2.0",
    type: "model"
  },
  {
    id: "gpt2",
    name: "gpt2",
    description: "GPT-2: 124M parameter model for text generation",
    downloads: 8500000,
    likes: 1800,
    tags: ["gpt2", "pytorch", "tensorflow", "transformers", "text-generation"],
    task: "Text Generation",
    library: "transformers",
    lastModified: "2024-01-12",
    author: "OpenAI",
    size: "500MB",
    language: ["en"],
    license: "MIT",
    type: "model"
  },
  {
    id: "distilbert-base-uncased",
    name: "distilbert-base-uncased",
    description: "DistilBERT is a smaller, faster, cheaper and lighter version of BERT",
    downloads: 12000000,
    likes: 2200,
    tags: ["distilbert", "pytorch", "tensorflow", "transformers", "distillation"],
    task: "Text Classification",
    library: "transformers",
    lastModified: "2024-01-18",
    author: "Hugging Face",
    size: "250MB",
    language: ["en"],
    license: "Apache 2.0",
    type: "model"
  },
  {
    id: "squad",
    name: "squad",
    description: "Stanford Question Answering Dataset (SQuAD) is a reading comprehension dataset",
    downloads: 3200000,
    likes: 1500,
    tags: ["question-answering", "squad", "reading-comprehension", "english"],
    task: "Question Answering",
    library: "datasets",
    lastModified: "2024-01-10",
    author: "Stanford",
    size: "35MB",
    language: ["en"],
    license: "CC BY 4.0",
    type: "dataset"
  },
  {
    id: "imdb",
    name: "imdb",
    description: "Large Movie Review Dataset for sentiment analysis",
    downloads: 2800000,
    likes: 1200,
    tags: ["sentiment-analysis", "movie-reviews", "text-classification", "english"],
    task: "Text Classification",
    library: "datasets",
    lastModified: "2024-01-08",
    author: "Andrew Maas",
    size: "80MB",
    language: ["en"],
    license: "Apache 2.0",
    type: "dataset"
  },
  {
    id: "stable-diffusion-v1-5",
    name: "runwayml/stable-diffusion-v1-5",
    description: "Stable Diffusion is a latent text-to-image diffusion model",
    downloads: 25000000,
    likes: 5000,
    tags: ["stable-diffusion", "diffusion", "text-to-image", "image-generation"],
    task: "Text-to-Image",
    library: "diffusers",
    lastModified: "2024-01-20",
    author: "RunwayML",
    size: "4.1GB",
    language: ["en"],
    license: "CreativeML Open RAIL++-M",
    type: "model"
  }
]

const tasks = ["All", "Fill-Mask", "Text Generation", "Text Classification", "Question Answering", "Text-to-Image", "Image Classification", "Object Detection"]
const libraries = ["All", "transformers", "datasets", "diffusers", "tokenizers", "accelerate"]
const types = ["All", "model", "dataset", "space"]
const sortOptions = [
  { value: "downloads", label: "Most Downloaded" },
  { value: "likes", label: "Most Liked" },
  { value: "name", label: "Name A-Z" },
  { value: "modified", label: "Recently Updated" }
]

export default function HuggingFacePage() {
  const [activeTab, setActiveTab] = useState("models")
  const [items, setItems] = useState<HuggingFaceModel[]>(demoModels)
  const [filteredItems, setFilteredItems] = useState<HuggingFaceModel[]>(demoModels)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState("All")
  const [selectedLibrary, setSelectedLibrary] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [sortBy, setSortBy] = useState("downloads")

  // Filter and sort items
  useEffect(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesTask = selectedTask === "All" || item.task === selectedTask
      const matchesLibrary = selectedLibrary === "All" || item.library === selectedLibrary
      const matchesType = selectedType === "All" || item.type === selectedType
      return matchesSearch && matchesTask && matchesLibrary && matchesType
    })

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return b.downloads - a.downloads
        case "likes":
          return b.likes - a.likes
        case "name":
          return a.name.localeCompare(b.name)
        case "modified":
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedTask, selectedLibrary, selectedType, sortBy])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "model": return Brain
      case "dataset": return Database
      case "space": return Globe
      default: return Code
    }
  }

  const getTaskIcon = (task: string) => {
    switch (task) {
      case "Text Generation": return MessageSquare
      case "Text Classification": return BookOpen
      case "Text-to-Image": return Image
      case "Question Answering": return MessageSquare
      case "Fill-Mask": return Code
      default: return Brain
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Database className="h-6 w-6 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Hugging Face</h1>
          </div>
          <p className="text-muted-foreground">
            Discover models, datasets, and spaces for machine learning
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">
                Models, datasets & spaces
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
                {formatNumber(items.reduce((sum, item) => sum + item.downloads, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(items.reduce((sum, item) => sum + item.likes, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Community favorites
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Libraries</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(items.map(item => item.library)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported libraries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Models</CardTitle>
                <CardDescription>
                  Find models by name, description, or task
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task} value={task}>
                          {task}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select library" />
                    </SelectTrigger>
                    <SelectContent>
                      {libraries.map((library) => (
                        <SelectItem key={library} value={library}>
                          {library}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
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
              {filteredItems.filter(item => item.type === "model").map((model) => {
                const TypeIcon = getTypeIcon(model.type)
                const TaskIcon = getTaskIcon(model.task)
                return (
                  <Card key={model.id} className="group hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-yellow-500" />
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
                        <Badge variant="secondary">
                          {model.task}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Model Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Downloads:</span>
                          <span className="font-medium">{formatNumber(model.downloads)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Likes:</span>
                          <span className="font-medium">{formatNumber(model.likes)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{model.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TaskIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Library:</span>
                          <span className="font-medium">{model.library}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {model.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {model.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{model.tags.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download
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
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Datasets Coming Soon</h3>
                <p className="text-muted-foreground text-center">
                  Dataset browsing and management features will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spaces" className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Spaces Coming Soon</h3>
                <p className="text-muted-foreground text-center">
                  Interactive spaces and demos will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
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
