import { Home, Code2, MessageCircle, Settings, History, BarChart3 } from "lucide-react"
import { NavigationItem } from "@/components/sidebar/types"

// Open/Closed Principle: Easy to extend navigation without modifying existing code
export const navigationConfig: NavigationItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  { id: "codebase", name: "Codebase", href: "/codebase", icon: Code2 },
  { id: "chat", name: "Chat", href: "/chat", icon: MessageCircle },
  { id: "analysis", name: "Analysis", href: "/analysis", icon: BarChart3 },
  { id: "history", name: "History", href: "/history", icon: History },
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
]