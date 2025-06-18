import Joi from 'joi';

// Meter validation schemas
export const meterSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Målernavn er påkrevd',
      'string.min': 'Målernavn må være minst 1 tegn',
      'string.max': 'Målernavn kan ikke være lenger enn 100 tegn',
      'any.required': 'Målernavn er påkrevd'
    }),
  location: Joi.string()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Lokasjon kan ikke være lenger enn 200 tegn'
    }),
  meter_type: Joi.string()
    .valid('electric', 'water', 'gas', 'heat', 'other')
    .default('electric')
    .messages({
      'any.only': 'Målertype må være en av: electric, water, gas, heat, other'
    }),
  unit: Joi.string()
    .max(20)
    .default('kWh')
    .messages({
      'string.max': 'Enhet kan ikke være lenger enn 20 tegn'
    })
});

export const meterUpdateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Målernavn kan ikke være tomt',
      'string.min': 'Målernavn må være minst 1 tegn',
      'string.max': 'Målernavn kan ikke være lenger enn 100 tegn'
    }),
  location: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Lokasjon kan ikke være lenger enn 200 tegn'
    }),
  meter_type: Joi.string()
    .valid('electric', 'water', 'gas', 'heat', 'other')
    .messages({
      'any.only': 'Målertype må være en av: electric, water, gas, heat, other'
    }),
  unit: Joi.string()
    .max(20)
    .messages({
      'string.max': 'Enhet kan ikke være lenger enn 20 tegn'
    })
}).min(1).messages({
  'object.min': 'Minst ett felt må oppdateres'
});

// Reading validation schemas
export const readingSchema = Joi.object({
  meter_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Måler ID må være et tall',
      'number.integer': 'Måler ID må være et heltall',
      'number.positive': 'Måler ID må være et positivt tall',
      'any.required': 'Måler ID er påkrevd'
    }),
  value: Joi.number()
    .positive()
    .precision(3)
    .required()
    .messages({
      'number.base': 'Avlesningsverdi må være et tall',
      'number.positive': 'Avlesningsverdi må være et positivt tall',
      'any.required': 'Avlesningsverdi er påkrevd'
    }),
  reading_date: Joi.date()
    .iso()
    .max('now')
    .optional()
    .messages({
      'date.format': 'Avlesningsdato må være i ISO 8601 format',
      'date.max': 'Avlesningsdato kan ikke være i fremtiden'
    }),
  image_path: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bildesti kan ikke være lenger enn 500 tegn'
    }),
  input_method: Joi.string()
    .valid('manual', 'photo', 'ocr')
    .default('manual')
    .messages({
      'any.only': 'Inndata-metode må være en av: manual, photo, ocr'
    }),
  notes: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Notater kan ikke være lenger enn 1000 tegn'
    })
});

export const readingUpdateSchema = Joi.object({
  value: Joi.number()
    .positive()
    .precision(3)
    .messages({
      'number.base': 'Avlesningsverdi må være et tall',
      'number.positive': 'Avlesningsverdi må være et positivt tall'
    }),
  reading_date: Joi.date()
    .iso()
    .max('now')
    .messages({
      'date.format': 'Avlesningsdato må være i ISO 8601 format',
      'date.max': 'Avlesningsdato kan ikke være i fremtiden'
    }),
  image_path: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Bildesti kan ikke være lenger enn 500 tegn'
    }),
  input_method: Joi.string()
    .valid('manual', 'photo', 'ocr')
    .messages({
      'any.only': 'Inndata-metode må være en av: manual, photo, ocr'
    }),
  synced_to_sheets: Joi.boolean()
    .messages({
      'boolean.base': 'Synkroniseringsstatus må være true eller false'
    }),
  notes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Notater kan ikke være lenger enn 1000 tegn'
    })
}).min(1).messages({
  'object.min': 'Minst ett felt må oppdateres'
});

// Image upload validation
export const imageUploadSchema = Joi.object({
  meter_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Måler ID må være et tall',
      'number.integer': 'Måler ID må være et heltall',
      'number.positive': 'Måler ID må være et positivt tall',
      'any.required': 'Måler ID er påkrevd'
    })
});

// Export validation functions
export const validateMeter = (data: any) => meterSchema.validate(data, { abortEarly: false });
export const validateMeterUpdate = (data: any) => meterUpdateSchema.validate(data, { abortEarly: false });
export const validateReading = (data: any) => readingSchema.validate(data, { abortEarly: false });
export const validateReadingUpdate = (data: any) => readingUpdateSchema.validate(data, { abortEarly: false });
export const validateImageUpload = (data: any) => imageUploadSchema.validate(data, { abortEarly: false });