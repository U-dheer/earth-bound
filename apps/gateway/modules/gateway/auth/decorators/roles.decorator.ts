import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route.
 * Used in conjunction with RolesGuard.
 *
 * @example
 * @Roles('ADMIN', 'ORGANIZER')
 * @UseGuards(RolesGuard)
 * @Get('admin-only')
 * adminEndpoint() {
 *   return 'Admin content';
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
