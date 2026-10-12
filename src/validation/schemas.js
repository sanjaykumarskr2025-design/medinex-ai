/**
 * Joi validation schemas for all incoming API payloads.
 *
 * Provides strict type checking, sanitization rules, and human-readable error messages.
 */

import Joi from 'joi';

// --- Reusable schema snippets ---
const dateIso = Joi.string().isoDate();

// --- Schemas ---

export const healthRecordSchema = Joi.object({
  type: Joi.string()
    .valid('checkup', 'lab_result', 'prescription', 'vaccination', 'procedure', 'symptom', 'note')
    .required(),
  title: Joi.string().min(2).max(200).required(),
  date: dateIso.required(),
  notes: Joi.string().max(5000).allow('', null),
  measurements: Joi.object().pattern(Joi.string(), Joi.number()).optional(),
});

export const appointmentSchema = Joi.object({
  provider_name: Joi.string().min(2).max(150).required(),
  purpose: Joi.string().min(2).max(250).required(),
  appointment_date: dateIso.required(),
  location: Joi.string().max(250).allow('', null),
  notes: Joi.string().max(2000).allow('', null),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').default('scheduled'),
});

export const reminderSchema = Joi.object({
  title: Joi.string().min(2).max(150).required(),
  reminder_type: Joi.string()
    .valid('medication', 'appointment', 'wellness', 'custom')
    .required(),
  due_date: dateIso.required(),
  recurrence: Joi.string().valid('none', 'daily', 'weekly', 'monthly').default('none'),
  notes: Joi.string().max(1000).allow('', null),
});

export const healthMetricSchema = Joi.object({
  metric_type: Joi.string()
    .valid(
      'blood_pressure',
      'heart_rate',
      'weight',
      'blood_sugar',
      'temperature',
      'oxygen_saturation',
      'sleep_hours',
      'steps',
      'water_intake'
    )
    .required(),
  value: Joi.number().required(),
  unit: Joi.string().min(1).max(20).required(),
  recorded_at: dateIso.required(),
});

export const userProfileSchema = Joi.object({
  display_name: Joi.string().min(1).max(100).allow('', null),
  preferred_language: Joi.string().valid('en', 'ta', 'hi', 'es').default('en'),
  units_system: Joi.string().valid('metric', 'imperial').default('metric'),
});

export const aiMessageSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  conversation_id: Joi.string().uuid().optional().allow(null, ''),
  language: Joi.string().valid('en', 'ta', 'hi', 'es').default('en'),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  display_name: Joi.string().min(1).max(100).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// --- Middleware factory ---
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }
    req.body = value; // replace body with validated & sanitized data
    next();
  };
}
