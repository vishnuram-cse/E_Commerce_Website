const runTests = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('Starting API validation tests...');

  try {
    // 1. Health check
    console.log('\n--- 1. Testing Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('Health Check Status:', healthRes.status);
    console.log('Health Check Response:', healthData);

    if (healthRes.status !== 200 || !healthData.success) {
      throw new Error('Health check failed');
    }

    // 2. Register a new user
    console.log('\n--- 2. Testing Register ---');
    const testEmail = `tester_${Date.now()}@example.com`;
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Tester',
        email: testEmail,
        password: 'password123'
      })
    });
    const registerData = await registerRes.json();
    console.log('Register Status:', registerRes.status);
    console.log('Register Response:', registerData);

    if (registerRes.status !== 201 || !registerData.success) {
      throw new Error('Register failed');
    }

    // 3. Login
    console.log('\n--- 3. Testing Login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response Token exists:', !!loginData.token);

    if (loginRes.status !== 200 || !loginData.success || !loginData.token) {
      throw new Error('Login failed');
    }

    const token = loginData.token;

    // 4. Get profile
    console.log('\n--- 4. Testing GET /auth/me ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const meData = await meRes.json();
    console.log('Profile Status:', meRes.status);
    console.log('Profile Data:', meData);

    if (meRes.status !== 200 || !meData.success) {
      throw new Error('Get profile failed');
    }

    // 5. Get products
    console.log('\n--- 5. Testing GET /products ---');
    const productsRes = await fetch(`${BASE_URL}/products`);
    const productsData = await productsRes.json();
    console.log('Products Status:', productsRes.status);
    console.log('Total Products Loaded:', productsData.total);
    console.log('First Product Name:', productsData.products?.[0]?.name);

    if (productsRes.status !== 200 || !productsData.success) {
      throw new Error('Get products failed');
    }

    console.log('\n=======================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
    console.log('=======================================');

  } catch (error) {
    console.error('API Verification Test FAILED:', error.message);
    process.exit(1);
  }
};

runTests();
