import { Home, Code2, MessageCircle, Settings, History, BarChart3, Terminal } from "lucide-react"
import { NavigationItem } from "@/components/sidebar/types"

// Open/Closed Principle: Easy to extend navigation without modifying existing code
export const navigationConfig: NavigationItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },

  { id: "chat", name: "Chat", href: "/chat", icon: MessageCircle },
  { id: "analysis", name: "Analysis", href: "/analysis", icon: BarChart3 },
  { id: "chat-history", name: "Chat History", href: "/history", icon: History },
  {
    id: "integrations",
    name: "Integrations",
    href: "#",
    icon: Settings,
    hasDropdown: true,
    dropdownItems: [
      { id: "cloud-providers", name: "Cloud Providers", href: "/cloud-providers" },
      { id: "code-providers", name: "Code Providers", href: "/code-providers" },
    ],
  },
  // {
  //   id: "opensource",
  //   name: "Open Source Options",
  //   href: "#",
  //   icon: Terminal,
  //   hasDropdown: true,
  //   hasTopBorder: true,
  //   dropdownItems: [
  //     { id: "github", name: "GitHub", href: "/opensource/github" },
  //     { id: "ollama", name: "Ollama", href: "/opensource/ollama" },
  //     { id: "huggingface", name: "Hugging Face", href: "/opensource/huggingface" },
  //     { id: "docker", name: "Docker Hub", href: "/opensource/docker" },
  //     { id: "npm", name: "NPM", href: "/opensource/npm" },
  //   ],
  // },
]