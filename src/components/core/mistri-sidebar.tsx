"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Project } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  GitBranch,
  FileCode,
  Network,
  Shield,
  BarChart3,
  Settings,
  BookOpen,
  AlertTriangle,
  Users,
  HelpCircle,
  Archive,
  ChevronDown,
  Plus,
  LogOut,
  Code2,
  GitCommit,
  FileText,
  Layers,
  Zap
} from "lucide-react";

interface MistriSidebarProps {
  user: User;
  projects: Project[];
  selectedProject: Project;
  children: React.ReactNode;
}

export default function MistriSidebar({ 
  user, 
  projects, 
  selectedProject, 
  children 
}: MistriSidebarProps) {
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
  };

  const sidebarItems = [
    {
      title: "Favorites",
      items: [
        { name: "Technical Docs", icon: FileText, href: "/docs" },
        { name: "Architecture Guidelines", icon: BookOpen, href: "/guidelines" },
        { name: "Code Standards", icon: AlertTriangle, href: "/standards" },
      ]
    },
    {
      title: "Onboarding",
      items: [
        { name: "Integration Setup", icon: Zap, href: "/onboarding" },
      ]
    },
    {
      title: "Main Menu",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
        { name: "Repositories", icon: GitBranch, href: "/repositories" },
        { name: "Code Analysis", icon: Code2, href: "/analysis" },
        { name: "Architecture", icon: Layers, href: "/architecture" },
        { name: "Security Scan", icon: Shield, href: "/security" },
        { name: "Performance", icon: BarChart3, href: "/performance" },
        { name: "Integrations", icon: Network, href: "/integrations" },
        { name: "Support Center", icon: HelpCircle, href: "/support" },
        { name: "Archive", icon: Archive, href: "/archive" },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Mistri Tech</span>
          </div>
        </div>

        {/* Project Selector */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full flex items-center justify-between p-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-gray-900 truncate">
                  {selectedProject.name}
                </span>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-500 transition-transform",
                isProjectDropdownOpen && "rotate-180"
              )} />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectChange(project.id)}
                    className={cn(
                      "w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg",
                      project.id === selectedProject.id && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <GitBranch className={cn(
                      "w-4 h-4",
                      project.id === selectedProject.id ? "text-blue-600" : "text-gray-400"
                    )} />
                    <span className="text-sm font-medium truncate">{project.name}</span>
                  </button>
                ))}
                <div className="border-t border-gray-200 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-6">
            {sidebarItems.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-lg text-sm font-medium transition-colors",
                        item.active 
                          ? "bg-blue-50 text-blue-700 border border-blue-200" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
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
            className="w-full justify-start text-gray-600 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}