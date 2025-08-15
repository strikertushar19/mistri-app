// Token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'authToken'
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'

  // Get authentication token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  // Set authentication token
  static setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  // Remove authentication token
  static removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.TOKEN_KEY)
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // Set refresh token
  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  // Remove refresh token
  static removeRefreshToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // Clear all tokens
  static clearAllTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  // Get token expiration time (if token contains expiration info)
  static getTokenExpiration(): Date | null {
    const token = this.getToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return new Date(payload.exp * 1000)
    } catch {
      return null
    }
  }

  // Check if token is expired
  static isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration()
    if (!expiration) return false
    return new Date() > expiration
  }
}
