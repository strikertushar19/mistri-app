import { useState, useCallback } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || "default",
    }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { toast, dismiss, toasts }
}

// Export a simple toast function for direct use
export const toast = (options: ToastOptions) => {
  // For now, just use console.log. In a real app, you'd use a proper toast library
  console.log(`[Toast] ${options.title}: ${options.description || ""}`)
  
  // You can integrate with a proper toast library like react-hot-toast or react-toastify here
  if (typeof window !== "undefined") {
    // Simple browser notification
    if (options.variant === "destructive") {
      console.error(`[Error] ${options.title}: ${options.description || ""}`)
    }
  }
}


