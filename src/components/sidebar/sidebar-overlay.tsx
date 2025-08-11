"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface SidebarOverlayProps {
  isVisible: boolean
  onClick: () => void
  className?: string
}

// Single Responsibility: Handle backdrop overlay for floating sidebar
export function SidebarOverlay({ isVisible, onClick, className }: SidebarOverlayProps) {
  // Prevent body scroll when overlay is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}