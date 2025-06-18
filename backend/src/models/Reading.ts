import { db } from '../config/database';
import { logger } from '../config/logger';

export interface Reading {
  id: number;
  meter_id: number;
  value: number;
  reading_date: string;
  image_path?: string;
  input_method: 'manual' | 'photo' | 'ocr';
  synced_to_sheets: boolean;
  notes?: string;
  created_at: string;
}

export interface CreateReadingData {
  meter_id: number;
  value: number;
  reading_date?: string;
  image_path?: string;
  input_method?: 'manual' | 'photo' | 'ocr';
  notes?: string;
}

export interface UpdateReadingData {
  value?: number;
  reading_date?: string;
  image_path?: string;
  input_method?: 'manual' | 'photo' | 'ocr';
  synced_to_sheets?: boolean;
  notes?: string;
}

export interface ReadingWithMeter extends Reading {
  meter_name: string;
  meter_location?: string;
  meter_unit: string;
}

export interface ReadingFilters {
  meter_id?: number;
  start_date?: string;
  end_date?: string;
  synced_to_sheets?: boolean;
  input_method?: 'manual' | 'photo' | 'ocr';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedReadings {
  readings: ReadingWithMeter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ReadingModel {
  static create(data: CreateReadingData): Reading {
    try {
      const stmt = db.prepare(`
        INSERT INTO readings (meter_id, value, reading_date, image_path, input_method, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.meter_id,
        data.value,
        data.reading_date || new Date().toISOString(),
        data.image_path || null,
        data.input_method || 'manual',
        data.notes || null
      );

      return this.findById(result.lastInsertRowid as number)!;
    } catch (error) {
      logger.error('Error creating reading:', error);
      throw error;
    }
  }

  static findAll(
    filters: ReadingFilters = {},
    pagination: PaginationOptions = {}
  ): PaginatedReadings {
    try {
      const { page = 1, limit = 50 } = pagination;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const whereParams: any[] = [];

      const conditions: string[] = [];

      if (filters.meter_id) {
        conditions.push('r.meter_id = ?');
        whereParams.push(filters.meter_id);
      }

      if (filters.start_date) {
        conditions.push('r.reading_date >= ?');
        whereParams.push(filters.start_date);
      }

      if (filters.end_date) {
        conditions.push('r.reading_date <= ?');
        whereParams.push(filters.end_date);
      }

      if (filters.synced_to_sheets !== undefined) {
        conditions.push('r.synced_to_sheets = ?');
        whereParams.push(filters.synced_to_sheets);
      }

      if (filters.input_method) {
        conditions.push('r.input_method = ?');
        whereParams.push(filters.input_method);
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Get total count
      const countStmt = db.prepare(`
        SELECT COUNT(*) as total
        FROM readings r
        INNER JOIN meters m ON r.meter_id = m.id
        ${whereClause}
      `);
      const { total } = countStmt.get(whereParams) as { total: number };

      // Get paginated results
      const stmt = db.prepare(`
        SELECT 
          r.*,
          m.name as meter_name,
          m.location as meter_location,
          m.unit as meter_unit
        FROM readings r
        INNER JOIN meters m ON r.meter_id = m.id
        ${whereClause}
        ORDER BY r.reading_date DESC, r.created_at DESC
        LIMIT ? OFFSET ?
      `);

      const readings = stmt.all([...whereParams, limit, offset]) as ReadingWithMeter[];

      return {
        readings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching readings:', error);
      throw error;
    }
  }

  static findById(id: number): Reading | null {
    try {
      const stmt = db.prepare('SELECT * FROM readings WHERE id = ?');
      const reading = stmt.get(id) as Reading | undefined;
      return reading || null;
    } catch (error) {
      logger.error('Error fetching reading by id:', error);
      throw error;
    }
  }

  static findByMeterId(
    meterId: number,
    pagination: PaginationOptions = {}
  ): PaginatedReadings {
    return this.findAll({ meter_id: meterId }, pagination);
  }

  static findLatestByMeterId(meterId: number): Reading | null {
    try {
      const stmt = db.prepare(`
        SELECT * FROM readings 
        WHERE meter_id = ? 
        ORDER BY reading_date DESC, created_at DESC 
        LIMIT 1
      `);
      const reading = stmt.get(meterId) as Reading | undefined;
      return reading || null;
    } catch (error) {
      logger.error('Error fetching latest reading by meter id:', error);
      throw error;
    }
  }

  static update(id: number, data: UpdateReadingData): Reading | null {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updates.length === 0) {
        return this.findById(id);
      }

      values.push(id);

      const stmt = db.prepare(`
        UPDATE readings 
        SET ${updates.join(', ')}
        WHERE id = ?
      `);

      const result = stmt.run(values);
      
      if (result.changes === 0) {
        return null;
      }

      return this.findById(id);
    } catch (error) {
      logger.error('Error updating reading:', error);
      throw error;
    }
  }

  static delete(id: number): boolean {
    try {
      const stmt = db.prepare('DELETE FROM readings WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting reading:', error);
      throw error;
    }
  }

  static markAsSynced(ids: number[]): void {
    try {
      const stmt = db.prepare(`
        UPDATE readings 
        SET synced_to_sheets = true 
        WHERE id IN (${ids.map(() => '?').join(',')})
      `);
      stmt.run(ids);
    } catch (error) {
      logger.error('Error marking readings as synced:', error);
      throw error;
    }
  }

  static findUnsynced(limit: number = 100): ReadingWithMeter[] {
    try {
      const stmt = db.prepare(`
        SELECT 
          r.*,
          m.name as meter_name,
          m.location as meter_location,
          m.unit as meter_unit
        FROM readings r
        INNER JOIN meters m ON r.meter_id = m.id
        WHERE r.synced_to_sheets = false
        ORDER BY r.reading_date ASC
        LIMIT ?
      `);

      return stmt.all(limit) as ReadingWithMeter[];
    } catch (error) {
      logger.error('Error fetching unsynced readings:', error);
      throw error;
    }
  }

  static getStatistics(meterId?: number): {
    total_readings: number;
    latest_reading_date?: string;
    average_value?: number;
    min_value?: number;
    max_value?: number;
  } {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (meterId) {
        whereClause = 'WHERE meter_id = ?';
        params.push(meterId);
      }

      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total_readings,
          MAX(reading_date) as latest_reading_date,
          AVG(value) as average_value,
          MIN(value) as min_value,
          MAX(value) as max_value
        FROM readings
        ${whereClause}
      `);

      return stmt.get(params) as any;
    } catch (error) {
      logger.error('Error fetching reading statistics:', error);
      throw error;
    }
  }
}