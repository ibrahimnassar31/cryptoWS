import axios from 'axios';
import { COINPAPRIKA_API_URL } from '../constants/index.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Fetches cryptocurrency ticker data from external API
 * @returns {Promise<Array>} Array of cryptocurrency tickers
 * @throws {ApiError} If the API call fails
 */
export const fetchCryptoTickers = async () => {
  try {
    // Configure request with timeout and headers
    const config = {
      timeout: 10000, // 10 seconds
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoExpress/1.0'
      }
    };

    // Make API request
    const response = await axios.get(COINPAPRIKA_API_URL, config);

    // Validate response
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from CoinPaprika API');
    }

    // Map to simplified structure with proper error handling for missing data
    return response.data.map(ticker => ({
      id: ticker.id || `unknown-${Date.now()}`,
      name: ticker.name || 'Unknown',
      symbol: ticker.symbol || 'UNKNOWN',
      rank: parseInt(ticker.rank, 10) || 9999,
      price: ticker.quotes?.USD?.price !== undefined ? Number(ticker.quotes.USD.price) : null,
      volume_24h: ticker.quotes?.USD?.volume_24h !== undefined ? Number(ticker.quotes.USD.volume_24h) : null,
      market_cap: ticker.quotes?.USD?.market_cap !== undefined ? Number(ticker.quotes.USD.market_cap) : null,
      percent_change_1h: ticker.quotes?.USD?.percent_change_1h !== undefined ? Number(ticker.quotes.USD.percent_change_1h) : null,
      percent_change_24h: ticker.quotes?.USD?.percent_change_24h !== undefined ? Number(ticker.quotes.USD.percent_change_24h) : null,
      percent_change_7d: ticker.quotes?.USD?.percent_change_7d !== undefined ? Number(ticker.quotes.USD.percent_change_7d) : null,
      last_updated: ticker.last_updated ? new Date(ticker.last_updated) : new Date(),
    }));
  } catch (error) {
    // Better error handling with specific messages
    const errorMsg = error.response 
      ? `CoinPaprika API error: ${error.response.status} - ${error.response.statusText}`
      : error.request 
        ? 'No response received from CoinPaprika API' 
        : `CoinPaprika API request failed: ${error.message}`;

    console.error(errorMsg, error);

    // For network errors, return empty array but log the error
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
      console.warn('Network error when connecting to CoinPaprika API - will retry later');
      return [];
    }

    // For other errors, throw a proper API error
    throw new ApiError('Failed to fetch cryptocurrency data from external API', 503);
  }
};

/**
 * Fetches a single cryptocurrency by ID
 * @param {string} id - Cryptocurrency ID
 * @returns {Promise<Object|null>} Cryptocurrency data or null if not found
 */
export const fetchCryptoTickerById = async (id) => {
  try {
    if (!id) return null;

    const response = await axios.get(`${COINPAPRIKA_API_URL}/${id}`, {
      timeout: 5000
    });

    if (!response.data) return null;

    const ticker = response.data;
    return {
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
      last_updated: ticker.last_updated ? new Date(ticker.last_updated) : new Date(),
    };
  } catch (error) {
    // For 404, just return null
    if (error.response && error.response.status === 404) {
      return null;
    }

    console.error(`Error fetching cryptocurrency ${id}:`, error);
    return null;
  }
};
