import http from 'http';
import WebSocket from 'ws';
import app from '../app.js';
import { initWebSocketServer } from '../websocket/wsServer.js';
import * as coinpaprikaService from '../services/coinpaprikaService.js';

jest.setTimeout(10000);

describe('WebSocket Server', () => {
  let server;
  let port;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(0, () => {
      port = server.address().port;
      initWebSocketServer(server);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should connect and receive initial info message', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      expect(msg.type).toBe('info');
      expect(msg.message).toMatch(/Connected/);
      ws.close();
      done();
    });
  });

  it('should broadcast tickers to all clients', (done) => {
    // Mock fetchCryptoTickers to return predictable data
    jest.spyOn(coinpaprikaService, 'fetchCryptoTickers').mockResolvedValue([
      { id: 'btc-bitcoin', name: 'Bitcoin', price: 100 },
    ]);
    const ws = new WebSocket(`ws://localhost:${port}`);
    let gotInfo = false;
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'info') {
        gotInfo = true;
      }
      if (msg.type === 'tickers') {
        expect(gotInfo).toBe(true);
        expect(Array.isArray(msg.data)).toBe(true);
        expect(msg.data[0]).toHaveProperty('id', 'btc-bitcoin');
        ws.close();
        done();
      }
    });
  });
}); 