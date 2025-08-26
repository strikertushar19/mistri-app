"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

interface Integration {
  avatar_url: string
  created_at: string
  email: string
  id: string
  is_active: boolean
  updated_at: string
  user: {
    avatar: string
    bitbucketIntegration: string
    created_at: string
    email: string
    first_name: string
    gitHubIntegration: string
    gitLabIntegration: string
    id: string
    is_active: boolean
    is_verified: boolean
    last_name: string
    provider: string
    refreshTokens: Array<{
      createdAt: string
      expiresAt: string
      id: string
      isRevoked: boolean
      token: string
      user: string
      userID: string
    }>
    sessions: Array<{
      clientIP: string
      createdAt: string
      expiresAt: string
      id: string
      isBlocked: boolean
      refreshToken: string
      user: string
      userAgent: string
      userID: string
    }>
    updated_at: string
  }
  user_id: string
  username: string
}

interface IntegrationResponse {
  bitbucket?: Integration
  github?: Integration
  gitlab?: Integration
}

export default function CodeProvidersPage() {
  const [integrations, setIntegrations] = useState<IntegrationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${API_BASE_URL}/integrations`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch integrations')
        }

        const data = await response.json()
        setIntegrations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [])

  // Handle URL parameters for OAuth success/error
  useEffect(() => {
    const success = searchParams.get('success')
    const provider = searchParams.get('provider')
    const error = searchParams.get('error')

    if (success === 'true' && provider) {
      setSuccessMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} integration successful!`)
      // Clear URL parameters to prevent infinite reload
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('provider')
      window.history.replaceState({}, '', url.toString())
      
      // Refresh integrations after successful OAuth
      setTimeout(() => {
        const fetchIntegrations = async () => {
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
            const response = await fetch(`${API_BASE_URL}/integrations`, {
              headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
              }
            })

            if (response.ok) {
              const data = await response.json()
              setIntegrations(data)
            }
          } catch (err) {
            console.error('Failed to refresh integrations:', err)
          }
        }
        fetchIntegrations()
      }, 2000)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } else if (error) {
      setError(`OAuth error: ${error}`)
      // Clear error parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Handle OAuth connection
  const handleConnect = async (provider: string) => {
    try {
      setConnecting(provider)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken')
      if (!token) {
        // Redirect to login if not authenticated
        router.push('/login')
        return
      }

      // Make API call to get OAuth URL with proper authentication
      const response = await fetch(`${API_BASE_URL}/auth/${provider}/init`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth flow')
      }

      const data = await response.json()
      
      // Redirect to the OAuth URL
      window.location.href = data.oauth_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setConnecting(null)
    }
  }

  // Handle disconnect
  const handleDisconnect = async (provider: string) => {
    try {
      setConnecting(provider)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/integrations/${provider}/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      // Refresh integrations
      const integrationsResponse = await fetch(`${API_BASE_URL}/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (integrationsResponse.ok) {
        const data = await integrationsResponse.json()
        setIntegrations(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setConnecting(null)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-6">Error: {error}</div>
  }

  // Create default cards even if no integrations exist
  const providers = [
    { id: 'github', name: 'GitHub', icon: '/github-mark.svg' },
    { id: 'gitlab', name: 'GitLab', icon: '/gitlab-svgrepo-com.svg' },
    { id: 'bitbucket', name: 'Bitbucket', icon: '/bitbucket.svg' }
  ]

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Code Provider Integrations</h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const integration = integrations?.[provider.id as keyof IntegrationResponse]
          
          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image
                    src={provider.icon}
                    alt={`${provider.name} icon`}
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  <CardTitle className="capitalize">{provider.name}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                {integration ? (
                  <CardDescription>
                    <div className="space-y-2">
                      <p><strong>Username:</strong> {integration.username}</p>
                      <p><strong>Email:</strong> {integration.email}</p>
                      <p><strong>Active:</strong> {integration.is_active ? 'Yes' : 'No'}</p>
                      <p><strong>Created:</strong> {new Date(integration.created_at).toLocaleDateString()}</p>
                      <p><strong>Updated:</strong> {new Date(integration.updated_at).toLocaleDateString()}</p>
                      <Button
                        onClick={() => handleDisconnect(provider.id)}
                        disabled={connecting === provider.id}
                        variant="destructive"
                        className="mt-2"
                      >
                        {connecting === provider.id ? 'Disconnecting...' : 'Disconnect'}
                      </Button>
                    </div>
                  </CardDescription>
                ) : (
                  <CardDescription>
                    <div className="space-y-2">
                      <p>Not connected</p>
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={connecting === provider.id}
                        className="mt-2"
                      >
                        {connecting === provider.id ? 'Connecting...' : `Connect ${provider.name}`}
                      </Button>
                    </div>
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
