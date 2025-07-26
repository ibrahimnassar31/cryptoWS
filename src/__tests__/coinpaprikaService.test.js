import { fetchCryptoTickers } from '../services/coinpaprikaService.js';
import axios from 'axios';

jest.mock('axios');

describe('fetchCryptoTickers', () => {
  it('should fetch and map tickers from CoinPaprika', async () => {
    const mockApiResponse = [
      {
        id: 'btc-bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        rank: 1,
        quotes: {
          USD: {
            price: 100,
            volume_24h: 1000,
            market_cap: 10000,
            percent_change_1h: 0.1,
            percent_change_24h: 0.2,
            percent_change_7d: 0.3,
          },
        },
        last_updated: '2023-01-01T00:00:00Z',
      },
    ];
    axios.get.mockResolvedValue({ data: mockApiResponse });
    const result = await fetchCryptoTickers();
    expect(result).toEqual([
      {
        id: 'btc-bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        rank: 1,
        price: 100,
        volume_24h: 1000,
        market_cap: 10000,
        percent_change_1h: 0.1,
        percent_change_24h: 0.2,
        percent_change_7d: 0.3,
        last_updated: new Date('2023-01-01T00:00:00Z'),
      },
    ]);
  });
}); 