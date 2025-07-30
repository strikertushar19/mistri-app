"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Project } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { protectedRoutes } from "@/lib/routes";
import { GitBranch, ChevronDown, Plus, LogOut, Code2, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SidebarProps {
  user: User;
  projects: Project[];
  selectedProject: Project & { status: string };
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  onToggleSidebar: () => void;
  onToggleMobileMenu: (open?: boolean) => void;
}

// Export the toggle functions for use in MainHeader
export interface SidebarControls {
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
}

export function Sidebar({
  user,
  projects,
  selectedProject,
  isSidebarOpen,
  isMobileMenuOpen,
  onToggleSidebar,
  onToggleMobileMenu
}: SidebarProps) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleProjectChange = (projectId: string) => {
    router.push(`/dashboard?project=${projectId}`);
    setIsProjectDropdownOpen(false);
    onToggleMobileMenu(false); // Close mobile menu when navigating
  };

  const sidebarNavItems = protectedRoutes.filter(route => {
    if (!route.showInSidebar) return false;
    if (selectedProject.status === 'ONBOARDING') {
      return ['Dashboard', 'Settings'].includes(route.title);
    }
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => onToggleMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-card flex flex-col shadow-input transition-all duration-300 ease-in-out",
        // Desktop behavior
        "hidden lg:flex",
        isSidebarOpen ? "lg:w-64" : "lg:w-16",
        // Mobile behavior
        "lg:relative fixed inset-y-0 left-0 z-50",
        isMobileMenuOpen ? "flex w-64" : "hidden lg:flex"
      )}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-border/50 h-16 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="font-semibold text-card-foreground">Mistri Tech</span>
            )}
          </div>
        </div>

        {/* Project Selector */}
        {(isSidebarOpen || isMobileMenuOpen) ? (
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="w-full flex items-center justify-between p-2 text-left bg-secondary rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-card-foreground truncate">
                    {selectedProject.name}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isProjectDropdownOpen && "rotate-180"
                )} />
              </button>

              {isProjectDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg z-10">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectChange(project.id)}
                      className={cn(
                        "w-full flex items-center space-x-2 p-2 text-left hover:bg-accent first:rounded-t-lg last:rounded-b-lg",
                        project.id === selectedProject.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <GitBranch className={cn(
                        "w-4 h-4",
                        project.id === selectedProject.id ? "text-foreground" : "text-muted-foreground"
                      )} />
                      <span className="text-sm font-medium truncate">{project.name}</span>
                    </button>
                  ))}
                  <div className="border-t border-border/50 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={() => router.push("/projects/create")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Repository
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Collapsed project selector - just the icon
          <div className="p-4 border-b border-border/50 flex justify-center">
            <div className="p-2 bg-secondary rounded-lg">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className={cn("space-y-4", !isSidebarOpen && !isMobileMenuOpen && "space-y-2")}>
            {sidebarNavItems.map((item) => (
              <div key={item.title}>
                <a
                  href={item.path}
                  onClick={() => onToggleMobileMenu(false)}
                  className={cn(
                    "flex items-center transition-colors rounded-lg",
                    (isSidebarOpen || isMobileMenuOpen) 
                      ? "space-x-3 p-2 text-sm font-medium" 
                      : "p-2 justify-center w-10 h-10",
                    item.isActive 
                      ? "bg-accent text-accent-foreground border border-border/50" 
                      : "text-card-foreground hover:bg-accent"
                  )}
                  title={!isSidebarOpen && !isMobileMenuOpen ? item.title : undefined}
                >
                  {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                  {(isSidebarOpen || isMobileMenuOpen) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </a>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          {(isSidebarOpen || isMobileMenuOpen) ? (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </>
          ) : (
            // Collapsed footer - just the avatar and logout icon
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}