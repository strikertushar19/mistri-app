"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { SidebarState } from "./types"

interface SidebarHeaderProps {
  state: SidebarState
  className?: string
}

// Single Responsibility: Handle sidebar header/logo section
export function SidebarHeader({ state, className }: SidebarHeaderProps) {
  const { isCollapsed } = state

  return (
    <div className={cn(
      "flex items-center transition-all bg-background duration-300 min-w-0 ",
      isCollapsed ? "px-3 py-4" : "px-3 py-4",
      className
    )}>
      <Link href="/" className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={cn(
          "rounded-md bg-primary/90 flex items-center justify-center transition-all duration-300",
          isCollapsed ? "h-7 w-7" : "h-7 w-7"
        )}>
          <span className={cn(
            "text-primary-foreground font-semibold transition-all duration-300",
            isCollapsed ? "text-xs" : "text-xs"
          )}>
            M
          </span>
        </div>
        
        {/* Text - always present, transitions smoothly */}
        <div className={cn(
          "sidebar-header-text flex flex-col min-w-0 overflow-hidden",
          isCollapsed 
            ? "max-w-0 opacity-0 scale-95" 
            : "max-w-[120px] opacity-100 scale-100"
        )}>
          <span className="font-medium text-sm tracking-tight truncate whitespace-nowrap">Mistri AI</span>
        </div>
      </Link>

      {/* Internal toggle removed as per requirements */}
    </div>
  )
}