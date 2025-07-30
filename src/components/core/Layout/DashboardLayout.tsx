"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Project } from "@prisma/client";
import { Sidebar } from "../Sidebar";
import { MainHeader } from "../Dashboard/MainHeader";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DashboardLayoutProps {
  user: User;
  projects: Project[];
  selectedProject: Project;
  children: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

export function DashboardLayout({ 
  user, 
  projects, 
  selectedProject, 
  children,
  breadcrumbs
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebar-open', true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = (open?: boolean) => {
    setIsMobileMenuOpen(prev => open ?? !prev);
  };

  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleSidebar={toggleSidebar}
        onToggleMobileMenu={toggleMobileMenu}
      />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <MainHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          onToggleMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
          breadcrumbs={breadcrumbs}
        />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}