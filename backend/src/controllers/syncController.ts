import { Request, Response } from 'express';
import { ReadingModel } from '../models/Reading';
import { getGoogleSheetsService } from '../services/googleSheets';
import { getSyncScheduler } from '../services/syncScheduler';
import { logger } from '../config/logger';

export const syncToSheets = async (req: Request, res: Response): Promise<void> => {
  try {
    const googleSheetsService = getGoogleSheetsService();
    if (!googleSheetsService) {
      res.status(503).json({
        success: false,
        message: 'Google Sheets service ikke konfigurert'
      });
      return;
    }

    // Get unsynced readings
    const unsyncedReadings = ReadingModel.findUnsynced(1000); // Sync up to 1000 readings at once
    
    if (unsyncedReadings.length === 0) {
      res.json({
        success: true,
        message: 'Ingen nye avlesninger å synkronisere',
        data: {
          synced_count: 0,
          total_unsynced: 0
        }
      });
      return;
    }

    logger.info(`Manual sync requested for ${unsyncedReadings.length} readings`);

    // Sync to Google Sheets
    await googleSheetsService.syncReadings(unsyncedReadings);

    // Mark as synced
    const readingIds = unsyncedReadings.map(r => r.id);
    ReadingModel.markAsSynced(readingIds);

    logger.info(`Successfully synced ${unsyncedReadings.length} readings`);

    res.json({
      success: true,
      message: `${unsyncedReadings.length} avlesninger synkronisert til Google Sheets`,
      data: {
        synced_count: unsyncedReadings.length,
        total_unsynced: 0
      }
    });
  } catch (error) {
    logger.error('Error syncing to Google Sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved synkronisering til Google Sheets'
    });
  }
};

export const getSyncStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const googleSheetsService = getGoogleSheetsService();
    const syncScheduler = getSyncScheduler();
    
    // Get unsynced count
    const unsyncedReadings = ReadingModel.findUnsynced(1);
    const unsyncedCount = ReadingModel.getStatistics().total_readings - 
                         ReadingModel.findAll({ synced_to_sheets: true }).total;

    // Get Google Sheets info if available
    let sheetsInfo = null;
    if (googleSheetsService) {
      try {
        sheetsInfo = await googleSheetsService.getSpreadsheetInfo();
      } catch (error) {
        logger.warn('Could not get Google Sheets info:', error);
      }
    }

    res.json({
      success: true,
      data: {
        google_sheets_configured: !!googleSheetsService,
        auto_sync_enabled: syncScheduler.isActive(),
        next_sync_time: syncScheduler.getNextSyncTime(),
        unsynced_count: unsyncedCount,
        sheets_info: sheetsInfo
      }
    });
  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av synkroniseringsstatus'
    });
  }
};

export const testSheetsConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const googleSheetsService = getGoogleSheetsService();
    if (!googleSheetsService) {
      res.status(503).json({
        success: false,
        message: 'Google Sheets service ikke konfigurert'
      });
      return;
    }

    const isConnected = await googleSheetsService.testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Tilkobling til Google Sheets fungerer'
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Kunne ikke koble til Google Sheets'
      });
    }
  } catch (error) {
    logger.error('Error testing Google Sheets connection:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved testing av Google Sheets tilkobling'
    });
  }
};