import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: string
}

export function Menu({ className, role = "menu", ...props }: MenuProps) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col bg-[var(--bg-elevated-primary)] border rounded-xl overflow-hidden",
        "shadow-2xl", // outer shadow; parent can override via style
        className
      )}
      {...props}
    />
  )
}

export interface MenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  rightSlot?: React.ReactNode
  disabled?: boolean
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ icon, rightSlot, className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        role="menuitem"
        disabled={disabled}
        className={cn(
          "group __menu-item flex items-center gap-3 text-left",
          "px-2 py-2 mx-2 rounded-md",
          // Text size slightly smaller than sidebar nav; default color same as hover (primary)
          "text-sm text-[var(--text-primary)]",
          "hover:bg-[var(--interactive-bg-secondary-hover)]",
          "transition-colors",
          "disabled:opacity-50",
          className
        )}
        {...props}
      >
        {icon ? (
          <div className="flex items-center justify-center h-5 w-5 text-current">
            {icon}
          </div>
        ) : null}
        <span className="flex-1 min-w-0 truncate">{children}</span>
        {rightSlot ? (
          <div className="flex items-center justify-center h-4 w-4 text-[var(--text-secondary)]">
            {rightSlot}
          </div>
        ) : null}
      </button>
    )
  }
)
MenuItem.displayName = "MenuItem"

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "h-px my-1 mx-3",
        "border-t",
        className
      )}
      style={{ borderColor: "var(--border-light, currentColor)" }}
    />
  )
}

export function MenuHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        // Slightly smaller text to match item sizing
        "px-3 py-3 border-b text-xs text-[var(--text-secondary)]",
        className
      )}
      style={{ borderColor: "var(--border-light, currentColor)" }}
    >
      {children}
    </div>
  )
}

export default Menu