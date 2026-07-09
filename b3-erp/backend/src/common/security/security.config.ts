import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

/**
 * Security Configuration
 * Configures security headers and middleware for the application
 */
export function configureSecurityHeaders(app: INestApplication): void {
  // Helmet.js security headers
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // Cross-Origin settings
      crossOriginEmbedderPolicy: false, // Disable for development
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      // DNS Prefetch Control
      dnsPrefetchControl: { allow: false },
      // Frameguard - prevent clickjacking
      frameguard: { action: 'deny' },
      // Hide X-Powered-By header
      hidePoweredBy: true,
      // HSTS - HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // IE No Open
      ieNoOpen: true,
      // No Sniff
      noSniff: true,
      // Origin Agent Cluster
      originAgentCluster: true,
      // Permitted Cross-Domain Policies
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      // Referrer Policy
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // XSS Filter
      xssFilter: true,
    }),
  );
}

/**
 * CORS Configuration options
 */
export interface CorsOptions {
  origin:
    | string
    | string[]
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
}

/**
 * Get CORS configuration based on environment
 */
export function getCorsConfig(frontendUrl: string): CorsOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  // In dev, Next.js floats to the next free port (3000 → 3002 → …) whenever a
  // stale instance holds 3000, and a fixed allow-list then breaks CORS with a
  // browser "Failed to fetch". Reflect any localhost/127.0.0.1 origin in dev so
  // the port no longer matters. Production stays pinned to the exact frontend URL.
  const devOrigin = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };

  return {
    origin: isProduction ? frontendUrl : devOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400, // 24 hours
  };
}
