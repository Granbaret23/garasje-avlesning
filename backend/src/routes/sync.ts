import { Router } from 'express';
import { 
  syncToSheets, 
  getSyncStatus, 
  testSheetsConnection 
} from '../controllers/syncController';
import { exportToExcel } from '../controllers/exportController';

const router = Router();

// POST /api/sync/sheets - Manual sync to Google Sheets
router.post('/sheets', syncToSheets);

// GET /api/sync/status - Get sync status and configuration
router.get('/status', getSyncStatus);

// GET /api/sync/test - Test Google Sheets connection
router.get('/test', testSheetsConnection);

// GET /api/sync/export/excel - Export data to Excel
router.get('/export/excel', exportToExcel);

export default router;