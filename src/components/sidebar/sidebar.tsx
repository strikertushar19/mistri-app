"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { SidebarContent } from "./sidebar-content"
import { SidebarOverlay } from "./sidebar-overlay"
import { SidebarProps } from "./types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SidebarTrigger } from "." // from index barrel

// Open/Closed Principle: Extensible through props, closed for modification
export function Sidebar({ className, state, onStateChange, navigationItems }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { isOpen, isCollapsed, isFloating } = state
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleNavigate = () => {
    if (isFloating) {
      onStateChange({ isOpen: false })
    }
  }

  // Handle hover events for desktop sidebar with delay
  const handleMouseEnter = () => {
    if (!isFloating) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      // Set hover state immediately
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isFloating) {
      // Add a small delay before collapsing to prevent flickering
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false)
      }, 150) // 150ms delay
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

  // Desktop sidebar (docked mode with hover expansion)
  return (
    <div className="hidden md:block" ref={sidebarRef}>
      <div
        className={cn(
          "group/sidebar md:fixed md:left-0 md:top-0 md:h-full z-[60]",
          "border-r border-token-border-light shrink-0 h-full relative",
          "bg-[var(--bg-elevated-secondary)] sidebar-hover-transition",
          // Hover-based expansion: collapsed by default, expanded on hover
          isHovered ? "w-64" : "w-16",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base content (rail). When collapsed, shows icon-only; when expanded, full content */}
        <SidebarContent 
          state={{ ...state, isCollapsed: !isHovered }} 
          navigationItems={navigationItems}
          onNavigate={handleNavigate}
          onTrigger={false} // Disable manual trigger since we're using hover
        />
      </div>
    </div>
  )
}