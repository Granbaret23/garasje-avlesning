import { Router } from 'express';
import {
  createMeter,
  getAllMeters,
  getMeterById,
  updateMeter,
  deleteMeter
} from '../controllers/meterController';
import { getMeterReadings } from '../controllers/readingController';

const router = Router();

// GET /api/meters - Get all meters
router.get('/', getAllMeters);

// POST /api/meters - Create new meter
router.post('/', createMeter);

// GET /api/meters/:id - Get meter by ID
router.get('/:id', getMeterById);

// PUT /api/meters/:id - Update meter
router.put('/:id', updateMeter);

// DELETE /api/meters/:id - Delete meter
router.delete('/:id', deleteMeter);

// GET /api/meters/:meterId/readings - Get readings for specific meter
router.get('/:meterId/readings', getMeterReadings);

export default router;