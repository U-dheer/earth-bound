import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth';
import { ServicesConfig } from '../configs/service-config';

/**
 * Enum for user roles - extend as needed
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ORGANIZER = 'ORGANIZER',
  BUSINESS = 'BUSINESS',
}

/**
 * Sub-route access configuration
 */
interface SubRoute {
  /** Path pattern (relative to base path). Use '*' for catch-all */
  path: string;
  /** Whether this route is public (no auth required) */
  isPublic?: boolean;
  /** Allowed roles (undefined = all authenticated users) */
  allowedRoles?: UserRole[];
  /** HTTP methods this rule applies to (undefined = all methods) */
  methods?: string[];
  /** Query parameter bypasses - make route public if specific query params exist */
  publicQueryParams?: string[];
}

/**
 * Service route configuration - groups all routes for a service
 */
interface ServiceRouteConfig {
  /** Base path prefix (e.g., '/auth', '/api') */
  basePath: string;
  /** Service URL key from ServicesConfig */
  serviceKey: keyof typeof ServicesConfig;
  /** Default access for all routes under this base path */
  defaultAccess: {
    isPublic?: boolean;
    allowedRoles?: UserRole[];
  };
  /** Sub-routes with specific access rules (matched in order, first match wins) */
  routes?: SubRoute[];
}

/**
 * ============================================
 * ROUTE CONFIGURATION - Edit this section
 * ============================================
 * Routes are matched in order:
 * 1. First, find the matching service by basePath
 * 2. Then, find the most specific sub-route match
 * 3. If no sub-route matches, use defaultAccess
 */
const serviceRoutes: ServiceRouteConfig[] = [
  // ==========================================
  // AUTH SERVICE ROUTES
  // ==========================================
  {
    basePath: '/auth',
    serviceKey: 'auth',
    defaultAccess: {
      allowedRoles: undefined, // Default: all authenticated users
    },
    routes: [
      // Public routes
      { path: '/signup', isPublic: true },
      { path: '/login', isPublic: true },
      { path: '/refresh', isPublic: true },
      { path: '/forgot-password', isPublic: true },
      { path: '/reset-password', isPublic: true },
      { path: '/verify-email', isPublic: true },
      { path: '/validate', isPublic: true },

      // Protected routes
      { path: '/profile', allowedRoles: undefined }, // All authenticated
      { path: '/change-password', allowedRoles: undefined },
      { path: '/logout', allowedRoles: undefined },

      //User Only

      // Admin only
      { path: '/admin', allowedRoles: [UserRole.ADMIN] },
      { path: '/users', allowedRoles: [UserRole.ADMIN] },

      //Business only
    ],
  },

  // ==========================================
  // API SERVICE ROUTES
  // ==========================================
  {
    basePath: '/api',
    serviceKey: 'api',
    defaultAccess: {
      allowedRoles: undefined, // Default: all authenticated users
    },
    routes: [
      // ----- Admin routes -----
      { path: '/admin', allowedRoles: [UserRole.ADMIN] },

      // ----- Organizer routes -----
      {
        path: '/organizer',
        allowedRoles: [UserRole.ADMIN, UserRole.ORGANIZER],
      },
      {
        path: '/offers',
        allowedRoles: [UserRole.BUSINESS],
        methods: ['POST', 'PUT', 'DELETE'],
      },
      {
        path: '/offers/available',
        allowedRoles: undefined,
      },
      {
        path: '/offers',
        allowedRoles: undefined,
      },

      // ----- Business routes -----
      // GET is public, other methods require roles
      {
        path: '/business',
        methods: ['GET'],
        isPublic: true,
      },
      {
        path: '/business',
        allowedRoles: [UserRole.ADMIN, UserRole.BUSINESS],
      },

      // ----- Public API routes (GET only) -----
      { path: '/products', methods: ['GET'], isPublic: true },
      { path: '/categories', methods: ['GET'], isPublic: true },

      // ----- CSR Project routes -----
      {
        path: '/csr-project',
        allowedRoles: [UserRole.ADMIN, UserRole.ORGANIZER],
        methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
      },
      { path: '/csr-project', methods: ['GET'], isPublic: true },

      // ----- Donation routes -----
      { path: '/donation', allowedRoles: undefined }, // All authenticated

      // ----- User-specific routes -----
      { path: '/user', allowedRoles: undefined }, // All authenticated
    ],
  },
];

// ============================================
// INTERNAL LOGIC - Do not modify below
// ============================================

/** Flattened route for faster matching */
interface FlattenedRoute {
  fullPath: string;
  serviceKey: keyof typeof ServicesConfig;
  isPublic: boolean;
  allowedRoles?: UserRole[];
  methods?: string[];
  publicQueryParams?: string[];
}

/** Cache of flattened routes */
let flattenedRoutes: FlattenedRoute[] | null = null;

/**
 * Flattens service routes into a single array for matching
 * Routes are sorted by specificity (longer paths first)
 */
