// Test the login and getUserProfile endpoints
const axios = require('axios');

async function testAdminFlow() {
  try {
    console.log('🔄 Testing admin login flow...\n');
    
    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
      email: 'gg@gg.com',
      password: 'your_password_here' // Replace with actual password
    });
    
    console.log('✅ Login successful!');
    console.log('Access Token:', loginResponse.data.accessToken ? 'Received' : 'Missing');
    console.log('User ID:', loginResponse.data.userId);
    
    // Test get user profile
    console.log('\n2. Testing user profile fetch...');
    const profileResponse = await axios.get(`http://localhost:3001/api/users/${loginResponse.data.userId}`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.accessToken}`
      }
    });
    
    console.log('✅ Profile fetch successful!');
    console.log('User Data:', JSON.stringify(profileResponse.data, null, 2));
    console.log('\n🎯 Check if roles include "admin":', profileResponse.data.roles?.includes('admin') ? 'YES ✅' : 'NO ❌');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminFlow();