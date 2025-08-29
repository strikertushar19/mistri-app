"use client"

import { cn } from "@/lib/utils"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarContentProps } from "./types"
import { SidebarHeader } from "./sidebar-header"
import { useSidebarContext } from "@/contexts/sidebar-context"
import { BsLayoutSidebarReverse, BsLayoutSidebar } from "react-icons/bs"

// Single Responsibility: Compose ChatGPT-like sidebar sections
export function SidebarContent({ state, navigationItems, onNavigate, onTrigger }: SidebarContentProps) {
  const { isCollapsed } = state
  const { toggleCollapse } = useSidebarContext()

  return (
    <div className={cn(
      "flex h-full flex-col bg-background sidebar-content",
      isCollapsed ? "" : "expanded"
    )}>
      {/* Header row: logo/trigger with smooth transition */}
      <div className="bg-background border-b border-[var(--border-heavy)]">
        <div>
          {/* Fixed-height header to prevent layout reflow/flicker during toggle */}
          <div className="relative flex items-center h-16 px-2">
            {/* Logo - always present, transitions smoothly */}
            <div className={cn(
              "sidebar-logo transition-all duration-300 ease-in-out",
              isCollapsed 
                ? "collapsed" 
                : "expanded"
            )}>
              <SidebarHeader state={state} />
            </div>
            
            {/* Trigger button - always present, transitions smoothly */}
            {onTrigger && (
              <button
                onClick={toggleCollapse}
                className={cn(
                  "text-[var(--text-tertiary)] no-draggable hover:bg-[var(--interactive-bg-secondary-hover)] focus-visible:bg-[var(--interactive-bg-secondary-hover)]",
                  "touch:h-10 touch:w-10 flex h-9 w-9 items-center justify-center rounded-lg",
                  "focus-visible:outline-0 disabled:opacity-50 no-draggable cursor-pointer",
                  "transition-all duration-300 ease-in-out relative z-[70]",
                  isCollapsed 
                    ? "absolute inset-0 m-auto opacity-100 scale-100" 
                    : "ml-auto opacity-100 scale-100"
                )}
                aria-expanded={!state.isCollapsed}
                aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
                data-testid="sidebar-toggle-button"
              >
                {isCollapsed ? (
                  <BsLayoutSidebarReverse className="h-5 w-5" />
                ) : (
                  <BsLayoutSidebar className="h-5 w-5" />
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-full bg-[var(--text-primary)] text-[var(--text-inverted)] text-xs font-medium px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
                    Open sidebar
                  </span>
                )}
                
                {/* Tooltip for expanded state */}
                {!isCollapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-full bg-[var(--text-primary)] text-[var(--text-inverted)] text-xs font-medium px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
                    Close sidebar
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden"> 
        {/* {!isCollapsed && (
          <div className="px-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground">Chats</div>
        )} */}
        <SidebarNavigation items={navigationItems} state={state} onNavigate={onNavigate} />
      </div>

      <SidebarFooter state={state} />
    </div>
  )
}