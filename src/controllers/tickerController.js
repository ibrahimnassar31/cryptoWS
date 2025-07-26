import * as tickerService from '../services/tickerService.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { validate } from '../utils/validation.js';

/**
 * Get paginated, filtered, sorted list of tickers
 * @route GET /api/tickers
 */
export const getTickers = async (req, res, next) => {
  try {
    const validationError = validate(req, res);
    if (validationError) return;

    const response = await tickerService.getTickers(req.query);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single ticker by ID
 * @route GET /api/tickers/:id
 */
export const getTickerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticker = await tickerService.getTickerById(id);
    if (!ticker) {
      throw new ApiError(`Ticker with id '${id}' not found`, 404);
    }

    return res.status(200).json(ticker);
  } catch (error) {
    next(error);
  }
};

