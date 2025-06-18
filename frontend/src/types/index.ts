export interface Meter {
  id: number;
  name: string;
  location?: string;
  meter_type: 'electric' | 'water' | 'gas' | 'heat' | 'other';
  unit: string;
  created_at: string;
  updated_at: string;
  latest_reading?: {
    value: number;
    reading_date: string;
  };
}

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

export interface ReadingWithMeter extends Reading {
  meter_name: string;
  meter_location?: string;
  meter_unit: string;
}

export interface CreateMeterData {
  name: string;
  location?: string;
  meter_type?: 'electric' | 'water' | 'gas' | 'heat' | 'other';
  unit?: string;
}

export interface UpdateMeterData {
  name?: string;
  location?: string;
  meter_type?: 'electric' | 'water' | 'gas' | 'heat' | 'other';
  unit?: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReadingStatistics {
  total_readings: number;
  latest_reading_date?: string;
  average_value?: number;
  min_value?: number;
  max_value?: number;
}