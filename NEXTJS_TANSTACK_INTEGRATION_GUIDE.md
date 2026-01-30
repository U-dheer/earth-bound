# Next.js + TanStack Query + Zod + Zustand + Axios Integration Guide

A comprehensive guide for integrating TanStack Query, Zod validation, Zustand state management, and Axios with Next.js 14+ (App Router).

## Table of Contents

1. [Installation](#installation)
2. [Project Structure](#project-structure)
3. [Configuration](#configuration)
4. [API Client Setup (Axios)](#api-client-setup-axios)
5. [TanStack Query Setup](#tanstack-query-setup)
6. [Zod Schema Validation](#zod-schema-validation)
7. [Zustand Store Setup](#zustand-store-setup)
8. [Integration Examples](#integration-examples)
9. [Best Practices](#best-practices)
10. [Error Handling](#error-handling)
11. [TypeScript Tips](#typescript-tips)

---

## Installation

```bash
# Core dependencies
 

# Development dependencies (optional but recommended)
npm install -D @tanstack/react-query-devtools

# Or using pnpm
pnpm add axios @tanstack/react-query zod zustand
pnpm add -D @tanstack/react-query-devtools
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── lib/
│   ├── api/
│   │   ├── axios-client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── queries/
│   │   ├── use-user-queries.ts
│   │   ├── use-donation-queries.ts
│   │   └── query-keys.ts
│   ├── schemas/
│   │   ├── user.schema.ts
│   │   ├── donation.schema.ts
│   │   └── index.ts
│   └── store/
│       ├── auth-store.ts
│       ├── ui-store.ts
│       └── index.ts
├── hooks/
│   └── use-auth.ts
└── types/
    └── index.ts
```

---

## Configuration

### 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3002
```

---

## API Client Setup (Axios)

### `lib/api/axios-client.ts`

```typescript
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Refresh token logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
```

### `lib/api/endpoints.ts`

```typescript
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  // Donations
  DONATIONS: {
    LIST: '/donations',
    CREATE: '/donations',
    DETAIL: (id: string) => `/donations/${id}`,
  },
  // CSR Projects
  CSR_PROJECTS: {
    LIST: '/csr-projects',
    DETAIL: (id: string) => `/csr-projects/${id}`,
  },
} as const;
```

---

## TanStack Query Setup

### `app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### `app/layout.tsx`

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### `lib/queries/query-keys.ts`

```typescript
// Centralized query keys for better cache management
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  donations: {
    all: ['donations'] as const,
    lists: () => [...queryKeys.donations.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.donations.lists(), filters] as const,
    details: () => [...queryKeys.donations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.donations.details(), id] as const,
  },
  csrProjects: {
    all: ['csr-projects'] as const,
    lists: () => [...queryKeys.csrProjects.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.csrProjects.all, 'detail', id] as const,
  },
} as const;
```

---

## Zod Schema Validation

### `lib/schemas/user.schema.ts`

```typescript
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['USER', 'BUSINESS', 'ORGANIZER', 'ADMIN']),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['USER', 'BUSINESS', 'ORGANIZER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Update user schema
export const updateUserSchema = userSchema.partial().omit({ id: true, createdAt: true });

// Type inference from schemas
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```
<!-- NOt started -->
### `lib/schemas/donation.schema.ts`

```typescript
import { z } from 'zod';

export const donationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  message: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  createdAt: z.string().datetime(),
});

export const createDonationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  amount: z.number().min(1, 'Minimum donation is $1'),
  message: z.string().max(500, 'Message too long').optional(),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});

export type Donation = z.infer<typeof donationSchema>;
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
```

---

## Zustand Store Setup

### `lib/store/auth-store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../schemas/user.schema';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
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
    }
  )
);
```

### `lib/store/ui-store.ts`

```typescript
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  setTheme: (theme) =>
    set({ theme }),
}));
```

---

## Integration Examples

### `lib/queries/use-user-queries.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axiosClient from '../api/axios-client';
import { API_ENDPOINTS } from '../api/endpoints';
import { queryKeys } from './query-keys';
import { User, UpdateUserInput, updateUserSchema } from '../schemas/user.schema';
import { useAuthStore } from '../store/auth-store';

// Fetch current user
export function useCurrentUser() {
  return useQuery<User, AxiosError>({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.AUTH.ME);
      return data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
}

// Fetch user by ID
export function useUser(userId: string) {
  return useQuery<User, AxiosError>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.USERS.DETAIL(userId));
      return data;
    },
    enabled: !!userId,
  });
}

// Update user mutation
export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<User, AxiosError, UpdateUserInput>({
    mutationFn: async (userData) => {
      // Validate with Zod
      const validatedData = updateUserSchema.parse(userData);
      
      const { data } = await axiosClient.patch(
        API_ENDPOINTS.USERS.UPDATE(userId),
        validatedData
      );
      return data;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(queryKeys.users.detail(userId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      
      // Update Zustand store if it's the current user
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id === userId) {
        updateUser(data);
      }
    },
  });
}

// Fetch users list
export function useUsers(filters?: string) {
  return useQuery<User[], AxiosError>({
    queryKey: queryKeys.users.list(filters || ''),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.USERS.LIST, {
        params: { filters },
      });
      return data;
    },
  });
}
```

### `lib/queries/use-donation-queries.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axiosClient from '../api/axios-client';
import { API_ENDPOINTS } from '../api/endpoints';
import { queryKeys } from './query-keys';
import { 
  Donation, 
  CreateDonationInput, 
  createDonationSchema 
} from '../schemas/donation.schema';

