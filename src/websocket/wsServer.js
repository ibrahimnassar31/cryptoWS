import { WebSocketServer } from 'ws';
import { fetchCryptoTickers } from '../services/coinpaprikaService.js';
import logger from '../utils/logger.js';
import { createClient } from 'redis';

let wss;
let interval;


const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
});

redisClient.connect();

const CACHE_KEY = 'crypto_tickers';

export const initWebSocketServer = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        ws.send(JSON.stringify({ type: 'info', message: 'Connected to Crypto WebSocket' }));
        (async () => {
            try {
                const cachedData = await redisClient.get(CACHE_KEY);
                if (cachedData) {
                    ws.send(JSON.stringify({ type: 'tickers', data: JSON.parse(cachedData) }));
                }
            } catch (err) {
                logger.error('Error fetching cached data on connection:', err);
            }
        })();
    });

    const broadcastTickers = async () => {
        try {
            let tickers;
            const cachedTickers = await redisClient.get(CACHE_KEY);

            if (cachedTickers) {
                tickers = JSON.parse(cachedTickers);
            } else {
                tickers = await fetchCryptoTickers();
                if (tickers.length > 0) {
                    await redisClient.set(CACHE_KEY, JSON.stringify(tickers), {
                        EX: 60, // Cache for 60 seconds
                    });
                }
            }

            if (tickers.length && wss.clients.size > 0) {
                const payload = JSON.stringify({ type: 'tickers', data: tickers });
                wss.clients.forEach((client) => {
                    if (client.readyState === 1) {
                        client.send(payload);
                    }
                });
            }
        } catch (error) {
            logger.error('Error in broadcastTickers:', error);
        }
    };

    interval = setInterval(broadcastTickers, 10000);

    server.on('close', () => {
        logger.info('Closing WebSocket server and clearing interval.');
        clearInterval(interval);
        redisClient.quit();
        wss.close();
    });
};
