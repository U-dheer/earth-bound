# Next.js Integration Guide - Earth Bound API

## Complete Integration Guide: Next.js + NestJS with Secure Authentication

This guide provides best practices for integrating your NestJS backend with a Next.js frontend using Axios, TanStack Query, Zod, Zustand, and server-side cookie authentication.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Configuration](#backend-configuration)
3. [Frontend Setup](#frontend-setup)
4. [Authentication Flow](#authentication-flow)
5. [API Client Configuration](#api-client-configuration)
6. [TanStack Query Setup](#tanstack-query-setup)
7. [Zustand Store Setup](#zustand-store-setup)
8. [Server-Side Cookie Handling](#server-side-cookie-handling)
9. [Best Practices](#best-practices)

---

## Architecture Overview

### Authentication Flow
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Next.js   │────────▶│   Gateway    │────────▶│ Auth Service│
│   (Client)  │◀────────│   Service    │◀────────│             │
└─────────────┘         └──────────────┘         └─────────────┘
     │                         │
     │                         │
  Cookies                  Forwards
(HttpOnly)               Auth Headers
```

### Token Strategy
- **Access Token**: Short-lived (15 minutes), stored in HttpOnly cookie
- **Refresh Token**: Long-lived (7 days), stored in HttpOnly cookie
- **CSRF Protection**: Using SameSite and Secure flags

---

## Backend Configuration

### 1. Update Auth Service to Support Cookies

**File: `apps/auth/src/auth/authController.ts`**

```typescript
import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.Service';
import { LoginDataDto } from './dtos/loginDataDto';
import { SignUpDataDto } from './dtos/signUpDataDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() signUpData: SignUpDataDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signUp(signUpData);
    
    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    
    // Return user data without tokens
    return {
      user: result.user,
      message: 'User registered successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginData: LoginDataDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginData);
    
    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    
    return {
      user: result.user,
      message: 'Login successful',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    const result = await this.authService.refreshTokens(refreshToken);
    
    // Set new cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    
    return {
      message: 'Tokens refreshed successfully',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return { message: 'Logged out successfully' };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    // Access Token - 15 minutes
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Refresh Token - 7 days
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
```

### 2. Update Gateway to Forward Cookies

**File: `apps/gateway/modules/gateway/infrastructure/gateway.service.ts`**

```typescript
import { Injectable, HttpException } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ServiceConfig } from '../configs/service-config';

@Injectable()
export class GatewayService {
  async forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    data?: any,
    headers?: any,
  ) {
    const serviceUrl = ServiceConfig[serviceName];
    
    if (!serviceUrl) {
      throw new HttpException('Service not found', 404);
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${serviceUrl}${path}`,
      data,
      headers: {
        ...headers,
        // Forward cookies from the original request
        'Cookie': headers['cookie'] || '',
      },
      withCredentials: true, // Important for cookies
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Service error',
        error.response?.status || 500,
      );
    }
  }
}
```

### 3. Enable CORS with Credentials

**File: `apps/gateway/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parser
  app.use(cookieParser());

  // Enable CORS with credentials
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js development
      'https://yourdomain.com', // Production
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3001); // Gateway port
}
bootstrap();
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
# Core dependencies
npm install axios @tanstack/react-query zustand zod

# Dev dependencies
npm install -D @tanstack/react-query-devtools
```

### 2. Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── axios.ts              # Axios instance configuration
│   │   ├── query-client.ts       # TanStack Query client
│   │   └── api/
│   │       ├── auth.api.ts       # Auth API calls
│   │       ├── user.api.ts       # User API calls
│   │       └── ...
│   ├── stores/
│   │   └── auth.store.ts         # Zustand auth store
│   ├── schemas/
│   │   ├── auth.schema.ts        # Zod schemas for auth
│   │   └── user.schema.ts        # Zod schemas for user
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth hooks
│   │   └── useUser.ts            # User data hooks
│   ├── components/
│   │   ├── providers/
│   │   │   └── query-provider.tsx
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       └── signup-form.tsx
│   └── app/
│       ├── layout.tsx
│       ├── api/
│       │   └── auth/
│       │       ├── refresh/route.ts
│       │       └── logout/route.ts
│       └── (auth)/
│           ├── login/page.tsx
│           └── signup/page.tsx
```

---

## API Client Configuration

### Axios Instance with Interceptors

**File: `src/lib/axios.ts`**

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically sent due to withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        // Process queued requests
        processQueue();
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear queue and redirect to login
        processQueue(refreshError);
        isRefreshing = false;

        // Clear auth state
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## TanStack Query Setup

### 1. Query Client Configuration

**File: `src/lib/query-client.ts`**

```typescript
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  },
  mutations: {
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
```

### 2. Query Provider

**File: `src/components/providers/query-provider.tsx`**

```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3. Root Layout

**File: `src/app/layout.tsx`**

```typescript
import { QueryProvider } from '@/components/providers/query-provider';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

---

## Zustand Store Setup

### Auth Store with Persistence

**File: `src/stores/auth.store.ts`**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // Add other user fields
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## Authentication Flow

### Zod Schemas

**File: `src/schemas/auth.schema.ts`**

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['USER', 'BUSINESS', 'ORGANIZER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

### Auth API

**File: `src/lib/api/auth.api.ts`**

```typescript
import apiClient from '@/lib/axios';
import { LoginInput, SignupInput, ForgotPasswordInput, ResetPasswordInput } from '@/schemas/auth.schema';
import { User } from '@/stores/auth.store';

export interface AuthResponse {
  user: User;
  message: string;
}

export const authApi = {
  // Login
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Signup
  signup: async (data: SignupInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Refresh tokens (called automatically by interceptor)
  refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh');
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordInput): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordInput): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },
};
```

### Auth Hooks

**File: `src/hooks/useAuth.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { LoginInput, SignupInput } from '@/schemas/auth.schema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // or your preferred toast library

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearAuthState } = useAuthStore();

  // Get current user query
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !user, // Only fetch if user is not in store
    retry: false,
    staleTime: Infinity,
  });

  // Sync user from query to store
  if (currentUser && !user) {
    setUser(currentUser);
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Signup failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuthState();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: (error: any) => {
      // Even if the API call fails, clear local state
      clearAuthState();
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
```

### Login Component Example

**File: `src/components/auth/login-form.tsx`**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoggingIn}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Server-Side Cookie Handling

### Protected API Routes (Next.js App Router)

**File: `src/app/api/auth/me/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Forward request to your NestJS backend
    const response = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: {
        Cookie: `accessToken=${accessToken.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
```

### Middleware for Protected Routes

**File: `src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  // Define public routes
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

---

## Best Practices

### 1. **Security Best Practices**

#### Cookie Configuration
```typescript
// Production-ready cookie settings
const cookieOptions = {
  httpOnly: true,              // Prevent XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const,    // CSRF protection
  path: '/',                   // Available on all paths
  maxAge: 15 * 60 * 1000,     // 15 minutes for access token
};
```

#### Environment Variables
```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001  # For server-side calls

# .env (NestJS)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-this
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 2. **Token Refresh Strategy**

```typescript
// Automatic refresh strategy
// Option 1: Refresh on 401 (Implemented above)
// Option 2: Proactive refresh before expiry

import { useEffect } from 'react';
import { authApi } from '@/lib/api/auth.api';

export function useTokenRefresh() {
  useEffect(() => {
    // Refresh token every 14 minutes (before 15-minute expiry)
    const interval = setInterval(async () => {
      try {
        await authApi.refresh();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, []);
}
```

### 3. **Error Handling**

**File: `src/lib/api/error-handler.ts`**

```typescript
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    
    // Handle validation errors
    if (apiError?.errors) {
      Object.values(apiError.errors).forEach((messages) => {
        messages.forEach((message) => toast.error(message));
      });
      return;
    }

    // Handle general errors
    toast.error(apiError?.message || 'An error occurred');
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### 4. **Type-Safe API Calls**

```typescript
// Create a generic API function wrapper
import { z } from 'zod';
import apiClient from '@/lib/axios';

export async function apiCall<T>(
  schema: z.ZodType<T>,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: any
): Promise<T> {
  const response = await apiClient[method](url, data);
  return schema.parse(response.data);
}

// Usage example
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

const user = await apiCall(userSchema, 'get', '/users/me');
```

### 5. **Optimistic Updates**

```typescript
// Example: Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => apiClient.patch('/users/me', data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currentUser'] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['currentUser']);

      // Optimistically update
      queryClient.setQueryData(['currentUser'], (old: User) => ({
        ...old,
        ...newData,
      }));

      return { previousUser };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['currentUser'], context?.previousUser);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
```

### 6. **Request Deduplication**

TanStack Query automatically deduplicates requests, but you can enhance this:

```typescript
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      networkMode: 'offlineFirst', // Use cache if available
    },
  },
});
```

### 7. **Loading States**

```typescript
// Unified loading state component
export function LoadingBoundary({
  isLoading,
  error,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <>{children}</>;
}

// Usage
function UserProfile() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get('/users/me'),
  });

  return (
    <LoadingBoundary isLoading={isLoading} error={error}>
      <div>{user?.name}</div>
    </LoadingBoundary>
  );
}
```

### 8. **Prefetching Data**

```typescript
// Prefetch on hover
import { useQueryClient } from '@tanstack/react-query';

export function UserLink({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const prefetchUser = () => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => apiClient.get(`/users/${userId}`),
    });
  };

  return (
    <a
      href={`/users/${userId}`}
      onMouseEnter={prefetchUser}
      onFocus={prefetchUser}
    >
      View User
    </a>
  );
}
```

### 9. **Infinite Queries (Pagination)**

```typescript
export function useInfiniteOffers() {
  return useInfiniteQuery({
    queryKey: ['offers'],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get(`/offers?page=${pageParam}&limit=10`),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });
}

// Usage in component
function OfferList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteOffers();

  return (
    <div>
      {data?.pages.map((page) =>
        page.offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
      )}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  );
}
```

### 10. **Development Tools**

```typescript
// src/app/layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## Testing

