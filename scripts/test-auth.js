import axios from 'axios';
const API_URL = 'http://localhost:3000/api/auth';
const testAuth = async () => {
    try {
        console.log('--- Testing Registration ---');
        const uniquePhone = '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        const user = {
            name: 'Test Farmer',
            email: `test${uniquePhone}@example.com`,
            phoneNumber: uniquePhone,
            password: 'password123'
        };
        try {
            const registerRes = await axios.post(`${API_URL}/register`, user);
            console.log('✅ Registration Successful:', registerRes.data.message);
            if (!registerRes.data.data.token)
                console.error('❌ Token missing in registration response');
        }
        catch (error) {
            console.error('❌ Registration Failed:', error.response?.data || error.message);
        }
        console.log('\n--- Testing Login --');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                phoneNumber: user.phoneNumber,
                password: user.password
            });
            console.log('✅ Login Successful:', loginRes.data.message);
            if (!loginRes.data.data.token)
                console.error('❌ Token missing in login response');
        }
        catch (error) {
            console.error('❌ Login Failed:', error.response?.data || error.message);
        }
        console.log('\n--- Testing Duplicate Registration (Should Fail) ---');
        try {
            await axios.post(`${API_URL}/register`, user);
            console.error('❌ Duplicate Registration Succeeded (Should have failed)');
        }
        catch (error) {
            if (error.response?.status === 409) {
                console.log('✅ Duplicate Registration Failed as expected:', error.response.data.message);
            }
            else {
                console.error('❌ Duplicate Registration Failed with unexpected status:', error.response?.status, error.response?.data);
            }
        }
        console.log('\n--- Testing Invalid Login (Should Fail) ---');
        try {
            await axios.post(`${API_URL}/login`, {
                phoneNumber: user.phoneNumber,
                password: 'wrongpassword'
            });
            console.error('❌ Invalid Login Succeeded (Should have failed)');
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid Login Failed as expected:', error.response.data.message);
            }
            else {
                console.error('❌ Invalid Login Failed with unexpected status:', error.response?.status, error.response?.data);
            }
        }
        console.log('\n--- Testing Validation Errors ---');
        try {
            await axios.post(`${API_URL}/register`, {
                ...user,
                email: 'invalid-email',
                password: 'short'
            });
            console.error('❌ Validation Bypass Succeeded (Should have failed with 400)');
        }
        catch (error) {
            if (error.response?.status === 400 && error.response.data.message === 'Validation Error') {
                console.log('✅ Validation Failed as expected:', error.response.data.errors);
            }
            else {
                console.error('❌ Validation Failed with unexpected status or message:', error.response?.status, error.response?.data);
            }
        }
    }
    catch (error) {
        console.error('Unexpected error:', error);
    }
};
testAuth();
