const axios = require('axios');

// Test GitLab API call
async function testGitLabAPI() {
  try {
    console.log('🔍 Testing GitLab API call...');
    
    // Get the access token from localStorage (you'll need to set this manually)
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('❌ No access token found in localStorage');
      return;
    }
    
    console.log('✅ Access token found, length:', accessToken.length);
    
    // Make the API call
    const response = await axios.get('http://localhost:8080/repositories/gitlab?page=1&per_page=100', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ GitLab API call successful:', response.status);
    console.log('📊 Response data:', response.data);
    
  } catch (error) {
    console.error('❌ GitLab API call failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full error:', error.response?.data);
  }
}

// Test the API call
testGitLabAPI();
