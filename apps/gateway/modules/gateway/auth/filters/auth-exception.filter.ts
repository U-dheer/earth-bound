import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Exception filter specifically for auth-related exceptions.
 * Provides consistent error responses for authentication and authorization errors.
 */
@Catch(UnauthorizedException, ForbiddenException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Authentication error';

    this.logger.warn(
      `Auth error [${status}] ${request.method} ${request.url}: ${errorMessage}`,
    );

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      error:
        status === 401
          ? 'Unauthorized'
          : status === 403
            ? 'Forbidden'
            : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
