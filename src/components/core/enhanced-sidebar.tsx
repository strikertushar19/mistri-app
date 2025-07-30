"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { protectedRoutes } from "@/lib/routes";
import { User } from "@supabase/supabase-js";
import { Project } from "@prisma/client";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Plus, ChevronDown } from "lucide-react";

interface EnhancedSidebarProps {
  user: User;
  projects: Project[];
  selectedProject: Project;
  children: React.ReactNode;
}

export default function EnhancedSidebar({
  children,
  user,
  projects,
  selectedProject,
}: EnhancedSidebarProps) {
  const [open, setOpen] = useState(true);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProjectChange = (projectId: string) => {
    router.push(`/dashboard?project=${projectId}`);
    setProjectDropdownOpen(false);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen relative"
      )}
    >
      {/* Background Pattern */}
      <GridPattern
        squares={[[0, 1], [1, 3], [2, 0], [3, 2], [4, 1]]}
        className="absolute inset-0 opacity-5 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
      />
      
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 relative">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            
            {/* Enhanced Project Selector */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="relative">
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-neutral-300 bg-white/80 backdrop-blur-sm px-3 py-3 text-black transition-all hover:bg-white/90 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-white dark:hover:bg-neutral-900/90"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-medium truncate">
                      {selectedProject.name}
                    </span>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 transition-transform",
                      projectDropdownOpen && "rotate-180"
                    )} 
                  />
                </button>
                
                {projectDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-neutral-300 rounded-lg shadow-lg z-50 dark:bg-neutral-900/95 dark:border-neutral-700"
                  >
                    <div className="p-2 space-y-1">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectChange(project.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                            project.id === selectedProject.id && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Create Project Button */}
              <ShimmerButton
                onClick={() => router.push("/projects/create")}
                className="w-full justify-center text-sm"
                shimmerColor="#3b82f6"
                background="rgba(59, 130, 246, 0.1)"
              >
                <Plus className="w-4 h-4 mr-2" />
                {open && "Create Project"}
              </ShimmerButton>

              {/* Navigation Links */}
              <div className="space-y-1">
                {protectedRoutes.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={{
                      label: link.title,
                      href: `${link.path}?project=${selectedProject.id}`,
                      icon: link.icon,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced User Section */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700">
              <SidebarLink
                link={{
                  label: user.email || "User",
                  href: "/profile",
                  icon: (props) => (
                    <div className="relative">
                      <Image
                        src="https://assets.aceternity.com/manu.png"
                        className={cn(
                          "h-7 w-7 shrink-0 rounded-full ring-2 ring-primary/20",
                          props.className || ""
                        )}
                        width={50}
                        height={50}
                        alt="Profile"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-neutral-800" />
                    </div>
                  ),
                }}
              />
            </div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <IconLogout className="h-5 w-5" />
              {open && <span>Sign out</span>}
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
        {children}
      </main>
    </div>
  );
}

const Logo = () => (
  <motion.a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-primary to-primary/60" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium whitespace-pre text-black dark:text-white bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
    >
      Mistri Tech
    </motion.span>
  </motion.a>
);

const LogoIcon = () => (
  <motion.a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    whileHover={{ scale: 1.1, rotate: 5 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-primary to-primary/60" />
  </motion.a>
);