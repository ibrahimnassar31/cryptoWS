import axios from 'axios';

const COINPAPRIKA_API_URL = 'https://api.coinpaprika.com/v1/tickers';

export const fetchCryptoTickers = async () => {
  try {
    const response = await axios.get(COINPAPRIKA_API_URL);
    const data = response.data;
    // Map to simplified structure
    return data.map(ticker => ({
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      rank: ticker.rank,
      price: ticker.quotes?.USD?.price ?? null,
      volume_24h: ticker.quotes?.USD?.volume_24h ?? null,
      market_cap: ticker.quotes?.USD?.market_cap ?? null,
      percent_change_1h: ticker.quotes?.USD?.percent_change_1h ?? null,
      percent_change_24h: ticker.quotes?.USD?.percent_change_24h ?? null,
      percent_change_7d: ticker.quotes?.USD?.percent_change_7d ?? null,
      last_updated: ticker.last_updated ? new Date(ticker.last_updated) : null,
    }));
  } catch (error) {
    console.error('Error fetching CoinPaprika data:', error);
    return [];
  }
};
