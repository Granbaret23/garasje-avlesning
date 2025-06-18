import { Request, Response } from 'express';
import { ReadingModel, CreateReadingData, UpdateReadingData } from '../models/Reading';
import { MeterModel } from '../models/Meter';
import { logger } from '../config/logger';
import { validateReading, validateReadingUpdate } from '../utils/validation';

export const createReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = validateReading(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // Check if meter exists
    const meterExists = MeterModel.exists(value.meter_id);
    if (!meterExists) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    const reading = ReadingModel.create(value as CreateReadingData);
    
    logger.info(`Reading created: ${reading.value} for meter ID ${reading.meter_id}`);
    
    res.status(201).json({
      success: true,
      data: reading
    });
  } catch (error) {
    logger.error('Error creating reading:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved oppretting av avlesning'
    });
  }
};

export const getAllReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const meter_id = req.query.meter_id ? parseInt(req.query.meter_id as string) : undefined;
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;
    const synced_to_sheets = req.query.synced_to_sheets === 'true' ? true : 
                           req.query.synced_to_sheets === 'false' ? false : undefined;
    const input_method = req.query.input_method as 'manual' | 'photo' | 'ocr' | undefined;

    const filters = {
      meter_id,
      start_date,
      end_date,
      synced_to_sheets,
      input_method
    };

    const result = ReadingModel.findAll(filters, { page, limit });
    
    res.json({
      success: true,
      data: result.readings,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching readings:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av avlesninger'
    });
  }
};

export const getReadingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig avlesnings ID'
      });
      return;
    }

    const reading = ReadingModel.findById(id);
    if (!reading) {
      res.status(404).json({
        success: false,
        message: 'Avlesning ikke funnet'
      });
      return;
    }

    res.json({
      success: true,
      data: reading
    });
  } catch (error) {
    logger.error('Error fetching reading by id:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av avlesning'
    });
  }
};

export const getMeterReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const meterId = parseInt(req.params.meterId);
    if (isNaN(meterId)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig måler ID'
      });
      return;
    }

    // Check if meter exists
    const meterExists = MeterModel.exists(meterId);
    if (!meterExists) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = ReadingModel.findByMeterId(meterId, { page, limit });
    
    res.json({
      success: true,
      data: result.readings,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching meter readings:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av måleravlesninger'
    });
  }
};

export const updateReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig avlesnings ID'
      });
      return;
    }

    const { error, value } = validateReadingUpdate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const updatedReading = ReadingModel.update(id, value as UpdateReadingData);
    
    if (!updatedReading) {
      res.status(404).json({
        success: false,
        message: 'Avlesning ikke funnet'
      });
      return;
    }

    logger.info(`Reading updated: ID ${id}, value: ${updatedReading.value}`);
    
    res.json({
      success: true,
      data: updatedReading
    });
  } catch (error) {
    logger.error('Error updating reading:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved oppdatering av avlesning'
    });
  }
};

export const deleteReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig avlesnings ID'
      });
      return;
    }

    const reading = ReadingModel.findById(id);
    if (!reading) {
      res.status(404).json({
        success: false,
        message: 'Avlesning ikke funnet'
      });
      return;
    }

    const deleted = ReadingModel.delete(id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Avlesning ikke funnet'
      });
      return;
    }

    logger.info(`Reading deleted: ID ${id}, value: ${reading.value}`);
    
    res.json({
      success: true,
      message: 'Avlesning slettet'
    });
  } catch (error) {
    logger.error('Error deleting reading:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved sletting av avlesning'
    });
  }
};

export const getReadingStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const meterId = req.query.meter_id ? parseInt(req.query.meter_id as string) : undefined;
    
    if (meterId && !MeterModel.exists(meterId)) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    const statistics = ReadingModel.getStatistics(meterId);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Error fetching reading statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av statistikk'
    });
  }
};