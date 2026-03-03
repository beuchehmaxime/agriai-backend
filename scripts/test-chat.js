import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { io } from 'socket.io-client';
const API_URL = 'http://localhost:3000/api';
async function testChatFlow() {
    // dynamically import fetch or use a fetch-like since we are in node 18+ probably
    const _fetch = global.fetch;
    try {
        // Create 2 test users (or use existing random ones from our generic auth endpoint logic if needed).
        // Best is to use Prisma directly here to setup standard environment.
        // Use the existing prisma service instance to avoid initialization issues
        const { default: prisma } = await import('../src/shared/prisma/prisma.service.js');
        // 1. Create a Farmer and an Agronomist
        const farmerId = `farmer-${Date.now()}`;
        const agroId = `agro-${Date.now()}`;
        let farmer = await prisma.user.create({
            data: { phoneNumber: farmerId, userType: 'FARMER', name: 'Test Farmer' }
        });
        let agro = await prisma.user.create({
            data: { phoneNumber: agroId, userType: 'AGRONOMIST', name: 'Test Agro' }
        });
        const JWT_SECRET = process.env.JWT_SECRET || 'secret';
        const farmerToken = jwt.sign({ userId: farmer.id }, JWT_SECRET, { expiresIn: '1h' });
        const agroToken = jwt.sign({ userId: agro.id }, JWT_SECRET, { expiresIn: '1h' });
        console.log('--- USERS CREATED ---');
        console.log('Farmer:', farmer.id);
        console.log('Agronomist:', agro.id);
        // 2. Fetch Agronomists BEFORE connection (Farmer perspective)
        let res = await _fetch(`${API_URL}/consultations/agronomists`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        });
        let agronomists = await res.json();
        console.log('\n--- FETCH AGRONOMISTS (BEFORE) ---');
        let found = agronomists.data.find((a) => a.id === agro.id);
        if (found) {
            console.log('SUCCESS: Agronomist is in the list initially.');
        }
        else {
            console.error('ERROR: Agronomist not found before connection.');
        }
        // 3. Create Consultation (Farmer connects to Agronomist)
        res = await _fetch(`${API_URL}/consultations`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${farmerToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ agronomistId: agro.id })
        });
        let consultationData = await res.json();
        const consultation = consultationData.data;
        console.log('\n--- CREATE CONSULTATION ---');
        console.log('Consultation ID:', consultation.id);
        if (consultation) {
            console.log('SUCCESS: Consultation created.');
        }
        // 4. Fetch Agronomists AFTER connection (Farmer perspective)
        res = await _fetch(`${API_URL}/consultations/agronomists`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        });
        agronomists = await res.json();
        console.log('\n--- FETCH AGRONOMISTS (AFTER) ---');
        found = agronomists.data.find((a) => a.id === agro.id);
        if (!found) {
            console.log('SUCCESS: Agronomist is HIDDEN from list after connection.');
        }
        else {
            console.error('ERROR: Agronomist is still visible!');
        }
        // 5. Fetch My Consultations
        res = await _fetch(`${API_URL}/consultations`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        });
        let myConsultations = await res.json();
        console.log('\n--- FETCH MY CONSULTATIONS (Farmer) ---');
        if (myConsultations.data.length > 0 && myConsultations.data[0].id === consultation.id) {
            console.log('SUCCESS: Consultation appears in list.');
            console.log('Other User Name:', myConsultations.data[0].otherUser.name);
        }
        else {
            console.error('ERROR: Missing consultation from my list.');
        }
        res = await _fetch(`${API_URL}/consultations`, {
            headers: { 'Authorization': `Bearer ${agroToken}` }
        });
        myConsultations = await res.json();
        console.log('\n--- FETCH MY CONSULTATIONS (Agro) ---');
        if (myConsultations.data.length > 0 && myConsultations.data[0].id === consultation.id) {
            console.log('SUCCESS: Consultation appears in list.');
            console.log('Other User Name:', myConsultations.data[0].otherUser.name);
        }
        else {
            console.error('ERROR: Missing consultation from my list.');
        }
        // 6. Test Socket Connection (Farmer sends message)
        console.log('\n--- TESTING SOCKET CONNECTION AND MESSAGING ---');
        const farmerSocket = io('http://localhost:3000', {
            auth: { token: farmerToken }
        });
        const agroSocket = io('http://localhost:3000', {
            auth: { token: agroToken }
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for connect
        const messageText = 'Hello Test Agronomist, testing message module!';
        // Agronomist listens for message
        agroSocket.on('receive_message', (msg) => {
            console.log('Agronomist received message via socket:', msg.text);
            if (msg.text === messageText) {
                console.log('SUCCESS: Socket message received successfully.');
                // Agronomist marks it as read
                agroSocket.emit('mark_read', { consultationId: consultation.id });
                console.log('Agronomist emitted mark_read event.');
            }
        });
        farmerSocket.on('messages_read', (data) => {
            console.log('Farmer notified that messages were read by', data.readBy);
            console.log('SUCCESS: Socket read receipt received.');
        });
        // Farmer sends message via REST Endpoint (testing the REST POST endpoint as well, which bypasses the old socket send for this test, or we can use socket)
        // Wait, socket send_message is still there, let's use socket send_message first.
        farmerSocket.emit('send_message', {
            consultationId: consultation.id,
            text: messageText
        });
        // wait to ensure message processes and read receipts fire
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Let's also test sending a message via HTTP REST POST
        res = await _fetch(`${API_URL}/messages/${consultation.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${farmerToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Second message via REST' })
        });
        const restMessage = await res.json();
        if (restMessage.success) {
            console.log('SUCCESS: Message sent via REST POST endpoint.');
        }
        // Test fetching paginated messages
        res = await _fetch(`${API_URL}/messages/${consultation.id}?page=1&limit=10`, {
            headers: { 'Authorization': `Bearer ${farmerToken}` }
        });
        const paginatedMessages = await res.json();
        console.log('\n--- FETCH MESSAGES (Pagination) ---');
        if (paginatedMessages.data.length === 2) {
            console.log('SUCCESS: Retrieved paginated messages successfully.');
        }
        else {
            console.error('ERROR: Unexpected number of messages:', paginatedMessages.data.length);
        }
        // Test marking as read via HTTP
        res = await _fetch(`${API_URL}/messages/${consultation.id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${agroToken}` }
        });
        const readResult = await res.json();
        console.log('\n--- MARK AS READ (REST) ---');
        if (readResult.success) {
            console.log('SUCCESS: Messages marked as read via REST API. Updated count:', readResult.data.updatedCount);
        }
        // Cleanup
        farmerSocket.disconnect();
        agroSocket.disconnect();
        await prisma.user.delete({ where: { id: farmer.id } });
        await prisma.user.delete({ where: { id: agro.id } });
        console.log('\nTEST COMPLETE. Check log for SUCCESS/ERROR');
        await prisma.$disconnect();
    }
    catch (err) {
        console.error('Test error:', err);
    }
}
testChatFlow();
