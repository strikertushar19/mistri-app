"use client"

import { useState, useEffect, useCallback } from "react"
import { SidebarState } from "@/components/sidebar/types"

interface UseSidebarOptions {
  defaultCollapsed?: boolean
  defaultOpen?: boolean
  breakpoint?: number
}

// Single Responsibility: Manage sidebar state and responsive behavior
export function useSidebar(options: UseSidebarOptions = {}) {
  const {
    defaultCollapsed = false,
    defaultOpen = false,
    breakpoint = 768,
  } = options

  const [state, setState] = useState<SidebarState>({
    isOpen: defaultOpen,
    isCollapsed: defaultCollapsed,
    isFloating: false,
  })

  // Check if we're on mobile/tablet
  const checkIsFloating = useCallback(() => {
    return window.innerWidth < breakpoint
  }, [breakpoint])

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isFloating = checkIsFloating()
      setState(prev => ({
        ...prev,
        isFloating,
        // Close sidebar when switching to mobile
        isOpen: isFloating ? false : prev.isOpen,
      }))
    }

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [checkIsFloating])

  // Update state handler
  const updateState = useCallback((updates: Partial<SidebarState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Convenience methods
  const open = useCallback(() => updateState({ isOpen: true }), [updateState])
  const close = useCallback(() => updateState({ isOpen: false }), [updateState])
  const toggle = useCallback(() => updateState({ isOpen: !state.isOpen }), [state.isOpen, updateState])
  const collapse = useCallback(() => updateState({ isCollapsed: true }), [updateState])
  const expand = useCallback(() => updateState({ isCollapsed: false }), [updateState])
  const toggleCollapse = useCallback(() => updateState({ isCollapsed: !state.isCollapsed }), [state.isCollapsed, updateState])

  return {
    state,
    updateState,
    open,
    close,
    toggle,
    collapse,
    expand,
    toggleCollapse,
  }
}