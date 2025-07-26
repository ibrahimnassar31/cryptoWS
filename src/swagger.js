export default {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CryptoExpress API',
      version: '1.0.0',
      description: 'API for real-time cryptocurrency data',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      schemas: {
        Ticker: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            symbol: { type: 'string' },
            rank: { type: 'integer' },
            price: { type: 'number' },
            volume_24h: { type: 'number' },
            market_cap: { type: 'number' },
            percent_change_1h: { type: 'number' },
            percent_change_24h: { type: 'number' },
            percent_change_7d: { type: 'number' },
            last_updated: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/api/tickers': {
        get: {
          summary: 'Get paginated, filtered, sorted tickers',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
              description: 'Results per page',
            },
            {
              name: 'sort',
              in: 'query',
              schema: { type: 'string', enum: ['price', 'market_cap', 'rank'] },
              description: 'Sort by field',
            },
            {
              name: 'symbol',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by symbol',
            },
          ],
          responses: {
            200: {
              description: 'Paginated tickers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Ticker' } },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/tickers/{id}': {
        get: {
          summary: 'Get a single ticker by id',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Ticker id',
            },
          ],
          responses: {
            200: {
              description: 'Ticker found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Ticker' },
                },
              },
            },
            404: {
              description: 'Ticker not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}; 