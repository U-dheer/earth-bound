import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  AuthenticationService,
  TokenExpiredError,
} from '../services/auth.service';
import { AuthenticatedUser } from '../interfaces/auth.interfaces';
import { TokenConfig } from '../config/token.config';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  // Public paths that don't require authentication
  private readonly publicPaths: { method?: string; path: RegExp }[] = [];

  constructor(private readonly authService: AuthenticationService) {
    this.initializePublicPaths();
  }

  /**
   * Initialize public paths from environment or defaults
   */
  private initializePublicPaths(): void {
    const publicPathsConfig =
      process.env.GATEWAY_PUBLIC_PATHS ||
      '/auth/signup,/auth/login,/auth/refresh,/status,/auth/forgot-password';

    const paths = publicPathsConfig.split(',').map((p) => p.trim());

    for (const pathConfig of paths) {
      if (pathConfig.includes(':')) {
        // Format: METHOD:/path/*
        const [method, path] = pathConfig.split(':');
        this.publicPaths.push({
          method: method.toUpperCase(),
          path: this.pathToRegex(path),
        });
      } else {
        // Format: /path/* (all methods)
        this.publicPaths.push({
          path: this.pathToRegex(pathConfig),
        });
      }
    }

    this.logger.log(`Initialized ${this.publicPaths.length} public paths`);
  }

  /**
   * Converts a path pattern to a regex
   * Supports wildcards: * for any segment, ** for any path
   * Patterns without wildcards will match the exact path or paths starting with it
   */
  private pathToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*\*/g, '.*') // ** matches any path
      .replace(/\*/g, '[^/]*'); // * matches any segment

    // If pattern doesn't end with wildcard, allow optional trailing content
    // This makes /auth/login match /auth/login and /auth/login/
    const hasWildcard = pattern.includes('*');
    const regexPattern = hasWildcard ? `^${escaped}$` : `^${escaped}(?:/.*)?$`;

    return new RegExp(regexPattern);
  }

  /**
   * Checks if a request path is public (doesn't require auth)
   */
  private isPublicPath(method: string, path: string): boolean {
    // Remove query string for matching
    const cleanPath = path.split('?')[0];

    this.logger.debug(`Checking if path is public: ${method} ${cleanPath}`);

    const isPublic = this.publicPaths.some((publicPath) => {
      const pathMatches = publicPath.path.test(cleanPath);
      const methodMatches =
        !publicPath.method || publicPath.method === method.toUpperCase();

      if (pathMatches && methodMatches) {
        this.logger.debug(`Path matched public pattern: ${publicPath.path}`);
      }

      return pathMatches && methodMatches;
    });

    this.logger.debug(`Path ${cleanPath} is public: ${isPublic}`);
    return isPublic;
  }

  /**
   * Extracts access token from request
   * Priority: Authorization header > Cookie
   */
  private extractAccessToken(req: Request): string | null {
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fall back to cookie
    const accessTokenCookie = req.cookies?.accessToken;
    if (accessTokenCookie) {
      return accessTokenCookie;
    }

    return null;
  }

  /**
   * Extracts refresh token from cookies
   */
  private extractRefreshToken(req: Request): string | null {
    return req.cookies?.refreshToken || null;
  }

  /**
   * Sets new tokens in response cookies
   */
  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('accessToken', accessToken, {
      ...TokenConfig.cookie,
      maxAge: TokenConfig.accessToken.cookieMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      ...TokenConfig.cookie,
      maxAge: TokenConfig.refreshToken.cookieMaxAge,
    });
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const method = req.method;
    // Use originalUrl to get the full path including base path
    const url = req.originalUrl || req.url;

    // Skip authentication for public paths
    if (this.isPublicPath(method, url)) {
      this.logger.debug(`Skipping auth for public path: ${method} ${url}`);
      return next();
    }

    // Extract access token
    const accessToken = this.extractAccessToken(req);
    const refreshToken = this.extractRefreshToken(req);

    // No token provided
    if (!accessToken && !refreshToken) {
      this.logger.warn(`No tokens provided for: ${method} ${url}`);
      throw new UnauthorizedException(
        'Authentication required. Please provide a valid access token.',
      );
    }

    try {
      // Try to validate the access token
      if (accessToken) {
        try {
          const validationResult =
            await this.authService.validateToken(accessToken);

          if (validationResult.valid && validationResult.user) {
            // Token is valid, attach user to request
            req.user = {
              userId: validationResult.user._id,
              email: validationResult.user.email,
              role: validationResult.user.role,
              isActive: validationResult.user.isActive,
            };

            // Update the Authorization header for downstream services
            req.headers.authorization = `Bearer ${accessToken}`;

            this.logger.debug(
              `Request authenticated for user: ${req.user.userId}`,
            );
            return next();
          }
        } catch (error) {
          // If token validation fails and we have a refresh token, try to refresh
          if (refreshToken) {
            this.logger.debug(
              `Access token validation failed (${error.message}), attempting token refresh...`,
            );
            return this.handleTokenRefresh(req, res, next, refreshToken);
          }
          // No refresh token available, throw the original error
          throw error;
        }
      }

      // No access token but have refresh token - try to refresh
      if (refreshToken) {
        this.logger.debug('No access token, attempting token refresh...');
        return this.handleTokenRefresh(req, res, next, refreshToken);
      }

      throw new UnauthorizedException('Invalid authentication token');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Authentication error: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Handles token refresh flow
   */
  private async handleTokenRefresh(
    req: Request,
    res: Response,
    next: NextFunction,
    refreshToken: string,
  ): Promise<void> {
    try {
      // Attempt to refresh tokens
      const newTokens = await this.authService.refreshTokens(refreshToken);

      if (!newTokens.accessToken) {
        throw new UnauthorizedException(
          'Failed to refresh tokens. Please login again.',
        );
      }

      // Validate the new access token to get user info
      const validationResult = await this.authService.validateToken(
        newTokens.accessToken,
      );

      if (!validationResult.valid || !validationResult.user) {
        throw new UnauthorizedException('Invalid token received after refresh');
      }

      // Set new tokens in cookies
      this.setTokenCookies(
        res,
        newTokens.accessToken,
        newTokens.refreshToken || refreshToken,
      );

      // Attach user to request
      req.user = {
        userId: validationResult.user._id,
        email: validationResult.user.email,
        role: validationResult.user.role,
        isActive: validationResult.user.isActive,
      };

      // Update the Authorization header for downstream services
      req.headers.authorization = `Bearer ${newTokens.accessToken}`;

      // Add header to indicate token was refreshed (useful for client-side handling)
      res.setHeader('X-Token-Refreshed', 'true');

      this.logger.debug(
        `Tokens refreshed successfully for user: ${req.user.userId}`,
      );
      return next();
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);

      // Clear invalid tokens
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      throw new UnauthorizedException('Session expired. Please login again.');
    }
  }
}
