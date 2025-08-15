"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { SidebarState } from "@/components/sidebar/types"

interface SidebarContextType {
  state: SidebarState
  updateState: (updates: Partial<SidebarState>) => void
  openDropdown: string | null
  setOpenDropdown: (dropdownId: string | null) => void
  open: () => void
  close: () => void
  toggle: () => void
  collapse: () => void
  expand: () => void
  toggleCollapse: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  defaultOpen?: boolean
  breakpoint?: number
}

export function SidebarProvider({ 
  children, 
  defaultCollapsed = false, 
  defaultOpen = false, 
  breakpoint = 768 
}: SidebarProviderProps) {
  const [state, setState] = useState<SidebarState>({
    isOpen: defaultOpen,
    isCollapsed: defaultCollapsed,
    isFloating: false,
  })
  
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Load persisted state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const persistedState = localStorage.getItem('mistri-sidebar-state')
      if (persistedState) {
        const parsed = JSON.parse(persistedState)
        setState(prev => ({
          ...prev,
          isCollapsed: parsed.isCollapsed ?? defaultCollapsed,
          isOpen: parsed.isOpen ?? defaultOpen,
        }))
      }
      
      const persistedDropdown = localStorage.getItem('mistri-sidebar-dropdown')
      if (persistedDropdown) {
        setOpenDropdown(JSON.parse(persistedDropdown))
      }
    } catch (error) {
      console.warn('Failed to load persisted sidebar state:', error)
    }
  }, [defaultCollapsed, defaultOpen])

  // Persist state changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('mistri-sidebar-state', JSON.stringify({
        isCollapsed: state.isCollapsed,
        isOpen: state.isOpen,
      }))
    } catch (error) {
      console.warn('Failed to persist sidebar state:', error)
    }
  }, [state.isCollapsed, state.isOpen])

  // Persist dropdown state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('mistri-sidebar-dropdown', JSON.stringify(openDropdown))
    } catch (error) {
      console.warn('Failed to persist dropdown state:', error)
    }
  }, [openDropdown])

  // Check if we're on mobile/tablet
  const checkIsFloating = useCallback(() => {
    if (typeof window === 'undefined') return false
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

  const value: SidebarContextType = {
    state,
    updateState,
    openDropdown,
    setOpenDropdown,
    open,
    close,
    toggle,
    collapse,
    expand,
    toggleCollapse,
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}
