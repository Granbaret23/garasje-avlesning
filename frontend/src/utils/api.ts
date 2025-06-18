import axios from 'axios';
import { 
  Meter, 
  Reading, 
  ReadingWithMeter, 
  CreateMeterData, 
  UpdateMeterData, 
  CreateReadingData, 
  UpdateReadingData, 
  ReadingFilters, 
  PaginationOptions, 
  ApiResponse, 
  PaginatedReadings,
  ReadingStatistics
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add common headers
api.interceptors.request.use(
  (config) => {
    // Add auth headers here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      throw new Error('For mange forespørsler. Prøv igjen senere.');
    }
    if (error.response?.status >= 500) {
      throw new Error('Serverfeil. Prøv igjen senere.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Forespørselen tok for lang tid. Sjekk internettforbindelsen.');
    }
    throw error;
  }
);

// Meter API methods
export const meterApi = {
  // Get all meters
  getAll: async (): Promise<Meter[]> => {
    const response = await api.get<ApiResponse<Meter[]>>('/meters');
    return response.data.data || [];
  },

  // Get meter by ID
  getById: async (id: number): Promise<Meter> => {
    const response = await api.get<ApiResponse<Meter>>(`/meters/${id}`);
    if (!response.data.data) {
      throw new Error('Måler ikke funnet');
    }
    return response.data.data;
  },

  // Create new meter
  create: async (data: CreateMeterData): Promise<Meter> => {
    const response = await api.post<ApiResponse<Meter>>('/meters', data);
    if (!response.data.data) {
      throw new Error('Feil ved oppretting av måler');
    }
    return response.data.data;
  },

  // Update meter
  update: async (id: number, data: UpdateMeterData): Promise<Meter> => {
    const response = await api.put<ApiResponse<Meter>>(`/meters/${id}`, data);
    if (!response.data.data) {
      throw new Error('Feil ved oppdatering av måler');
    }
    return response.data.data;
  },

  // Delete meter
  delete: async (id: number): Promise<void> => {
    await api.delete(`/meters/${id}`);
  },

  // Get readings for a specific meter
  getReadings: async (
    meterId: number, 
    pagination?: PaginationOptions
  ): Promise<PaginatedReadings> => {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const response = await api.get<ApiResponse<ReadingWithMeter[]>>(
      `/meters/${meterId}/readings?${params.toString()}`
    );
    
    return {
      readings: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 50,
      totalPages: response.data.pagination?.totalPages || 0,
    };
  },
};

// Reading API methods
export const readingApi = {
  // Get all readings with filters and pagination
  getAll: async (
    filters?: ReadingFilters, 
    pagination?: PaginationOptions
  ): Promise<PaginatedReadings> => {
    const params = new URLSearchParams();
    
    if (filters?.meter_id) params.append('meter_id', filters.meter_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.synced_to_sheets !== undefined) {
      params.append('synced_to_sheets', filters.synced_to_sheets.toString());
    }
    if (filters?.input_method) params.append('input_method', filters.input_method);
    
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const response = await api.get<ApiResponse<ReadingWithMeter[]>>(
      `/readings?${params.toString()}`
    );
    
    return {
      readings: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 50,
      totalPages: response.data.pagination?.totalPages || 0,
    };
  },

  // Get reading by ID
  getById: async (id: number): Promise<Reading> => {
    const response = await api.get<ApiResponse<Reading>>(`/readings/${id}`);
    if (!response.data.data) {
      throw new Error('Avlesning ikke funnet');
    }
    return response.data.data;
  },

  // Create new reading
  create: async (data: CreateReadingData): Promise<Reading> => {
    const response = await api.post<ApiResponse<Reading>>('/readings', data);
    if (!response.data.data) {
      throw new Error('Feil ved oppretting av avlesning');
    }
    return response.data.data;
  },

  // Update reading
  update: async (id: number, data: UpdateReadingData): Promise<Reading> => {
    const response = await api.put<ApiResponse<Reading>>(`/readings/${id}`, data);
    if (!response.data.data) {
      throw new Error('Feil ved oppdatering av avlesning');
    }
    return response.data.data;
  },

  // Delete reading
  delete: async (id: number): Promise<void> => {
    await api.delete(`/readings/${id}`);
  },

  // Get reading statistics
  getStatistics: async (meterId?: number): Promise<ReadingStatistics> => {
    const params = new URLSearchParams();
    if (meterId) params.append('meter_id', meterId.toString());

    const response = await api.get<ApiResponse<ReadingStatistics>>(
      `/readings/statistics?${params.toString()}`
    );
    
    return response.data.data || {
      total_readings: 0,
    };
  },
};

// Upload API methods
export const uploadApi = {
  // Upload image
  uploadImage: async (file: File, meterId: number): Promise<{
    filename: string;
    filepath: string;
    meter_id: number;
    size: number;
    originalName: string;
  }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('meter_id', meterId.toString());

    const response = await api.post<ApiResponse<any>>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.data) {
      throw new Error('Feil ved opplasting av bilde');
    }
    return response.data.data;
  },

  // Get image URL
  getImageUrl: (filename: string): string => {
    return `${API_BASE_URL}/images/${filename}`;
  },
};

export default api;