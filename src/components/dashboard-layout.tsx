"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useSidebarContext } from "@/contexts/sidebar-context"
import { navigationConfig } from "@/config/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
}

// Single Responsibility: Compose the main dashboard layout
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebar = useSidebarContext()

  const { state } = sidebar
  const { isOpen, isCollapsed, isFloating } = state

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile trigger moved into Sidebar component */}

      {/* Sidebar */}
      <Sidebar
        state={state}
        onStateChange={sidebar.updateState}
        navigationItems={navigationConfig}
      />

      {/* Main Content */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out",
          isFloating
            ? "ml-0"
            : isCollapsed
              ? "md:ml-16" // collapsed rail width
              : "md:ml-72" // expanded width
        )}
      >
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-30 bg-background/95 backdrop-blur-sm",
          "supports-[backdrop-filter]:bg-background/60"
        )}>
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Desktop toggle moved into Sidebar component */}
              {/* <div>
                <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back!</p>
              </div> */}
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}