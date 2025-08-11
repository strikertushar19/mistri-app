"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavigationItem, SidebarState } from "./types"
import { Code, House } from "@phosphor-icons/react"

interface SidebarNavigationProps {
  items: NavigationItem[]
  state: SidebarState
  onNavigate?: () => void
}

// Single Responsibility: Handle navigation rendering and states
export function SidebarNavigation({ items, state, onNavigate }: SidebarNavigationProps) {
  const pathname = usePathname()
  const { isCollapsed } = state

  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
      <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center rounded-md transition-all duration-300 ease-in-out",
              "text-sm font-medium relative px-2 py-2 mx-1 gap-3 justify-start",
              isActive
                ? "bg-[var(--interactive-bg-secondary-press)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)]"
            )}
            title={isCollapsed ? item.name : undefined}
          >
            <Icon className={cn(
              "flex-shrink-0 transition-all duration-200 h-5 w-5",
              isActive ? "text-[var(--icon-primary)]" : "text-current"
            )} />
            
            <span
              className={cn(
                "truncate overflow-hidden transition-[max-width,opacity,transform] duration-300",
                "pl-2", // keep spacing between icon and text reserved
                isCollapsed
                  ? "opacity-0 max-w-0 -translate-x-1"
                  : "opacity-100 max-w-[160px] translate-x-0"
              )}
            >
              {item.name}
            </span>
            
            {item.badge && (
              <span
                className={cn(
                  "ml-auto bg-[var(--text-primary)]/15 text-[var(--text-primary)] text-xs px-2 py-0.5 rounded-full transition-all duration-300",
                  isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[80px]"
                )}
              >
                {item.badge}
              </span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className={cn(
                "absolute left-full ml-3 px-3 py-1.5 bg-[var(--bg-elevated-primary)] text-[var(--text-primary)]",
                "text-sm rounded-md border border-[var(--border-light)] opacity-0 invisible",
                "group-hover:opacity-100 group-hover:visible transition-opacity duration-150",
                "whitespace-nowrap z-50 pointer-events-none"
              )}>
                {item.name}
                {item.badge && (
                  <span className="ml-2 bg-[var(--text-primary)]/15 text-[var(--text-primary)] text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )
}