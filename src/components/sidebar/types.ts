// Single Responsibility: Define all sidebar-related types in one place
export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  isLogout?: boolean
  hasDropdown?: boolean
  dropdownItems?: Array<{
    id: string
    name: string
    href: string
  }>
}

export interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  isFloating: boolean
}

export interface SidebarProps {
  className?: string
  state: SidebarState
  onStateChange: (state: Partial<SidebarState>) => void
  navigationItems: NavigationItem[]
}

export interface SidebarContentProps {
  state: SidebarState
  navigationItems: NavigationItem[]
  onNavigate?: () => void
  onToggleCollapse?: () => void
  onTrigger?: boolean
}

export interface SidebarTriggerProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}