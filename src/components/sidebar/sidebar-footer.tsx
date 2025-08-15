"use client";

import { cn } from "@/lib/utils";
import { SidebarState } from "./types";
import {
  CaretUp,
  CaretUpIcon,
  GearIcon,
  QuestionIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { Menu, MenuHeader, MenuItem } from "@/components/ui/menu";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface SidebarFooterProps {
  state: SidebarState;
  className?: string;
}

// Single Responsibility: Handle ChatGPT-style sidebar footer with dropdown
export function SidebarFooter({ state, className }: SidebarFooterProps) {
  const { isCollapsed } = state;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const footerActions = [
    {
      id: "settings",
      name: "Settings",
      icon: GearIcon,
      onClick: () => {
        console.log("Settings clicked");
        setIsDropdownOpen(false);
      },
    },
    {
      id: "help",
      name: "Help",
      icon: QuestionIcon,
      onClick: () => {
        console.log("Help clicked");
        setIsDropdownOpen(false);
      },
    },
    {
      id: "logout",
      name: "Log out",
      icon: SignOutIcon,
      onClick: async () => {
        await logout();
        setIsDropdownOpen(false);
      },
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show footer if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className={cn("mt-auto relative", className)} ref={dropdownRef}>
      {/* Dropdown Menu */}
      {isDropdownOpen && !isCollapsed && (
        <Menu
          className="absolute bottom-full left-2 right-2 mb-2 z-50"
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(13, 13, 13, 0.1), 0 10px 10px -5px rgba(13, 13, 13, 0.04)",
            borderColor: "var(--border-light, currentColor)",
          }}
        >
          <MenuHeader>
            <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} className="rounded-full" alt={user.first_name} />
          </Avatar>
              <span className="truncate">{user?.email || "Guest"}</span>
            </div>
          </MenuHeader>

          <div className="flex flex-col gap-1 my-2">
            {footerActions.map((action) => (
              <MenuItem
                key={action.id}
                onClick={action.onClick}
                icon={<action.icon className="h-5 w-5" weight="regular" />}
                rightSlot={action.id === "help" ? <span>›</span> : undefined}
              >
                {action.name}
              </MenuItem>
            ))}
          </div>
        </Menu>
      )}

      {/* User Profile Button */}
      {!isCollapsed ? (
        <div
          className="border-t px-2 py-2"
          style={{ borderColor: "var(--border-light, currentColor)" }}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left",
              "hover:bg-[var(--interactive-bg-secondary-hover)]",
              isDropdownOpen && "bg-[var(--interactive-bg-secondary-hover)]"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
            <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} className="rounded-full" alt={user.first_name} />
          </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user ? `${user.first_name} ${user.last_name}` : "Guest"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {user?.email || "Not signed in"}
              </p>
            </div>
            <CaretUpIcon
              className={cn(
                "h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200",
                isDropdownOpen ? "rotate-0" : "rotate-180"
              )}
              weight="regular"
            />
          </button>
        </div>
      ) : (
        /* Collapsed state - show individual action buttons */
        <div
          className="border-t px-2 py-2"
          style={{ borderColor: "var(--border-light, currentColor)" }}
        >
          {footerActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="group flex items-center justify-center w-full p-2 rounded-lg transition-colors relative text-[var(--text-secondary)] hover:bg-[var(--interactive-bg-secondary-hover)] hover:text-[var(--text-primary)]"
                title={action.name}
              >
                <Icon className="h-5 w-5" weight="regular" />

                {/* Tooltip for collapsed state */}
                <div
                  className={cn(
                    "absolute left-full ml-3 px-3 py-1.5 bg-[var(--bg-elevated-primary)] text-[var(--text-primary)]",
                    "text-sm rounded-md border opacity-0 invisible",
                    "group-hover:opacity-100 group-hover:visible transition-opacity duration-150",
                    "whitespace-nowrap z-50 pointer-events-none"
                  )}
                  style={{ borderColor: "var(--border-light, currentColor)" }}
                >
                  {action.name}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
