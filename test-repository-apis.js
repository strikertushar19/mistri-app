// Test script for repository APIs
// Run this with: node test-repository-apis.js

const API_BASE_URL = 'http://localhost:8080'

// Mock authentication token (you'll need to replace this with a real token)
const AUTH_TOKEN = 'your-auth-token-here'

async function testRepositoryAPIs() {
  console.log('🧪 Testing Repository APIs...\n')

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }

  const apis = [
    { name: 'GitHub', url: '/repositories/github?page=1&per_page=5' },
    { name: 'GitLab', url: '/repositories/gitlab?page=1&per_page=5' },
    { name: 'Bitbucket', url: '/repositories/bitbucket?page=1&per_page=5' }
  ]

  for (const api of apis) {
    console.log(`📡 Testing ${api.name} API...`)
    
    try {
      const response = await fetch(`${API_BASE_URL}${api.url}`, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${api.name}: Success!`)
        console.log(`   - Repositories: ${data.repositories?.length || 0}`)
        console.log(`   - Organizations: ${data.organizations?.length || 0}`)
        console.log(`   - Total: ${data.total || 0}`)
        
        if (data.repositories?.length > 0) {
          console.log(`   - Sample repo: ${data.repositories[0].full_name}`)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log(`❌ ${api.name}: Failed (${response.status})`)
        console.log(`   - Error: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ ${api.name}: Network error`)
      console.log(`   - Error: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('🏁 Testing complete!')
}

// Instructions
console.log('📋 Instructions:')
console.log('1. Make sure your backend server is running on http://localhost:8080')
console.log('2. Replace AUTH_TOKEN with a valid authentication token')
console.log('3. Run: node test-repository-apis.js')
console.log('')

// Uncomment the line below to run the tests
// testRepositoryAPIs()
