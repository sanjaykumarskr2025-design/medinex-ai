/**
 * API rate limiters using express-rate-limit.
 *
 * Protects endpoints from abuse, credential stuffing, and AI quota exhaustion.
 */

import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // stricter limit for login/signup
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // protect AI token quotas
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You have reached your AI message quota. Please wait a few minutes before asking more questions.' },
});
