import { ReadingModel } from '../models/Reading';
import { getGoogleSheetsService } from './googleSheets';
import { logger } from '../config/logger';

export class SyncScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private syncInterval: number;

  constructor(intervalMinutes: number = 60) {
    this.syncInterval = intervalMinutes * 60 * 1000; // Convert to milliseconds
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Sync scheduler is already running');
      return;
    }

    this.isRunning = true;
    
    // Run initial sync after 30 seconds
    setTimeout(() => {
      this.performSync();
    }, 30000);

    // Schedule regular syncs
    this.intervalId = setInterval(() => {
      this.performSync();
    }, this.syncInterval);

    logger.info(`Sync scheduler started with ${this.syncInterval / 60000} minute intervals`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Sync scheduler stopped');
  }

  async performSync(): Promise<void> {
    try {
      const googleSheetsService = getGoogleSheetsService();
      if (!googleSheetsService) {
        logger.debug('Google Sheets service not configured, skipping sync');
        return;
      }

      // Get unsynced readings
      const unsyncedReadings = ReadingModel.findUnsynced(100);
      
      if (unsyncedReadings.length === 0) {
        logger.debug('No unsynced readings found');
        return;
      }

      logger.info(`Starting sync of ${unsyncedReadings.length} readings`);

      // Sync to Google Sheets
      await googleSheetsService.syncReadings(unsyncedReadings);

      // Mark as synced
      const readingIds = unsyncedReadings.map(r => r.id);
      ReadingModel.markAsSynced(readingIds);

      logger.info(`Successfully synced ${unsyncedReadings.length} readings`);
    } catch (error) {
      logger.error('Error during automatic sync:', error);
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getNextSyncTime(): Date | null {
    if (!this.isRunning) {
      return null;
    }
    return new Date(Date.now() + this.syncInterval);
  }
}

// Singleton instance
let syncScheduler: SyncScheduler | null = null;

export const getSyncScheduler = (): SyncScheduler => {
  if (!syncScheduler) {
    const intervalMinutes = parseInt(process.env.SYNC_INTERVAL_MINUTES || '60');
    syncScheduler = new SyncScheduler(intervalMinutes);
  }
  return syncScheduler;
};

export const startSyncScheduler = (): void => {
  const scheduler = getSyncScheduler();
  scheduler.start();
};

export const stopSyncScheduler = (): void => {
  if (syncScheduler) {
    syncScheduler.stop();
  }
};

export default SyncScheduler;