// Fetch donations
export function useDonations(filters?: string) {
  return useQuery<Donation[], AxiosError>({
    queryKey: queryKeys.donations.list(filters || ''),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.DONATIONS.LIST, {
        params: { filters },
      });
      return data;
    },
  });
}

// Create donation mutation
export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation<Donation, AxiosError, CreateDonationInput>({
    mutationFn: async (donationData) => {
      // Validate with Zod before sending
      const validatedData = createDonationSchema.parse(donationData);
      
      const { data } = await axiosClient.post(
        API_ENDPOINTS.DONATIONS.CREATE,
        validatedData
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch donations
      queryClient.invalidateQueries({ queryKey: queryKeys.donations.all });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error('Donation failed:', error.response?.data?.message);
    },
  });
}

// Fetch single donation
export function useDonation(donationId: string) {
  return useQuery<Donation, AxiosError>({
    queryKey: queryKeys.donations.detail(donationId),
    queryFn: async () => {
      const { data } = await axiosClient.get(
        API_ENDPOINTS.DONATIONS.DETAIL(donationId)
      );
      return data;
    },
    enabled: !!donationId,
  });
}
```

### `lib/queries/use-auth-queries.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axiosClient from '../api/axios-client';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginInput, RegisterInput, loginSchema, registerSchema } from '../schemas/user.schema';
import { useAuthStore } from '../store/auth-store';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Login mutation
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError, LoginInput>({
    mutationFn: async (credentials) => {
      // Validate with Zod
      const validatedData = loginSchema.parse(credentials);
      
      const { data } = await axiosClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        validatedData
      );
      return data;
    },
    onSuccess: (data) => {
      // Store in Zustand
      setAuth(data.user, data.accessToken, data.refreshToken);
      
      // Store tokens in localStorage (handled by axios interceptor)
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    },
  });
}

// Register mutation
export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError, RegisterInput>({
    mutationFn: async (userData) => {
      // Validate with Zod
      const validatedData = registerSchema.parse(userData);
      
      const { data } = await axiosClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        validatedData
      );
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation<void, AxiosError>({
    mutationFn: async () => {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      clearAuth();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear(); // Clear all cache
    },
  });
}
```

---

## Best Practices

### 1. **Query Keys Organization**
- Use hierarchical keys for better cache management
- Centralize all query keys in one file
- Use `as const` for type safety

### 2. **Error Handling**
```typescript
// In your component
const { data, error, isLoading } = useUsers();

if (error) {
  const axiosError = error as AxiosError<{ message: string }>;
  return <div>Error: {axiosError.response?.data?.message}</div>;
}
```

### 3. **Optimistic Updates**
```typescript
export function useUpdateDonation(donationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { data: response } = await axiosClient.patch(
        API_ENDPOINTS.DONATIONS.DETAIL(donationId),
        data
      );
      return response;
    },
    // Optimistically update cache
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.donations.detail(donationId) 
      });

      // Snapshot previous value
      const previousDonation = queryClient.getQueryData(
        queryKeys.donations.detail(donationId)
      );

      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.donations.detail(donationId),
        (old: Donation) => ({ ...old, ...newData })
      );

      return { previousDonation };
    },
    // Rollback on error
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        queryKeys.donations.detail(donationId),
        context?.previousDonation
      );
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.donations.detail(donationId) 
      });
    },
  });
}
```

### 4. **Prefetching**
```typescript
// In your component or page
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';

export default function ProjectsList() {
  const queryClient = useQueryClient();

  const handleMouseEnter = (projectId: string) => {
    // Prefetch project details on hover
    queryClient.prefetchQuery({
      queryKey: queryKeys.csrProjects.detail(projectId),
      queryFn: () => fetchProjectDetails(projectId),
    });
  };

  return <div>...</div>;
}
```

### 5. **Custom Hooks with Zustand**
```typescript
// hooks/use-auth.ts
import { useAuthStore } from '@/lib/store/auth-store';
import { useCurrentUser } from '@/lib/queries/use-user-queries';

