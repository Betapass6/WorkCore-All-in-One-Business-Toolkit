import rateLimit from 'express-rate-limit';

// Create different limiters for different endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// More lenient limiter for authenticated users
export const authApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // Higher limit for authenticated users
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Stricter limiter for sensitive endpoints
export const sensitiveApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Lower limit for sensitive endpoints
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  }
}); 