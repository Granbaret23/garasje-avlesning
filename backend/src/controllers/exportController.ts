import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { MeterModel } from '../models/Meter';
import { ReadingModel } from '../models/Reading';
import { logger } from '../config/logger';

export const exportToExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all data
    const meters = MeterModel.findAll();
    const readingsResult = ReadingModel.findAll({}, { page: 1, limit: 10000 });
    const readings = readingsResult.readings;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Garasje Avlesning App';
    workbook.created = new Date();

    // Overview sheet
    const overviewSheet = workbook.addWorksheet('Oversikt');
    
    // Add overview data
    overviewSheet.addRow(['Garasje Avlesning - Dataeksport']);
    overviewSheet.addRow(['Generert:', format(new Date(), 'dd. MMMM yyyy HH:mm', { locale: nb })]);
    overviewSheet.addRow([]);
    overviewSheet.addRow(['Statistikk:']);
    overviewSheet.addRow(['Antall målere:', meters.length]);
    overviewSheet.addRow(['Antall avlesninger:', readings.length]);
    overviewSheet.addRow(['Eksportert fra:', process.env.NODE_ENV || 'development']);

    // Style overview
    overviewSheet.getCell('A1').font = { size: 16, bold: true };
    overviewSheet.getCell('A4').font = { bold: true };

    // Meters sheet
    const metersSheet = workbook.addWorksheet('Målere');
    
    // Add headers for meters
    const meterHeaders = ['ID', 'Navn', 'Lokasjon', 'Type', 'Enhet', 'Opprettet', 'Sist oppdatert', 'Siste avlesning'];
    metersSheet.addRow(meterHeaders);

    // Style meter headers
    const meterHeaderRow = metersSheet.getRow(1);
    meterHeaderRow.font = { bold: true };
    meterHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E5E5' }
    };

    // Add meter data
    meters.forEach(meter => {
      metersSheet.addRow([
        meter.id,
        meter.name,
        meter.location || '',
        getMeterTypeLabel(meter.meter_type),
        meter.unit,
        format(new Date(meter.created_at), 'dd.MM.yyyy HH:mm', { locale: nb }),
        format(new Date(meter.updated_at), 'dd.MM.yyyy HH:mm', { locale: nb }),
        meter.latest_reading ? 
          `${meter.latest_reading.value} ${meter.unit} (${format(new Date(meter.latest_reading.reading_date), 'dd.MM.yyyy', { locale: nb })})` : 
          'Ingen avlesninger'
      ]);
    });

    // Auto-fit columns for meters sheet
    metersSheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Readings sheet
    const readingsSheet = workbook.addWorksheet('Avlesninger');
    
    // Add headers for readings
    const readingHeaders = [
      'ID', 'Måler', 'Lokasjon', 'Verdi', 'Enhet', 'Avlesningsdato', 
      'Metode', 'Synkronisert til Sheets', 'Notater', 'Opprettet'
    ];
    readingsSheet.addRow(readingHeaders);

    // Style reading headers
    const readingHeaderRow = readingsSheet.getRow(1);
    readingHeaderRow.font = { bold: true };
    readingHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E5E5' }
    };

    // Add reading data
    readings.forEach(reading => {
      readingsSheet.addRow([
        reading.id,
        reading.meter_name,
        reading.meter_location || '',
        reading.value,
        reading.meter_unit,
        format(new Date(reading.reading_date), 'dd.MM.yyyy HH:mm', { locale: nb }),
        getInputMethodLabel(reading.input_method),
        reading.synced_to_sheets ? 'Ja' : 'Nei',
        reading.notes || '',
        format(new Date(reading.created_at), 'dd.MM.yyyy HH:mm', { locale: nb })
      ]);
    });

    // Auto-fit columns for readings sheet
    readingsSheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Monthly summary sheet
    const summarySheet = workbook.addWorksheet('Månedssammendrag');
    
    // Group readings by meter and month
    const monthlyData = new Map();
    readings.forEach(reading => {
      const date = new Date(reading.reading_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const key = `${reading.meter_name}-${monthKey}`;
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          meter: reading.meter_name,
          month: monthKey,
          unit: reading.meter_unit,
          readings: []
        });
      }
      monthlyData.get(key).readings.push(reading.value);
    });

    // Add summary headers
    const summaryHeaders = ['Måler', 'Måned', 'Antall avlesninger', 'Min verdi', 'Max verdi', 'Gjennomsnitt', 'Enhet'];
    summarySheet.addRow(summaryHeaders);

    // Style summary headers
    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E5E5' }
    };

    // Add summary data
    Array.from(monthlyData.values())
      .sort((a, b) => a.meter.localeCompare(b.meter) || a.month.localeCompare(b.month))
      .forEach(data => {
        const values = data.readings;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        summarySheet.addRow([
          data.meter,
          data.month,
          values.length,
          min,
          max,
          Math.round(avg * 100) / 100,
          data.unit
        ]);
      });

    // Auto-fit columns for summary sheet
    summarySheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    // Generate filename
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const filename = `garasje-avlesning-${timestamp}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    
    logger.info(`Excel export completed: ${filename}`);
    
  } catch (error) {
    logger.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved eksport til Excel'
    });
  }
};

const getMeterTypeLabel = (type: string): string => {
  switch (type) {
    case 'electric':
      return 'Strøm';
    case 'water':
      return 'Vann';
    case 'gas':
      return 'Gass';
    case 'heat':
      return 'Varme';
    case 'other':
      return 'Annet';
    default:
      return type;
  }
};

const getInputMethodLabel = (method: string): string => {
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
};