import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interfaces';

/**
 * Guard that checks if the authenticated user has the required role(s).
 * Must be used with the @Roles() decorator.
 *
 * @example
 * @Roles('ADMIN')
 * @UseGuards(RolesGuard)
 * @Get('admin-only')
 * adminEndpoint() {
 *   return 'Admin content';
 * }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    // No user attached means not authenticated
    if (!user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    // Optional: Check if user account is active
    if (!user.isActive) {
      throw new ForbiddenException(
        'Access denied. Your account is not activated.',
      );
    }

    return true;
  }
}
