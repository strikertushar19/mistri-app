"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { SidebarContent } from "./sidebar-content"
import { SidebarOverlay } from "./sidebar-overlay"
import { SidebarProps } from "./types"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SidebarTrigger } from "." // from index barrel

// Open/Closed Principle: Extensible through props, closed for modification
export function Sidebar({ className, state, onStateChange, navigationItems }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { isOpen, isCollapsed, isFloating } = state

  // Handle click outside to close floating sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFloating && 
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onStateChange({ isOpen: false })
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isFloating, isOpen, onStateChange])

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onStateChange({ isOpen: false })
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onStateChange])

  const handleNavigate = () => {
    if (isFloating) {
      onStateChange({ isOpen: false })
    }
  }

  // Floating sidebar (mobile/overlay mode)
  if (isFloating) {
    return (
      <>
        <SidebarOverlay 
          isVisible={isOpen} 
          onClick={() => onStateChange({ isOpen: false })} 
        />
        {/* Mobile trigger anchored near top-left in overlay mode */}
        <SidebarTrigger isOpen={isOpen} onClick={() => onStateChange({ isOpen: !isOpen })} />
        <div
          ref={sidebarRef}
          className={cn(
            "fixed left-0 top-0 z-[60] h-full transition-all duration-300 ease-in-out",
            "border-r border-token-border-light shrink-0",
            "bg-[var(--bg-elevated-secondary)]",
            isOpen 
              ? "translate-x-0" 
              : "-translate-x-full",
            className
          )}
          style={{ width: "var(--sidebar-width)" }}
        >
          <SidebarContent 
            state={state} 
            navigationItems={navigationItems}
            onNavigate={handleNavigate}
          />
        </div>
      </>
    )
  }

  // Desktop sidebar (docked mode)
  return (
    <div className="hidden md:block" ref={sidebarRef}>
      <div
        className={cn(
          "group/sidebar md:fixed md:left-0 md:top-0 md:h-full z-[60]",
          "border-r border-token-border-light shrink-0 h-full relative",
          "bg-[var(--bg-elevated-secondary)] transition-all duration-300 ease-in-out",
          // Base rail width when collapsed; full width otherwise
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Trigger moved into header row via SidebarContent */}

        {/* Base content (rail). When collapsed, shows icon-only; when expanded, full content */}
        <SidebarContent 
          state={state} 
          navigationItems={navigationItems}
          onNavigate={handleNavigate}
          onTrigger={true}
        />

        {/* Hover flyout reserved (disabled) */}
      </div>
    </div>
  )
}