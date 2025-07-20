import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initWebSocketServer } from './websocket/wsServer.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  initWebSocketServer(server);
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket running on ws://localhost:${PORT}`);
  });
};

startServer();
