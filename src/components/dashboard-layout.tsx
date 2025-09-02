"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { useSidebarContext } from "@/contexts/sidebar-context"
import { navigationConfig } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard"

interface DashboardLayoutProps {
  children: ReactNode
  headerContent?: ReactNode
  showDefaultHeader?: boolean
}

// Single Responsibility: Compose the main dashboard layout
export function DashboardLayout({ 
  children, 
  headerContent, 
  showDefaultHeader = true 
}: DashboardLayoutProps) {
  const sidebar = useSidebarContext()

  const { state } = sidebar
  const { isOpen, isCollapsed, isFloating } = state

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-transparent">
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
            "transition-all duration-300 ease-in-out bg-transparent",
        
          )}
        >
          {/* Header */}
          <header className={cn(
            "sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-[var(--border-heavy)]",
            "supports-[backdrop-filter]:bg-background/60"
          )}>
            <div className="flex h-16 items-center justify-between px-6">
              {headerContent ? (
                headerContent
              ) : showDefaultHeader ? (
                <>
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
                </>
              ) : null}
            </div>
          </header>

          {/* Page Content */}
          <main className={cn(showDefaultHeader ? "p-6" : "", "bg-transparent") }>
            <div className={cn(showDefaultHeader ? "mx-auto max-w-7xl" : "", "bg-transparent")}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </OnboardingGuard>
  )
}