const flattenRoutes = (): FlattenedRoute[] => {
  if (flattenedRoutes) return flattenedRoutes;

  const routes: FlattenedRoute[] = [];

  for (const service of serviceRoutes) {
    // Add sub-routes first (more specific)
    if (service.routes) {
      for (const route of service.routes) {
        const fullPath =
          route.path === '*'
            ? service.basePath
            : `${service.basePath}${route.path}`;

        routes.push({
          fullPath,
          serviceKey: service.serviceKey,
          isPublic: route.isPublic ?? false,
          allowedRoles: route.allowedRoles,
          methods: route.methods,
          publicQueryParams: route.publicQueryParams,
        });
      }
    }

    // Add catch-all for the base path with default access
    routes.push({
      fullPath: service.basePath,
      serviceKey: service.serviceKey,
      isPublic: service.defaultAccess.isPublic ?? false,
      allowedRoles: service.defaultAccess.allowedRoles,
    });
  }

  // Sort by path length (descending) for most specific match first
  routes.sort((a, b) => b.fullPath.length - a.fullPath.length);

  flattenedRoutes = routes;
  return routes;
};

/**
 * Extracts query parameters from a path
 */
const extractQueryParams = (path: string): URLSearchParams => {
  const queryString = path.split('?')[1] || '';
  return new URLSearchParams(queryString);
};

/**
 * Finds the matching route for a given path and method
 */
const findMatchingRoute = (
  path: string,
  method?: string,
): FlattenedRoute | undefined => {
  const routes = flattenRoutes();
  const cleanPath = path.split('?')[0]; // Remove query string

  return routes.find((route) => {
    // Check path match (prefix matching)
    const pathMatches =
      cleanPath === route.fullPath ||
      cleanPath.startsWith(route.fullPath + '/');

    if (!pathMatches) return false;

    // Check method match
    const methodMatches =
      !route.methods || !method || route.methods.includes(method.toUpperCase());

    return methodMatches;
  });
};

/**
 * Checks if access is allowed based on route config and user role
 */
const isAccessAllowed = (
  route: FlattenedRoute,
  role: string | undefined,
  path: string,
): boolean => {
  // Check for public query params
  if (route.publicQueryParams && route.publicQueryParams.length > 0) {
    const queryParams = extractQueryParams(path);
    if (route.publicQueryParams.some((param) => queryParams.has(param))) {
      return true;
    }
  }

  // Public route
  if (route.isPublic) {
    return true;
  }

  // All authenticated users allowed
  if (route.allowedRoles === undefined) {
    return !!role; // Must have a role (be authenticated)
  }

  // Specific roles required
  if (!role) return false;
  return route.allowedRoles.includes(role as UserRole);
};

/**
 * Resolves the service URL for a given path with role-based access control
 *
 * @param path - The request path
 * @param role - The user's role (undefined for unauthenticated requests)
 * @param method - Optional HTTP method for method-specific routing
 * @returns The service URL to proxy the request to
 * @throws ForbiddenException if the user's role doesn't have access
 * @throws NotFoundException if no route matches the path
 * @throws Error if the service URL is not configured
 */
export const resolveServiceUrl = (
  path: string,
  role: AuthenticatedUser['role'] | undefined,
  method?: string,
): string => {
  const route = findMatchingRoute(path, method);

  if (!route) {
    throw new NotFoundException(`No service found for path: ${path}`);
  }

  // Check access
  if (!isAccessAllowed(route, role, path)) {
    throw new ForbiddenException(
      `Access denied. Insufficient permissions for path: ${path} : role : ${role}`,
    );
  }

  // Get the service URL
  const serviceUrl = ServicesConfig[route.serviceKey];

  if (!serviceUrl) {
    throw new Error(`${route.serviceKey} service URL is not configured`);
  }

  return serviceUrl;
};

/**
 * Utility to add a new service route configuration at runtime
 */
export const registerServiceRoute = (config: ServiceRouteConfig): void => {
  serviceRoutes.unshift(config);
  flattenedRoutes = null; // Invalidate cache
};

/**
 * Utility to add a sub-route to an existing service
 */
export const addSubRoute = (basePath: string, subRoute: SubRoute): void => {
  const service = serviceRoutes.find((s) => s.basePath === basePath);
  if (service) {
    if (!service.routes) service.routes = [];
    service.routes.unshift(subRoute); // Add at beginning for priority
    flattenedRoutes = null; // Invalidate cache
  }
};

/**
 * Utility to get all registered routes (for debugging/admin purposes)
 */
export const getRegisteredRoutes = (): readonly FlattenedRoute[] => {
  return flattenRoutes();
};

/**
 * Clears the route cache (useful for testing)
 */
export const clearRouteCache = (): void => {
  flattenedRoutes = null;
};

/**
 * Re-export types for external use
 */
export type { ServiceRouteConfig, SubRoute, FlattenedRoute };
