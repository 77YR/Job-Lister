/**
 * Quota limits per implementation-spec.md section 6
 */
export const QUOTA_LIMITS = {
  MAX_JOBS_PER_SEARCH: 50,
  DAILY_TARGET: 200,
  MONTHLY_TARGET: 800,
} as const;

/**
 * Application configuration
 */
export const CONFIG = {
  SERVER_PORT: 3000,
  CLIENT_PORT: 5173,
} as const;