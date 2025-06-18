import { db } from '../config/database';
import { logger } from '../config/logger';

export interface Meter {
  id: number;
  name: string;
  location?: string;
  meter_type: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeterData {
  name: string;
  location?: string;
  meter_type?: string;
  unit?: string;
}

export interface UpdateMeterData {
  name?: string;
  location?: string;
  meter_type?: string;
  unit?: string;
}

export interface MeterWithLatestReading extends Meter {
  latest_reading?: {
    value: number;
    reading_date: string;
  };
}

export class MeterModel {
  static create(data: CreateMeterData): Meter {
    try {
      const stmt = db.prepare(`
        INSERT INTO meters (name, location, meter_type, unit)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.name,
        data.location || null,
        data.meter_type || 'electric',
        data.unit || 'kWh'
      );

      return this.findById(result.lastInsertRowid as number)!;
    } catch (error) {
      logger.error('Error creating meter:', error);
      throw error;
    }
  }

  static findAll(): MeterWithLatestReading[] {
    try {
      const stmt = db.prepare(`
        SELECT 
          m.*,
          r.value as latest_value,
          r.reading_date as latest_reading_date
        FROM meters m
        LEFT JOIN readings r ON m.id = r.meter_id
        LEFT JOIN (
          SELECT meter_id, MAX(reading_date) as max_date
          FROM readings
          GROUP BY meter_id
        ) latest ON r.meter_id = latest.meter_id AND r.reading_date = latest.max_date
        ORDER BY m.name
      `);

      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        location: row.location,
        meter_type: row.meter_type,
        unit: row.unit,
        created_at: row.created_at,
        updated_at: row.updated_at,
        latest_reading: row.latest_value ? {
          value: row.latest_value,
          reading_date: row.latest_reading_date
        } : undefined
      }));
    } catch (error) {
      logger.error('Error fetching meters:', error);
      throw error;
    }
  }

  static findById(id: number): Meter | null {
    try {
      const stmt = db.prepare('SELECT * FROM meters WHERE id = ?');
      const meter = stmt.get(id) as Meter | undefined;
      return meter || null;
    } catch (error) {
      logger.error('Error fetching meter by id:', error);
      throw error;
    }
  }

  static findByName(name: string): Meter | null {
    try {
      const stmt = db.prepare('SELECT * FROM meters WHERE name = ?');
      const meter = stmt.get(name) as Meter | undefined;
      return meter || null;
    } catch (error) {
      logger.error('Error fetching meter by name:', error);
      throw error;
    }
  }

  static update(id: number, data: UpdateMeterData): Meter | null {
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
        UPDATE meters 
        SET ${updates.join(', ')}
        WHERE id = ?
      `);

      const result = stmt.run(values);
      
      if (result.changes === 0) {
        return null;
      }

      return this.findById(id);
    } catch (error) {
      logger.error('Error updating meter:', error);
      throw error;
    }
  }

  static delete(id: number): boolean {
    try {
      const stmt = db.prepare('DELETE FROM meters WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting meter:', error);
      throw error;
    }
  }

  static exists(id: number): boolean {
    try {
      const stmt = db.prepare('SELECT 1 FROM meters WHERE id = ? LIMIT 1');
      return !!stmt.get(id);
    } catch (error) {
      logger.error('Error checking meter existence:', error);
      throw error;
    }
  }
}