export function useAuth() {
  const { user: storeUser, isAuthenticated, clearAuth } = useAuthStore();
  const { data: serverUser, isLoading } = useCurrentUser();

  return {
    user: serverUser || storeUser,
    isAuthenticated,
    isLoading,
    logout: clearAuth,
  };
}
```

### 6. **Form Validation with Zod**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/schemas/user.schema';
import { useLogin } from '@/lib/queries/use-auth-queries';

export default function LoginForm() {
  const login = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    login.mutate(data, {
      onSuccess: () => {
        // Redirect or show success message
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Global Error Handler Component

```typescript
// components/error-boundary.tsx
'use client';

import { AxiosError } from 'axios';
import { useEffect } from 'react';

export function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  const axiosError = error as AxiosError<{ message: string }>;
  const message = axiosError.response?.data?.message || error.message;

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Query Error Handling

```typescript
// lib/queries/error-handler.ts
import { AxiosError } from 'axios';
import { toast } from 'sonner'; // or your toast library

export function handleQueryError(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    const status = error.response?.status;

    switch (status) {
      case 400:
        toast.error('Bad Request: ' + message);
        break;
      case 401:
        toast.error('Unauthorized: Please login again');
        break;
      case 403:
        toast.error('Forbidden: You do not have permission');
        break;
      case 404:
        toast.error('Not Found: ' + message);
        break;
      case 500:
        toast.error('Server Error: Please try again later');
        break;
      default:
        toast.error('An error occurred: ' + message);
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}

// Usage in queries
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: fetchUsers,
    onError: handleQueryError,
  });
}
```

---

## TypeScript Tips

### 1. **Type-Safe API Responses**
```typescript
// lib/api/types.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Usage
const { data } = await axiosClient.get<ApiResponse<User>>(
  API_ENDPOINTS.AUTH.ME
);
```

### 2. **Infer Types from Zod Schemas**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

// Automatically get the TypeScript type
type User = z.infer<typeof userSchema>;
```

### 3. **Type-Safe Query Keys**
```typescript
export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
} as const;

// TypeScript will infer: readonly ["users", string]
type UserDetailKey = ReturnType<typeof queryKeys.users.detail>;
```

---

## Complete Example: Donation Page

```typescript
// app/donations/page.tsx
'use client';

import { useDonations, useCreateDonation } from '@/lib/queries/use-donation-queries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDonationSchema, CreateDonationInput } from '@/lib/schemas/donation.schema';
import { useAuth } from '@/hooks/use-auth';

export default function DonationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: donations, isLoading, error } = useDonations();
  const createDonation = useCreateDonation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDonationInput>({
    resolver: zodResolver(createDonationSchema),
  });

  const onSubmit = (data: CreateDonationInput) => {
    createDonation.mutate(data, {
      onSuccess: () => {
        reset();
        // Show success message
      },
    });
  };

  if (!isAuthenticated) {
    return <div>Please login to view donations</div>;
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading donations</div>;

  return (
    <div>
      <h1>Donations</h1>

      {/* Donation Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('projectId')}
          placeholder="Project ID"
        />
        {errors.projectId && <span>{errors.projectId.message}</span>}

        <input
          type="number"
          {...register('amount', { valueAsNumber: true })}
          placeholder="Amount"
        />
        {errors.amount && <span>{errors.amount.message}</span>}

        <input
          {...register('paymentMethodId')}
          placeholder="Payment Method"
        />
        {errors.paymentMethodId && <span>{errors.paymentMethodId.message}</span>}

        <textarea {...register('message')} placeholder="Message (optional)" />

        <button type="submit" disabled={createDonation.isPending}>
          {createDonation.isPending ? 'Processing...' : 'Donate'}
        </button>
      </form>

      {/* Donations List */}
      <div>
        {donations?.map((donation) => (
          <div key={donation.id}>
            <p>Amount: ${donation.amount}</p>
            <p>Status: {donation.status}</p>
            <p>Project: {donation.projectId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Axios Documentation](https://axios-http.com/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## Summary

This integration provides:
- ✅ Type-safe API calls with Axios and TypeScript
- ✅ Robust data fetching and caching with TanStack Query
- ✅ Runtime validation with Zod schemas
- ✅ Global state management with Zustand
- ✅ Automatic token refresh and error handling
- ✅ Optimistic updates and cache invalidation
- ✅ Best practices for Next.js App Router

Follow these patterns to build scalable, maintainable Next.js applications with confidence!
