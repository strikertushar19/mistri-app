import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// User storage utility for managing user data in localStorage
export const userStorage = {
  setUserData: (data: any) => {
    try {
      localStorage.setItem('userData', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  },

  getUserData: () => {
    try {
      const data = localStorage.getItem('userData')
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  },

  clearUserData: () => {
    try {
      localStorage.removeItem('userData')
    } catch (error) {
      console.error('Error clearing user data:', error) 
    }
  }
}
