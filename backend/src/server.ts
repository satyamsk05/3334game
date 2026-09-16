import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config/env';
import { Database } from './db/database';
import { GameLoopEngine } from './game/GameLoopEngine';
import { GameWebSocketServer } from './websocket/GameWebSocketServer';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { gameRouter } from './routes/game';
import { walletRouter } from './routes/wallet';
import { adminRouter } from './routes/admin';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // Initialize Database Pool
  await Database.init();

  // Initialize Game Loop Engine
  GameLoopEngine.start();

  // Initialize WebSockets
  GameWebSocketServer.init(server);

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      service: '334game-backend',
      timestamp: new Date().toISOString(),
      databaseMode: Database.isMemory() ? 'IN_MEMORY' : 'POSTGRESQL'
    });
  });

  // Mount API Routers
  app.use('/admin', adminRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/game', gameRouter);
  app.use('/api/v1/wallet', walletRouter);
  app.use('/api/v1/admin', adminRouter);

  // Start HTTP + WS Server
  server.listen(config.port, () => {
    console.log(`
==================================================
🚀 334GAME AUTHORITATIVE SERVER IS NOW ONLINE!
🌐 HTTP API: http://localhost:${config.port}/api/v1
📡 WebSocket: ws://localhost:${config.port}/ws
🏥 Health: http://localhost:${config.port}/api/v1/health
==================================================
    `);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Server Bootstrap Error:', err);
  process.exit(1);
});