### Testing Auth Hooks

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.login({
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

---

## Deployment Checklist

- [ ] Set secure environment variables in production
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `secure: true` for cookies in production
- [ ] Configure CORS with production domain
- [ ] Set up proper logging and monitoring
- [ ] Enable rate limiting on auth endpoints
- [ ] Implement CSRF tokens if needed
- [ ] Set up proper error tracking (Sentry, etc.)
- [ ] Enable security headers (Helmet.js)
- [ ] Set up database connection pooling
- [ ] Configure Redis for session management (optional)
- [ ] Set up automated backups

---

## Complete Example: Fetching Protected Data

```typescript
// src/lib/api/offers.api.ts
import apiClient from '@/lib/axios';
import { z } from 'zod';

const offerSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  pointsCost: z.number(),
  business: z.object({
    id: z.string(),
    name: z.string(),
  }),
  createdAt: z.string(),
});

export type Offer = z.infer<typeof offerSchema>;

export const offersApi = {
  getOffers: async (): Promise<Offer[]> => {
    const response = await apiClient.get('/offers');
    return z.array(offerSchema).parse(response.data);
  },

  getOfferById: async (id: string): Promise<Offer> => {
    const response = await apiClient.get(`/offers/${id}`);
    return offerSchema.parse(response.data);
  },

  redeemOffer: async (id: string): Promise<{ message: string; code: string }> => {
    const response = await apiClient.post(`/offers/${id}/redeem`);
    return response.data;
  },
};

// src/hooks/useOffers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '@/lib/api/offers.api';
import { toast } from 'sonner';

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: offersApi.getOffers,
  });
}

export function useRedeemOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: offersApi.redeemOffer,
    onSuccess: (data) => {
      toast.success(`Offer redeemed! Code: ${data.code}`);
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to redeem offer');
    },
  });
}
```

---

## Troubleshooting

### Issue: Cookies not being set

**Solution:**
- Ensure `withCredentials: true` in axios config
- Check CORS configuration includes `credentials: true`
- Verify domain matches between frontend and backend in development
- Check cookie `sameSite` setting (use `'lax'` for cross-origin)

### Issue: 401 errors on every request

**Solution:**
- Check if cookies are being sent in request headers
- Verify token expiration times
- Check backend JWT validation
- Ensure cookie names match between frontend and backend

### Issue: Infinite refresh loop

**Solution:**
- Add `_retry` flag to prevent multiple refresh attempts
- Implement proper refresh queue
- Add timeout to refresh requests
- Check refresh token expiration

---

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zod Documentation](https://zod.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Axios Documentation](https://axios-http.com/)

---

**Note:** This guide assumes you're using Next.js 14+ with App Router. For Pages Router, adjust the API routes and middleware accordingly.

For questions or issues, refer to the project's documentation or contact the development team.