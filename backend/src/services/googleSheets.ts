import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { logger } from '../config/logger';
import { ReadingWithMeter } from '../models/Reading';

export interface GoogleSheetsConfig {
  serviceAccountPath: string;
  spreadsheetId: string;
  sheetName?: string;
}

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private sheetName: string;

  constructor(config: GoogleSheetsConfig) {
    this.spreadsheetId = config.spreadsheetId;
    this.sheetName = config.sheetName || 'Avlesninger';
    this.initializeAuth(config.serviceAccountPath);
  }

  private initializeAuth(serviceAccountPath: string): void {
    try {
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account file not found: ${serviceAccountPath}`);
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      logger.info('Google Sheets authentication initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Sheets auth:', error);
      throw error;
    }
  }

  async ensureSheetExists(): Promise<void> {
    try {
      // Get spreadsheet metadata
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      // Check if our sheet exists
      const sheetExists = spreadsheet.data.sheets?.some(
        (sheet: any) => sheet.properties?.title === this.sheetName
      );

      if (!sheetExists) {
        // Create the sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: this.sheetName,
                  },
                },
              },
            ],
          },
        });

        logger.info(`Created new sheet: ${this.sheetName}`);
      }

      // Ensure headers are present
      await this.ensureHeaders();
    } catch (error) {
      logger.error('Error ensuring sheet exists:', error);
      throw error;
    }
  }

  private async ensureHeaders(): Promise<void> {
    try {
      const headers = [
        'Dato',
        'Måler',
        'Lokasjon',
        'Verdi',
        'Enhet',
        'Metode',
        'Notater',
        'Synkronisert',
        'ID',
      ];

      // Check if headers exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:I1`,
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${this.sheetName}!A1:I1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });

        // Format headers
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: await this.getSheetId(),
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: {
                        red: 0.9,
                        green: 0.9,
                        blue: 0.9,
                      },
                      textFormat: {
                        bold: true,
                      },
                    },
                  },
                  fields: 'userEnteredFormat(backgroundColor,textFormat)',
                },
              },
            ],
          },
        });

        logger.info('Headers added to Google Sheet');
      }
    } catch (error) {
      logger.error('Error ensuring headers:', error);
      throw error;
    }
  }

  private async getSheetId(): Promise<number> {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s: any) => s.properties?.title === this.sheetName
    );

    return sheet?.properties?.sheetId || 0;
  }

  async syncReadings(readings: ReadingWithMeter[]): Promise<void> {
    try {
      await this.ensureSheetExists();

      if (readings.length === 0) {
        logger.info('No readings to sync');
        return;
      }

      // Convert readings to sheet format
      const values = readings.map((reading) => [
        new Date(reading.reading_date).toLocaleString('nb-NO'),
        reading.meter_name,
        reading.meter_location || '',
        reading.value,
        reading.meter_unit,
        this.getInputMethodLabel(reading.input_method),
        reading.notes || '',
        new Date().toLocaleString('nb-NO'),
        reading.id,
      ]);

      // Get existing data to find where to append
      const existingData = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:I`,
      });

      const existingRows = existingData.data.values?.length || 0;
      const startRow = existingRows + 1;

      // Append new data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A${startRow}:I${startRow + values.length - 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: values,
        },
      });

      logger.info(`Synced ${readings.length} readings to Google Sheets`);
    } catch (error) {
      logger.error('Error syncing readings to Google Sheets:', error);
      throw error;
    }
  }

  private getInputMethodLabel(method: string): string {
    switch (method) {
      case 'manual':
        return 'Manuell';
      case 'photo':
        return 'Bilde';
      case 'ocr':
        return 'OCR';
      default:
        return method;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      logger.info('Google Sheets connection test successful');
      return true;
    } catch (error) {
      logger.error('Google Sheets connection test failed:', error);
      return false;
    }
  }

  async createSampleSpreadsheet(): Promise<string> {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Garasje Avlesninger',
          },
          sheets: [
            {
              properties: {
                title: this.sheetName,
              },
            },
          ],
        },
      });

      const spreadsheetId = response.data.spreadsheetId;
      logger.info(`Created sample spreadsheet: ${spreadsheetId}`);

      // Set up headers in the new spreadsheet
      this.spreadsheetId = spreadsheetId!;
      await this.ensureHeaders();

      return spreadsheetId!;
    } catch (error) {
      logger.error('Error creating sample spreadsheet:', error);
      throw error;
    }
  }

  async getSpreadsheetInfo(): Promise<{
    title: string;
    url: string;
    lastModified: string;
  }> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      return {
        title: response.data.properties?.title || 'Unknown',
        url: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`,
        lastModified: response.data.properties?.modifiedTime || 'Unknown',
      };
    } catch (error) {
      logger.error('Error getting spreadsheet info:', error);
      throw error;
    }
  }
}

// Singleton instance
let googleSheetsService: GoogleSheetsService | null = null;

export const getGoogleSheetsService = (): GoogleSheetsService | null => {
  if (googleSheetsService) {
    return googleSheetsService;
  }

  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountPath || !spreadsheetId) {
    logger.warn('Google Sheets configuration not found. Service disabled.');
    return null;
  }

  try {
    googleSheetsService = new GoogleSheetsService({
      serviceAccountPath,
      spreadsheetId,
    });
    return googleSheetsService;
  } catch (error) {
    logger.error('Failed to initialize Google Sheets service:', error);
    return null;
  }
};

export default GoogleSheetsService;