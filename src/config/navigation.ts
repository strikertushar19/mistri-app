import { Home, Code2 } from "lucide-react"
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
]