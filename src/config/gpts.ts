import { BookOpen, Bot, Sparkles, Wand2 } from "lucide-react"
import { NavigationItem } from "@/components/sidebar/types"

export const gptsConfig: NavigationItem[] = [
  {
    id: "sora",
    name: "Sora",
    href: "/gpts/sora",
    icon: Sparkles,
  },
  {
    id: "docs-large-code",
    name: "Documentation Large Code B...",
    href: "/gpts/docs",
    icon: BookOpen,
  },
  {
    id: "scispace",
    name: "SciSpace",
    href: "/gpts/scispace",
    icon: Bot,
  },
  {
    id: "website-generator",
    name: "Website Generator",
    href: "/gpts/website-generator",
    icon: Wand2,
  },
]

