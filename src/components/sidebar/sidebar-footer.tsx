"use client";

import { cn } from "@/lib/utils";
import { SidebarState } from "./types";
import {
  GearIcon,
  QuestionIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth-context";

interface SidebarFooterProps {
  state: SidebarState;
  className?: string;
}

// Single Responsibility: Handle sidebar footer with action buttons
export function SidebarFooter({ state, className }: SidebarFooterProps) {
  const { isCollapsed } = state;
  const { logout } = useAuth();

  const footerActions = [
    {
      id: "settings",
      name: "Settings",
      icon: GearIcon,
      href: "/settings", // Keep # for pages that haven't been made yet
      onClick: () => {
        console.log("Settings clicked");
      },
    },
    {
      id: "help",
      name: "Help",
      icon: QuestionIcon,
      href: "#", // Keep # for pages that haven't been made yet
      onClick: () => {
        console.log("Help clicked");
      },
    },
    // {
    //   id: "logout",
    //   name: "Log out",
    //   icon: SignOutIcon,
    //   href: "#", // Keep # for pages that haven't been made yet
    //   onClick: async () => {
    //     await logout();
    //   },
    // },
  ];

  return (
    <div className={cn("mt-auto relative sidebar-footer-container", className)}>
      {/* Footer Action Buttons - always present, transitions smoothly */}
      <div
        className="border-t px-2 py-2 transition-all duration-300 ease-in-out"
        style={{ borderColor: "var(--border-light, currentColor)" }}
      >
        {/* Action Buttons Container */}
        <div className={cn(
          "sidebar-footer-actions overflow-hidden",
          isCollapsed 
            ? "max-h-[200px] opacity-100 scale-100" 
            : "max-h-[200px] opacity-100 scale-100"
        )}>
          <div className="space-y-1">
            {footerActions.map((action) => {
              const Icon = action.icon;

              // Expanded state: icon and text in one button or link, left-aligned
              if (!isCollapsed) {
                // For logout, use button; for others, use <a> for navigation
                if (action.id === "logout") {
                  return (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      className={cn(
                        "flex items-center w-full px-3 py-2 rounded-lg transition-colors text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)] text-sm font-medium justify-start"
                      )}
                      title={action.name}
                      style={{ textAlign: "left" }}
                    >
                      <Icon className="h-5 w-5 mr-2 flex-shrink-0" weight="regular" />
                      <span className="truncate">{action.name}</span>
                    </button>
                  );
                } else {
                  return (
                    <a
                      key={action.id}
                      href={action.href}
                      className={cn(
                        "flex items-center w-full px-3 py-2 rounded-lg transition-colors text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)] text-sm font-medium justify-start"
                      )}
                      title={action.name}
                      style={{ textAlign: "left" }}
                    >
                      <Icon className="h-5 w-5 mr-2 flex-shrink-0" weight="regular" />
                      <span className="truncate">{action.name}</span>
                    </a>
                  );
                }
              }

              // Collapsed state: icon only, centered, with tooltip
              return (
                <div key={action.id} className="relative group w-full">
                  <button
                    onClick={action.onClick}
                    className={cn(
                      "flex items-center justify-center w-full p-2 rounded-lg transition-colors relative text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)]"
                    )}
                    title={action.name}
                  >
                    <Icon className="h-5 w-5" weight="regular" />
                    {/* Tooltip for collapsed state */}
                    <div
                      className={cn(
                        "absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[var(--bg-elevated-primary)] text-[var(--text-primary)]",
                        "text-sm rounded-md border opacity-0 invisible",
                        "group-hover:opacity-100 group-hover:visible transition-opacity duration-150",
                        "whitespace-nowrap z-50 pointer-events-none"
                      )}
                      style={{ borderColor: "var(--border-light, currentColor)" }}
                    >
                      {action.name}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
