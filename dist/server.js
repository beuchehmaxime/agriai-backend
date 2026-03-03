import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initSocketServer } from './shared/websocket/socket.js';
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Database URL Present: ${!!process.env.DATABASE_URL}`);
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initSocketServer(server);
server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
