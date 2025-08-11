"use client"

import { cn } from "@/lib/utils"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarContentProps } from "./types"
import { SidebarHeader } from "./sidebar-header"
import Image from "next/image"

// Single Responsibility: Compose ChatGPT-like sidebar sections
export function SidebarContent({ state, navigationItems, onNavigate, onTrigger }: SidebarContentProps) {
  const { isCollapsed } = state

  return (
    <div className="flex h-full flex-col bg-[var(--bg-elevated-secondary)]">
      {/* Header row: logo/trigger with smooth transition */}
      <div className="bg-[var(--bg-elevated-secondary)]">
        <div>
          {/* Fixed-height header to prevent layout reflow/flicker during toggle */}
          <div className="relative flex items-center h-12 px-2">
            {isCollapsed ? (
              /* Collapsed state: Show logo by default, replace with trigger on hover */
              <div className="relative w-full flex items-center justify-center group">
                {/* Logo - visible by default, hidden on hover */}
                <div className={cn(
                  "transition-all duration-300 ease-in-out",
                  "opacity-100 group-hover:opacity-0 group-hover:scale-95"
                )}>
                  <SidebarHeader state={state} />
                </div>
                
                {/* Trigger button - replaces logo on hover */}
                {onTrigger && (
                  <button
                    onClick={onTrigger}
                    className={cn(
                      "text-[var(--text-tertiary)] no-draggable hover:bg-[var(--interactive-bg-secondary-hover)] focus-visible:bg-[var(--interactive-bg-secondary-hover)]",
                      "touch:h-10 touch:w-10 flex h-9 w-9 items-center justify-center rounded-lg",
                      "focus-visible:outline-0 disabled:opacity-50 no-draggable cursor-pointer",
                      "transition-all duration-300 ease-in-out relative z-[70]",
                      "absolute inset-0 m-auto",
                      "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                    )}
                    aria-expanded={!state.isCollapsed}
                    aria-label="Open sidebar"
                    data-testid="sidebar-toggle-button"
                  >
                    <Image
                      src="/sidebar-close.svg"
                      alt="Toggle sidebar"
                      width={20}
                      height={20}
                      className="hidden md:block"
                    />
                    <Image
                      src="/sidebar-close-mobile.svg"
                      alt="Toggle sidebar"
                      width={20}
                      height={20}
                      className="block md:hidden"
                    />
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-full bg-[var(--text-primary)] text-[var(--text-inverted)] text-xs font-medium px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
                      Open sidebar
                    </span>
                  </button>
                )}
              </div>
            ) : (
              /* Expanded state: Show logo and trigger side by side */
              <>
                {/* Logo - visible when expanded */}
                <div className="transition-all duration-300 ease-in-out">
                  <SidebarHeader state={state} />
                </div>
                
                {/* ChatGPT-style trigger button */}
                {onTrigger && (
                  <button
                    onClick={onTrigger}
                    className={cn(
                      "text-[var(--text-tertiary)] no-draggable hover:bg-[var(--interactive-bg-secondary-hover)] focus-visible:bg-[var(--interactive-bg-secondary-hover)]",
                      "touch:h-10 touch:w-10 flex h-9 w-9 items-center justify-center rounded-lg",
                      "focus-visible:outline-0 disabled:opacity-50 no-draggable cursor-pointer",
                      "transition-all duration-300 ease-in-out group relative z-[70] ml-auto"
                    )}
                    aria-expanded={!state.isCollapsed}
                    aria-label="Close sidebar"
                    data-testid="sidebar-toggle-button"
                  >
                    <Image
                      src="/sidebar-close.svg"
                      alt="Toggle sidebar"
                      width={20}
                      height={20}
                      className="hidden md:block"
                    />
                    <Image
                      src="/sidebar-close-mobile.svg"
                      alt="Toggle sidebar"
                      width={20}
                      height={20}
                      className="block md:hidden"
                    />
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-full bg-[var(--text-primary)] text-[var(--text-inverted)] text-xs font-medium px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
                      Close sidebar
                    </span>
                  </button>
                )}
              </>
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