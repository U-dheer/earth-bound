/**
 * Token Configuration for Gateway
 * Should match the auth service configuration
 */

export const TokenConfig = {
  // Access Token Settings
  accessToken: {
    /** Cookie maxAge in milliseconds */
    cookieMaxAge: 15 * 60 * 1000, // 15 minutes
  },

  // Refresh Token Settings
  refreshToken: {
    /** Cookie maxAge in milliseconds */
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Cookie Settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },
};
