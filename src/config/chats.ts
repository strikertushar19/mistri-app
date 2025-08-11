import { LayoutDashboard, Code2 } from "lucide-react"
import { NavigationItem } from "@/components/sidebar/types"

// Temporary routes only: Dashboard and Codebase
export const chatsConfig: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "codebase", name: "Codebase", href: "/codebase", icon: Code2 },
]

