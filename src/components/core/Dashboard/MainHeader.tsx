"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronRight, 
  Home,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

export function MainHeader({ 
  onToggleSidebar, 
  isSidebarOpen, 
  onToggleMobileMenu,
  isMobileMenuOpen,
  breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", isActive: true }
  ]
}: MainHeaderProps) {
  return (
    <div className="bg-card border-b border-border/50 px-4 py-4 h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Toggle and Breadcrumbs */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMobileMenu}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>

          {/* Desktop Sidebar Toggle */}
          <div className="hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm">
              <Home className="w-4 h-4 text-muted-foreground" />
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  )}
                  {crumb.href && !crumb.isActive ? (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className={cn(
                        crumb.isActive 
                          ? "text-foreground font-medium" 
                          : "text-muted-foreground"
                      )}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </nav>
        </div>

        {/* Right side - Additional actions can be added here */}
        <div className="flex items-center space-x-2">
          {/* Placeholder for future header actions */}
        </div>
      </div>
    </div>
  );
}