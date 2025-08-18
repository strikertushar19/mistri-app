import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// LocalStorage utilities for user data
export const userStorage = {
  setUserData: (data: {
    avatarUrl?: string
    firstName?: string
    lastName?: string
    email?: string
  }) => {
    if (typeof window === "undefined") return
    
    if (data.avatarUrl) localStorage.setItem("userAvatarUrl", data.avatarUrl)
    if (data.firstName) localStorage.setItem("userFirstName", data.firstName)
    if (data.lastName) localStorage.setItem("userLastName", data.lastName)
    if (data.email) localStorage.setItem("userEmail", data.email)
  },
  
  getUserData: () => {
    if (typeof window === "undefined") return null
    
    return {
      avatarUrl: localStorage.getItem("userAvatarUrl"),
      firstName: localStorage.getItem("userFirstName"),
      lastName: localStorage.getItem("userLastName"),
      email: localStorage.getItem("userEmail"),
    }
  },
  
  clearUserData: () => {
    if (typeof window === "undefined") return
    
    localStorage.removeItem("userAvatarUrl")
    localStorage.removeItem("userFirstName")
    localStorage.removeItem("userLastName")
    localStorage.removeItem("userEmail")
  }
}
