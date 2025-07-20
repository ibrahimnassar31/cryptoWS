# CryptoExpress Backend

A backend service using Express.js, MongoDB (Mongoose), and WebSocket (ws) to fetch and serve real-time cryptocurrency data from CoinPaprika.

## Features
- REST API for cryptocurrency tickers
- Real-time updates via WebSocket
- MongoDB for persistent storage

## Setup

### 1. Clone the repository

```
git clone <repo-url>
cd cryptoExpress
```

### 2. Install dependencies

```
npm install
```

### 3. Environment Variables

Create a `.env` file in the root:

```
MONGODB_URI=mongodb://localhost:27017/cryptoExpress
PORT=5000
```

### 4. Run the server

```
npm start
```

## API
- `GET /api/tickers` — Fetches and updates tickers from CoinPaprika, returns all from DB.

## WebSocket
- Connect to `ws://localhost:5000` to receive real-time ticker updates every 10 seconds.

## Code Quality
- ES6 modules, async/await, error handling, and best practices throughout.

---

**Built with ❤️ by a senior developer.**
