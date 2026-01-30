/**
 * Centralized Token Configuration
 * All token expiry times are defined here for easy management
 */

export const TokenConfig = {
  // Access Token Settings
  accessToken: {
    /** JWT expiry time (e.g., '15m', '1h', '30s') */
    expiresIn: '15m' as const,
    /** Cookie maxAge in milliseconds */
    cookieMaxAge: 15 * 60 * 1000, // 15 minutes
  },

  // Refresh Token Settings
  refreshToken: {
    /** JWT expiry time (e.g., '7d', '30d', '1h') */
    expiresIn: '7d' as const,
    /** Cookie maxAge in milliseconds */
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    /** Database expiry in days */
    dbExpiryDays: 7,
  },

  // Cookie Settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },
} as const;

/**
 * Helper to get refresh token database expiry date
 */
export function getRefreshTokenExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(
    expiryDate.getDate() + TokenConfig.refreshToken.dbExpiryDays,
  );
  return expiryDate;
}
