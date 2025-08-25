"use client"

import { Button } from "@/components/ui/Button"
import { SidebarSimpleIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { SidebarTriggerProps } from "./types"

// Single Responsibility: Handle sidebar trigger button (ChatGPT-like)
export function SidebarTrigger({ isOpen, onClick, className }: SidebarTriggerProps) {
  const label = isOpen ? "Close sidebar" : "Open sidebar"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        // Placement defaults for mobile; can be overridden via className
        "fixed top-4 left-4 z-50",
        // Shape and look similar to ChatGPT control
        "relative group h-8 w-8 rounded-lg border",
        "bg-muted/60 text-foreground/70",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors",
        className
      )}
      aria-label={label}
    >
      <SidebarSimpleIcon size={16} className="text-white" weight="regular" />
      {/* Tooltip */}
      <span
        className={cn(
          "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2",
          "rounded-full bg-foreground text-background text-xs font-medium",
          "px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100",
          "transition-opacity"
        )}
        role="tooltip"
      >
        {label}
      </span>
    </Button>
  )
}