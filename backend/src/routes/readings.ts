import { Router } from 'express';
import {
  createReading,
  getAllReadings,
  getReadingById,
  getMeterReadings,
  updateReading,
  deleteReading,
  getReadingStatistics
} from '../controllers/readingController';

const router = Router();

// GET /api/readings - Get all readings with optional filters
router.get('/', getAllReadings);

// POST /api/readings - Create new reading
router.post('/', createReading);

// GET /api/readings/statistics - Get reading statistics
router.get('/statistics', getReadingStatistics);

// GET /api/readings/:id - Get reading by ID
router.get('/:id', getReadingById);

// PUT /api/readings/:id - Update reading
router.put('/:id', updateReading);

// DELETE /api/readings/:id - Delete reading
router.delete('/:id', deleteReading);

export default router;