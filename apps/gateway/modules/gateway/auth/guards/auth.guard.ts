import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/auth.interfaces';

/**
 * Guard that ensures a user is authenticated.
 * This can be used on routes that need explicit authentication check
 * beyond the middleware (e.g., for extra protection).
 *
 * @example
 * @UseGuards(AuthGuard)
 * @Get('protected')
 * protectedEndpoint() {
 *   return 'Protected content';
 * }
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
