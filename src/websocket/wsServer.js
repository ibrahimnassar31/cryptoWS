import { WebSocketServer } from 'ws';
import { fetchCryptoTickers } from '../services/coinpaprikaService.js';

let wss;

export const initWebSocketServer = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'info', message: 'Connected to Crypto WebSocket' }));
  });

  setInterval(async () => {
    const tickers = await fetchCryptoTickers();
    if (tickers.length && wss.clients.size > 0) {
      const payload = JSON.stringify({ type: 'tickers', data: tickers });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(payload);
        }
      });
    }
  }, 10000);
};
