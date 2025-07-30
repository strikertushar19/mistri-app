"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { protectedRoutes } from "@/lib/routes";
import { User } from "@supabase/supabase-js";
import { Project } from "@prisma/client";
import { selectProject } from "@/app/projects/actions";

export default function DashboardLayout({
  children,
  user,
  projects,
  selectedProject,
}: {
  children: React.ReactNode;
  user: User;
  projects: Project[];
  selectedProject: Project;
}) {
  const [open, setOpen] = useState(true);
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

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    router.push(`/dashboard?project=${projectId}`);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              <select
                value={selectedProject.id}
                onChange={handleProjectChange}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <SidebarLink
                link={{
                  label: "Create Project",
                  href: "/projects/create",
                  icon: (props) => (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...props}
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  ),
                }}
              />
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
          <div className="space-y-2">
            <SidebarLink
              link={{
                label: user.email as string,
                href: "/profile",
                icon: (props) => (
                  <Image
                    src="https://assets.aceternity.com/manu.png"
                    className={
                      "h-7 w-7 shrink-0 rounded-full " + (props.className || "")
                    }
                    width={50}
                    height={50}
                    alt="Profile"
                  />
                ),
              }}
            />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <IconLogout className="h-5 w-5" />
              {open && <span>Sign out</span>}
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
    </div>
  );
}

const Logo = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium whitespace-pre text-black dark:text-white"
    >
      Acet Labs
    </motion.span>
  </a>
);

const LogoIcon = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
  </a>
);
