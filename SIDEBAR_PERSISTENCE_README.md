# Sidebar State Persistence

This document explains how the sidebar state persistence works in the Mistri app, specifically for the integrations button dropdown and other sidebar states.

## Overview

The sidebar state is now persistent across page navigation, meaning:
- The integrations dropdown will stay open/closed when navigating between pages
- The sidebar collapsed/expanded state is maintained
- The sidebar open/closed state (mobile) is maintained
- All states are stored in localStorage and restored on page load

## Implementation Details

### 1. Sidebar Context (`src/contexts/sidebar-context.tsx`)

The `SidebarProvider` manages all sidebar state including:
- `state`: The main sidebar state (isOpen, isCollapsed, isFloating)
- `openDropdown`: Which dropdown is currently open (e.g., "integrations")
- `setOpenDropdown`: Function to open/close dropdowns

### 2. State Persistence

The following states are persisted to localStorage:
- `mistri-sidebar-state`: Contains `isCollapsed` and `isOpen` states
- `mistri-sidebar-dropdown`: Contains the currently open dropdown ID

### 3. Integration with Components

- **DashboardLayout**: Uses `useSidebarContext()` instead of local `useSidebar()` hook
- **SidebarNavigation**: Uses `openDropdown` and `setOpenDropdown` from context
- **SidebarContent**: Uses `toggleCollapse` from context for sidebar toggle

### 4. SSR Safety

All localStorage operations are wrapped with `typeof window === 'undefined'` checks to prevent SSR issues.

## Usage

### Opening/Closing Integrations Dropdown

```tsx
import { useSidebarContext } from "@/contexts/sidebar-context"

function MyComponent() {
  const { openDropdown, setOpenDropdown } = useSidebarContext()
  
  // Open integrations dropdown
  const openIntegrations = () => setOpenDropdown('integrations')
  
  // Close dropdown
  const closeDropdown = () => setOpenDropdown(null)
  
  // Check if integrations is open
  const isIntegrationsOpen = openDropdown === 'integrations'
}
```

### Toggling Sidebar Collapse

```tsx
import { useSidebarContext } from "@/contexts/sidebar-context"

function MyComponent() {
  const { toggleCollapse, state } = useSidebarContext()
  
  // Toggle sidebar collapsed state
  const handleToggle = () => toggleCollapse()
  
  // Check if sidebar is collapsed
  const isCollapsed = state.isCollapsed
}
```

## Benefits

1. **Better UX**: Users don't lose their sidebar state when navigating
2. **Consistent Behavior**: Integrations dropdown stays open across pages
3. **Persistent Preferences**: User's sidebar preferences are remembered
4. **Responsive**: Works on both desktop and mobile devices

## Technical Notes

- State is automatically restored on page load
- Responsive behavior is maintained (mobile vs desktop)
- Error handling for localStorage failures
- TypeScript support with proper typing
