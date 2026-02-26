
import 'dotenv/config';
import app from '../src/app';
import axios from 'axios';
import { Server } from 'http';

const PORT = 3001;
const API_URL = `http://localhost:${PORT}/api/auth`;

let server: Server;

const startServer = () => {
    return new Promise<void>((resolve) => {
        server = app.listen(PORT, () => {
            console.log(`Test Server running on port ${PORT}`);
            resolve();
        });
    });
};

const stopServer = () => {
    return new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const testAuth = async () => {
    try {
        console.log('--- Testing Registration ---');
        const uniquePhone = '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        const user = {
            name: 'Test Farmer',
            email: `test${uniquePhone}@example.com`,
            phoneNumber: uniquePhone,
            password: 'Password123'
        };

        try {
            const registerRes = await axios.post(`${API_URL}/register`, user);
            console.log('✅ Registration Successful:', registerRes.data.message);
        } catch (error: any) {
            console.error('❌ Registration Failed:', error.response?.data || error.message);
        }

        console.log('\n--- Testing Login --');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                phoneNumber: user.phoneNumber,
                password: user.password
            });
            console.log('✅ Login Successful:', loginRes.data.message);
        } catch (error: any) {
            console.error('❌ Login Failed:', error.response?.data || error.message);
        }

        console.log('\n--- Testing Validation Errors ---');
        // Test 1: Short name
        try {
            await axios.post(`${API_URL}/register`, { ...user, name: 'A' });
            console.error('❌ Short Name Bypass Succeeded');
        } catch (error: any) {
            if (error.response?.status === 400) console.log('✅ Short Name Failed as expected');
        }

        // Test 2: Invalid Email
        try {
            await axios.post(`${API_URL}/register`, { ...user, email: 'notanemail' });
            console.error('❌ Invalid Email Bypass Succeeded');
        } catch (error: any) {
            if (error.response?.status === 400) console.log('✅ Invalid Email Failed as expected');
        }

        // Test 3: Weak Password
        try {
            await axios.post(`${API_URL}/register`, { ...user, password: 'weak' });
            console.error('❌ Weak Password Bypass Succeeded');
        } catch (error: any) {
            if (error.response?.status === 400) console.log('✅ Weak Password Failed as expected');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
};

const run = async () => {
    await startServer();
    await testAuth();
    await stopServer();
    process.exit(0);
};

run();
