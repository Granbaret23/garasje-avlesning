import { Request, Response } from 'express';
import { MeterModel, CreateMeterData, UpdateMeterData } from '../models/Meter';
import { logger } from '../config/logger';
import { validateMeter, validateMeterUpdate } from '../utils/validation';

export const createMeter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = validateMeter(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const existingMeter = MeterModel.findByName(value.name);
    if (existingMeter) {
      res.status(409).json({
        success: false,
        message: 'En måler med dette navn eksisterer allerede'
      });
      return;
    }

    const meter = MeterModel.create(value as CreateMeterData);
    
    logger.info(`Meter created: ${meter.name} (ID: ${meter.id})`);
    
    res.status(201).json({
      success: true,
      data: meter
    });
  } catch (error) {
    logger.error('Error creating meter:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved oppretting av måler'
    });
  }
};

export const getAllMeters = async (req: Request, res: Response): Promise<void> => {
  try {
    const meters = MeterModel.findAll();
    
    res.json({
      success: true,
      data: meters
    });
  } catch (error) {
    logger.error('Error fetching meters:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av målere'
    });
  }
};

export const getMeterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig måler ID'
      });
      return;
    }

    const meter = MeterModel.findById(id);
    if (!meter) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    res.json({
      success: true,
      data: meter
    });
  } catch (error) {
    logger.error('Error fetching meter by id:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av måler'
    });
  }
};

export const updateMeter = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig måler ID'
      });
      return;
    }

    const { error, value } = validateMeterUpdate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // Check if meter exists
    const existingMeter = MeterModel.findById(id);
    if (!existingMeter) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    // Check for name conflicts (if name is being updated)
    if (value.name && value.name !== existingMeter.name) {
      const meterWithSameName = MeterModel.findByName(value.name);
      if (meterWithSameName) {
        res.status(409).json({
          success: false,
          message: 'En måler med dette navn eksisterer allerede'
        });
        return;
      }
    }

    const updatedMeter = MeterModel.update(id, value as UpdateMeterData);
    
    if (!updatedMeter) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    logger.info(`Meter updated: ${updatedMeter.name} (ID: ${updatedMeter.id})`);
    
    res.json({
      success: true,
      data: updatedMeter
    });
  } catch (error) {
    logger.error('Error updating meter:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved oppdatering av måler'
    });
  }
};

export const deleteMeter = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig måler ID'
      });
      return;
    }

    const meter = MeterModel.findById(id);
    if (!meter) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    const deleted = MeterModel.delete(id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Måler ikke funnet'
      });
      return;
    }

    logger.info(`Meter deleted: ${meter.name} (ID: ${id})`);
    
    res.json({
      success: true,
      message: 'Måler slettet'
    });
  } catch (error) {
    logger.error('Error deleting meter:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved sletting av måler'
    });
  }
};