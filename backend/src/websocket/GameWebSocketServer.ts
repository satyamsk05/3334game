import WebSocket, { WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { GameLoopEngine, GameState } from '../game/GameLoopEngine';

export class GameWebSocketServer {
  private static wss: WebSocketServer | null = null;

  public static init(server: HttpServer): void {
    GameWebSocketServer.wss = new WebSocketServer({ server, path: '/ws' });

    GameWebSocketServer.wss.on('connection', (ws: WebSocket) => {
      console.log('📡 Client connected to Game WebSocket Server');

      // Send initial state upon connection
      const initialState = GameLoopEngine.getSnapshotForUser('default_user');
      ws.send(JSON.stringify({ type: 'GAME_STATE', payload: initialState }));

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } catch (e) {
          // ignore malformed message
        }
      });

      ws.on('close', () => {
        console.log('📡 Client disconnected from WebSocket');
      });
    });

    // Subscribe to state updates from GameLoopEngine
    GameLoopEngine.onStateUpdate((state: GameState) => {
      GameWebSocketServer.broadcast('GAME_STATE', state);
    });

    console.log('✅ WebSocket Server listening on /ws');
  }

  public static broadcast(type: string, payload: any): void {
    if (!GameWebSocketServer.wss) return;

    const data = JSON.stringify({ type, payload });
    GameWebSocketServer.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}
