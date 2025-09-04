"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NavigationItem, SidebarState } from "./types"
import { Code, House, ChevronDown } from "lucide-react"
import { useSidebarContext } from "@/contexts/sidebar-context"

interface SidebarNavigationProps {
  items: NavigationItem[]
  state: SidebarState
  onNavigate?: () => void
}

// Single Responsibility: Handle navigation rendering and states
export function SidebarNavigation({ items, state, onNavigate }: SidebarNavigationProps) {
  const pathname = usePathname()
  const { isCollapsed } = state
  const { openDropdown, setOpenDropdown, expand } = useSidebarContext()

  // Close dropdown when sidebar is collapsed
  React.useEffect(() => {
    if (isCollapsed && openDropdown) {
      setOpenDropdown(null)
    }
  }, [isCollapsed, openDropdown, setOpenDropdown])

  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5">
      {items.map((item, index) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')) || (item.dropdownItems?.some(dropdownItem => dropdownItem.href === pathname))
        const Icon = item.icon

        // Handle dropdown items
        if (item.hasDropdown && item.dropdownItems) {
          const isDropdownOpen = openDropdown === item.id
          
          return (
            <div key={item.id} className={cn(
              "relative",
              item.hasTopBorder && "border-t border-[var(--border-heavy)] pt-2 mt-2"
            )}>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    // If sidebar is collapsed, expand it first, then open dropdown
                    expand()
                    // Small delay to allow sidebar expansion animation to complete
                    setTimeout(() => {
                      setOpenDropdown(isDropdownOpen ? null : item.id)
                    }, 150)
                  } else {
                    // If sidebar is expanded, just toggle dropdown
                    setOpenDropdown(isDropdownOpen ? null : item.id)
                  }
                }}
                className={cn(
                  "group flex items-center rounded-md transition-all duration-300 ease-in-out w-full",
                  "text-sm font-medium relative px-2 py-2 mx-1 gap-3 justify-start cursor-pointer",
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
                
                {!isCollapsed && (
                  <ChevronDown 
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-200",
                      isDropdownOpen && "rotate-180"
                    )} 
                  />
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className={cn(
                    "absolute left-full ml-3 px-3 py-1.5 bg-[var(--bg-elevated-primary)] text-[var(--text-primary)]",
                    "text-sm rounded-md border border-[var(--border-heavy)] opacity-0 invisible",
                    "group-hover:opacity-100 group-hover:visible transition-opacity duration-150",
                    "whitespace-nowrap z-50 pointer-events-none"
                  )}>
                    {item.name}
                    {item.hasDropdown && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Click to expand
                      </div>
                    )}
                  </div>
                )}
              </button>
              
              {/* Dropdown items */}
              {!isCollapsed && isDropdownOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.dropdownItems.map((dropdownItem) => {
                    const isDropdownItemActive = pathname === dropdownItem.href
                    return (
                      <Link
                        key={dropdownItem.id}
                        href={dropdownItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center rounded-md transition-all duration-300 ease-in-out",
                          "text-sm font-medium relative px-2 py-2 mx-1 gap-3 justify-start cursor-pointer",
                          isDropdownItemActive
                            ? "bg-[var(--interactive-bg-secondary-press)] text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <span
                          className={cn(
                            "truncate overflow-hidden transition-[max-width,opacity,transform] duration-300",
                            "pl-2", // keep spacing between icon and text reserved
                            "opacity-100 max-w-[160px] translate-x-0"
                          )}
                        >
                          {dropdownItem.name}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }

        return (
          <div key={item.id} className={cn(
            item.hasTopBorder && "border-t border-[var(--border-medium)] pt-2 mt-2"
          )}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center rounded-md transition-all duration-300 ease-in-out",
                "text-sm font-medium relative px-2 py-2 mx-1 gap-3 justify-start cursor-pointer",
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
                "text-sm rounded-md border border-[var(--border-medium)] opacity-0 invisible",
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
          </div>
        )
      })}
    </nav>
  )
}