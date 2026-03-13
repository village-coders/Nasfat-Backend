const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function testFlow() {
  try {
    console.log('--- Starting API Test Flow ---');

    // 1. Register Admin
    console.log('1. Registering Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Admin User',
      email: 'admin@nasfat.com',
      password: 'password123',
      role: 'admin'
    });
    const adminToken = adminRes.data.token;
    console.log('Admin Registered.');

    // 2. Register User
    console.log('2. Registering Regular User...');
    const userRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Regular User',
      email: 'user@nasfat.com',
      password: 'password123'
    });
    const userToken = userRes.data.token;
    console.log('User Registered.');

    // 3. User Submits Contribution
    console.log('3. User Submitting Contribution...');
    // Create a dummy file for upload
    const dummyFilePath = path.join(__dirname, 'dummy-receipt.txt');
    fs.writeFileSync(dummyFilePath, 'This is a dummy receipt');

    const form = new FormData();
    form.append('amount', '5000');
    form.append('receipt', fs.createReadStream(dummyFilePath));

    const uploadRes = await axios.post(`${API_URL}/contributions`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${userToken}`
      }
    });
    const contributionId = uploadRes.data.data._id;
    console.log(`Contribution submitted with ID: ${contributionId}`);

    // 4. Admin Views All Contributions
    console.log('4. Admin fetching all contributions...');
    const allContRes = await axios.get(`${API_URL}/contributions/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Admin found ${allContRes.data.data.length} contributions.`);

    // 5. Admin Verifies Contribution
    console.log('5. Admin verifying contribution...');
    const verifyRes = await axios.patch(`${API_URL}/contributions/${contributionId}/verify`, {
      status: 'paid'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Contribution status updated to: ${verifyRes.data.data.status}`);

    console.log('--- Test Flow Completed Successfully ---');
    
    // Cleanup
    fs.unlinkSync(dummyFilePath);
  } catch (error) {
    console.error('Test Flow Failed:', error.response ? error.response.data : error.message);
  }
}

// Note: Ensure the server is running before executing this script.
// testFlow();
