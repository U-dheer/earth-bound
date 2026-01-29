# Next.js + Axios Integration Guide - Earth Bound API

Complete guide for integrating Earth Bound backend API with Next.js using Axios, following industry best practices.

---

## 📚 Table of Contents
- [Project Setup](#project-setup)
- [Folder Structure](#folder-structure)
- [Axios Configuration](#axios-configuration)
- [Environment Variables](#environment-variables)
- [Service Layer Pattern](#service-layer-pattern)
- [React Hooks for API Calls](#react-hooks-for-api-calls)
- [Server-Side API Calls](#server-side-api-calls)
- [Client-Side API Calls](#client-side-api-calls)
- [Authentication Implementation](#authentication-implementation)
- [Protected Routes](#protected-routes)
- [Error Handling](#error-handling)
- [Loading States](#loading-states)
- [TypeScript Types](#typescript-types)
- [Real-World Examples](#real-world-examples)
- [Testing](#testing)
- [Best Practices Checklist](#best-practices-checklist)

---

## 🚀 Project Setup

### 1. Create Next.js Project
```bash
# Create new Next.js app with TypeScript
npx create-next-app@latest earth-bound-frontend --typescript --tailwind --app

cd earth-bound-frontend
```

### 2. Install Dependencies
```bash
# Install Axios and other required packages
npm install axios
npm install @tanstack/react-query  # For data fetching and caching
npm install zod  # For schema validation
npm install zustand  # For state management (alternative to Redux)

# Dev dependencies
npm install -D @types/node
```

### 3. Project Configuration
```json
// tsconfig.json - Add path aliases
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/store/*": ["./src/store/*"]
    }
  }
}
```

---

## 📁 Folder Structure

```
earth-bound-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected routes group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── offers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── donations/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/                   # Reusable components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── offers/
│   │   │   ├── OfferCard.tsx
│   │   │   └── OfferList.tsx
│   │   ├── ui/                       # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Loading.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                          # Core utilities
│   │   ├── axios.ts                  # Axios instance configuration
│   │   ├── queryClient.ts            # React Query client
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── services/                     # API service layer
│   │   ├── api.service.ts            # Base API service
│   │   ├── auth.service.ts           # Auth endpoints
│   │   ├── user.service.ts           # User endpoints
│   │   ├── offers.service.ts         # Offers endpoints
│   │   ├── donations.service.ts      # Donations endpoints
│   │   └── index.ts                  # Export all services
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── useOffers.ts              # Offers data hook
│   │   ├── useDonations.ts           # Donations data hook
│   │   └── useUser.ts                # User data hook
│   │
│   ├── store/                        # Global state management
│   │   ├── authStore.ts              # Auth state (Zustand)
│   │   └── userStore.ts              # User state
│   │
│   ├── types/                        # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── offer.types.ts
│   │   ├── donation.types.ts
│   │   └── api.types.ts
│   │
│   └── middleware.ts                 # Next.js middleware for auth
│
├── .env.local                        # Environment variables
├── .env.example                      # Example env file
└── next.config.js
```

---

## ⚙️ Axios Configuration

### 1. Create Axios Instance
```typescript
// src/lib/axios.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Define types
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Advanced Axios Configuration with Request Queue
```typescript
// src/lib/axios-advanced.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          return new Promise((resolve, reject) => {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
              this.processQueue(new Error('No refresh token'), null);
              this.isRefreshing = false;
              window.location.href = '/login';
              return reject(new Error('No refresh token'));
            }

            axios
              .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                refreshToken,
              })
              .then((response) => {
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                this.processQueue(null, accessToken);
                resolve(this.instance(originalRequest));
              })
              .catch((err) => {
                this.processQueue(err, null);
                localStorage.clear();
                window.location.href = '/login';
                reject(err);
              })
              .finally(() => {
                this.isRefreshing = false;
              });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient.getAxiosInstance();
```

---

## 🔐 Environment Variables

### Create `.env.local`
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3006
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For server-side only (no NEXT_PUBLIC prefix)
API_SECRET_KEY=your-secret-key
```

### Create `.env.example`
```bash
# .env.example (commit this to git)
NEXT_PUBLIC_API_URL=http://localhost:3006
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Using Environment Variables
```typescript
// In any component or service
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only (API routes, getServerSideProps, etc.)
const secretKey = process.env.API_SECRET_KEY;
```

---

## 🎯 Service Layer Pattern

### 1. Base API Service
```typescript
// src/services/api.service.ts
import api from '@/lib/axios';
import { AxiosResponse } from 'axios';

export class ApiService {
  /**
   * GET request
   */
  protected async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await api.get(url);
    return response.data;
  }

  /**
   * POST request
   */
  protected async post<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await api.post(url, data);
    return response.data;
  }

  /**
   * PUT request
   */
  protected async put<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await api.put(url, data);
    return response.data;
  }

  /**
   * PATCH request
   */
  protected async patch<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await api.patch(url, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  protected async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await api.delete(url);
    return response.data;
  }
}
```

### 2. Authentication Service
```typescript
// src/services/auth.service.ts
import { ApiService } from './api.service';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from '@/types/auth.types';

class AuthService extends ApiService {
  private readonly AUTH_PREFIX = '/auth';

  /**
   * User signup
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.post<SignupResponse, SignupRequest>(
      `${this.AUTH_PREFIX}/signup`,
      data
    );
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse, LoginRequest>(
      `${this.AUTH_PREFIX}/login`,
      data
    );

    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.post<RefreshTokenResponse, RefreshTokenRequest>(
      `${this.AUTH_PREFIX}/refresh`,
      { refreshToken }
    );
  }

  /**
   * Get current user
   */
  async getMe(): Promise<User> {
    return this.get<User>(`${this.AUTH_PREFIX}/me`);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.put<void, ChangePasswordRequest>(
      `${this.AUTH_PREFIX}/change-password`,
      data
    );
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }, ForgotPasswordRequest>(
      `${this.AUTH_PREFIX}/forgot-password`,
      data
    );
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }, ResetPasswordRequest>(
      `${this.AUTH_PREFIX}/reset-password`,
      data
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return this.get<User>(`${this.AUTH_PREFIX}/user/${userId}`);
  }

  /**
   * Get all businesses (Admin only)
   */
  async getAllBusinesses(): Promise<User[]> {
    return this.get<User[]>(`${this.AUTH_PREFIX}/getAllBusinesses`);
  }

  /**
   * Get unactivated businesses (Admin only)
   */
  async getUnactivatedBusinesses(): Promise<User[]> {
    return this.get<User[]>(`${this.AUTH_PREFIX}/getAllBusinesses-notActivated`);
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Export singleton instance
export const authService = new AuthService();
```

### 3. Offers Service
```typescript
// src/services/offers.service.ts
import { ApiService } from './api.service';
import { Offer, CreateOfferRequest, UpdateOfferRequest } from '@/types/offer.types';

class OffersService extends ApiService {
  private readonly OFFERS_PREFIX = '/api/offers';

  /**
   * Create new offer
   */
  async create(data: CreateOfferRequest): Promise<Offer> {
    return this.post<Offer, CreateOfferRequest>(
      `${this.OFFERS_PREFIX}/create`,
      data
    );
  }

  /**
   * Get offer by ID
   */
  async getById(offerId: string): Promise<Offer> {
    return this.get<Offer>(`${this.OFFERS_PREFIX}/${offerId}`);
  }

  /**
   * Get available offers for user
   */
  async getAvailableOffers(userId: string): Promise<Offer[]> {
    return this.get<Offer[]>(`${this.OFFERS_PREFIX}/available/${userId}`);
  }

  /**
   * Update offer
   */
  async update(offerId: string, data: UpdateOfferRequest): Promise<Offer> {
    return this.patch<Offer, UpdateOfferRequest>(
      `${this.OFFERS_PREFIX}/${offerId}`,
      data
    );
  }

  /**
   * Delete offer
   */
  async delete(offerId: string): Promise<void> {
    return this.delete<void>(`${this.OFFERS_PREFIX}/${offerId}`);
  }
}

export const offersService = new OffersService();
```

### 4. Donations Service
```typescript
// src/services/donations.service.ts
import { ApiService } from './api.service';
import { Donation, CreateDonationRequest, UpdateDonationRequest } from '@/types/donation.types';

class DonationsService extends ApiService {
  private readonly DONATIONS_PREFIX = '/api/donation';

  /**
   * Create donation
   */
  async create(userId: string, data: CreateDonationRequest): Promise<Donation> {
    return this.post<Donation, CreateDonationRequest>(
      `${this.DONATIONS_PREFIX}/create/${userId}`,
      data
    );
  }

  /**
   * Get donation by ID
   */
  async getById(donationId: string): Promise<Donation> {
    return this.get<Donation>(`${this.DONATIONS_PREFIX}/${donationId}`);
  }

  /**
   * Update donation
   */
  async update(donationId: string, data: UpdateDonationRequest): Promise<Donation> {
    return this.patch<Donation, UpdateDonationRequest>(
      `${this.DONATIONS_PREFIX}/${donationId}`,
      data
    );
  }

  /**
   * Delete donation
   */
  async delete(donationId: string): Promise<void> {
    return this.delete<void>(`${this.DONATIONS_PREFIX}/${donationId}`);
  }
}

export const donationsService = new DonationsService();
```

### 5. Export All Services
```typescript
// src/services/index.ts
export { authService } from './auth.service';
export { offersService } from './offers.service';
export { donationsService } from './donations.service';
// Export other services...
```

---

## 🪝 React Hooks for API Calls

### 1. Authentication Hook
```typescript
// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { User, LoginRequest, SignupRequest } from '@/types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (err: any) {
        console.error('Failed to load user:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      setUser(response.user);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup user
   */
  const signup = async (data: SignupRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.signup(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  /**
   * Change password
   */
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.changePassword({ oldPassword, newPassword });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    changePassword,
    isAuthenticated: authService.isAuthenticated(),
  };
};
```

### 2. Offers Hook with React Query
```typescript
// src/hooks/useOffers.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersService } from '@/services';
import { CreateOfferRequest, UpdateOfferRequest } from '@/types/offer.types';

export const useOffers = (userId?: string) => {
  const queryClient = useQueryClient();

  /**
   * Get available offers
   */
  const { data: offers, isLoading, error } = useQuery({
    queryKey: ['offers', userId],
    queryFn: () => userId ? offersService.getAvailableOffers(userId) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Get single offer
   */
  const useOffer = (offerId: string) => {
    return useQuery({
      queryKey: ['offer', offerId],
      queryFn: () => offersService.getById(offerId),
      enabled: !!offerId,
    });
  };

  /**
   * Create offer mutation
   */
  const createOffer = useMutation({
    mutationFn: (data: CreateOfferRequest) => offersService.create(data),
    onSuccess: () => {
      // Invalidate and refetch offers
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  /**
   * Update offer mutation
   */
  const updateOffer = useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: UpdateOfferRequest }) =>
      offersService.update(offerId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific offer and list
      queryClient.invalidateQueries({ queryKey: ['offer', variables.offerId] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  /**
   * Delete offer mutation
   */
  const deleteOffer = useMutation({
    mutationFn: (offerId: string) => offersService.delete(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });

  return {
    offers,
    isLoading,
    error,
    useOffer,
    createOffer,
    updateOffer,
    deleteOffer,
  };
};
```

### 3. Generic API Hook
```typescript
// src/hooks/useApi.ts
'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export const useApi = <T,>(
  apiFunc: (...args: any[]) => Promise<T>,
  options?: UseApiOptions<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunc(...args);
        setData(result);
        
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : 'An error occurred';
        
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

// Usage example
// const { data, loading, error, execute } = useApi(offersService.getAvailableOffers);
// execute(userId);
```

---

## 🖥️ Server-Side API Calls

### 1. Server Component with Data Fetching
```typescript
// app/(dashboard)/offers/page.tsx
import { authService, offersService } from '@/services';
import { cookies } from 'next/headers';
import OfferList from '@/components/offers/OfferList';

async function getServerSideOffers(userId: string) {
  'use server';
  
  try {
    const offers = await offersService.getAvailableOffers(userId);
    return offers;
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return [];
  }
}

export default async function OffersPage() {
  // Get user from cookie or other server-side method
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return <div>Please login to view offers</div>;
  }

  const offers = await getServerSideOffers(userId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Available Offers</h1>
      <OfferList offers={offers} />
    </div>
  );
}
```

### 2. API Route Handler
```typescript
// app/api/offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { offersService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const offers = await offersService.getAvailableOffers(userId);
    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const offer = await offersService.create(body);
    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 💻 Client-Side API Calls

### 1. Login Form Component
```typescript
// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login error:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="text-center">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
```

### 2. Offers List Component
```typescript
// src/components/offers/OfferList.tsx
'use client';

import { useOffers } from '@/hooks/useOffers';
import { useAuth } from '@/hooks/useAuth';
import OfferCard from './OfferCard';
import Loading from '@/components/ui/Loading';

export default function OfferList() {
  const { user } = useAuth();
  const { offers, isLoading, error } = useOffers(user?.id);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error loading offers: {error.message}
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No offers available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
```

### 3. Create Offer Form
```typescript
// src/components/offers/CreateOfferForm.tsx
'use client';

import { useState } from 'react';
import { useOffers } from '@/hooks/useOffers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreateOfferRequest } from '@/types/offer.types';

export default function CreateOfferForm() {
  const { createOffer } = useOffers();
  const [formData, setFormData] = useState<CreateOfferRequest>({
    title: '',
    description: '',
    pointsRequired: 0,
    validUntil: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOffer.mutateAsync(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        pointsRequired: 0,
        validUntil: '',
      });
      alert('Offer created successfully!');
    } catch (error: any) {
      alert(`Failed to create offer: ${error.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pointsRequired' ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="pointsRequired" className="block text-sm font-medium mb-2">
          Points Required
        </label>
        <Input
          id="pointsRequired"
          name="pointsRequired"
          type="number"
          value={formData.pointsRequired}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="validUntil" className="block text-sm font-medium mb-2">
          Valid Until
        </label>
        <Input
          id="validUntil"
          name="validUntil"
          type="date"
          value={formData.validUntil}
          onChange={handleChange}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={createOffer.isPending}
        className="w-full"
      >
        {createOffer.isPending ? 'Creating...' : 'Create Offer'}
      </Button>
    </form>
  );
}
```

---

## 🔒 Protected Routes

### 1. Middleware for Route Protection
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access auth pages
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 2. Protected Route Component
```typescript
// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    if (!loading && requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
```

### 3. Usage in Layout
```typescript
// app/(dashboard)/layout.tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          {/* Navigation */}
        </nav>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🎨 TypeScript Types

### 1. Authentication Types
```typescript
// src/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone_number?: string;
  accountNumber: string;
  redeemPoints: number;
  address?: string;
  city?: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: string;
  phone_number?: string;
  accountNumber: string;
  redeemPoints: number;
  description?: string;
  address?: string;
  city?: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  otp: string;
  newPassword: string;
}
```

### 2. Offer Types
```typescript
// src/types/offer.types.ts
export interface Offer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  validUntil: string;
  businessId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  title: string;
  description: string;
  pointsRequired: number;
  validUntil: string;
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {}
```

### 3. Donation Types
```typescript
// src/types/donation.types.ts
export interface Donation {
  id: string;
  amount: number;
  projectId: string;
  userId: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationRequest {
  amount: number;
  projectId: string;
  message?: string;
}

export interface UpdateDonationRequest extends Partial<CreateDonationRequest> {}
```

### 4. API Response Types
```typescript
// src/types/api.types.ts
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## 🧪 Testing

### 1. Setup Testing Libraries
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
npm install -D axios-mock-adapter
```

### 2. Test Service Layer
```typescript
// __tests__/services/auth.service.test.ts
import MockAdapter from 'axios-mock-adapter';
import api from '@/lib/axios';
import { authService } from '@/services/auth.service';

describe('AuthService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should login successfully', async () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    const mockResponse = {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
    };

    mock.onPost('/auth/login').reply(200, mockResponse);

    const result = await authService.login(loginData);

    expect(result).toEqual(mockResponse);
    expect(localStorage.getItem('accessToken')).toBe('mock-token');
    expect(localStorage.getItem('refreshToken')).toBe('mock-refresh');
  });

  it('should handle login error', async () => {
    const loginData = { email: 'test@example.com', password: 'wrong' };
    
    mock.onPost('/auth/login').reply(401, {
      message: 'Invalid credentials',
    });

    await expect(authService.login(loginData)).rejects.toThrow();
  });
});
```

### 3. Test React Components
```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';
import { authService } from '@/services';

jest.mock('@/services');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should call login service on submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', email: 'test@example.com' },
    });

    (authService.login as jest.Mock) = mockLogin;

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

---

## ✅ Best Practices Checklist

### Setup & Configuration
- [ ] Environment variables properly configured (`.env.local`)
- [ ] Axios instance configured with interceptors
- [ ] Base URL uses environment variable
- [ ] TypeScript types defined for all API responses
- [ ] Path aliases configured in `tsconfig.json`

### Service Layer
- [ ] Services extend base `ApiService` class
- [ ] All API calls go through service layer
- [ ] Services use TypeScript for type safety
- [ ] Error handling implemented in services
- [ ] Singleton pattern used for service instances

### Authentication
- [ ] Tokens stored securely (httpOnly cookies preferred)
- [ ] Token refresh logic implemented
- [ ] 401 errors handled with automatic token refresh
- [ ] Logout clears all stored tokens
- [ ] Protected routes middleware configured

### React Components
- [ ] Custom hooks used for API calls
- [ ] Loading states displayed to users
- [ ] Error messages shown appropriately
- [ ] Forms have client-side validation
- [ ] Success messages shown after actions

### Performance
- [ ] React Query used for data caching
- [ ] Stale-while-revalidate strategy implemented
- [ ] Debouncing used for search/filter inputs
- [ ] Pagination implemented for large lists
- [ ] Images optimized with Next.js Image component

### Error Handling
- [ ] All API calls wrapped in try-catch
- [ ] User-friendly error messages displayed
- [ ] Network errors handled gracefully
- [ ] 404 errors show appropriate pages
- [ ] Error boundaries implemented

### Security
- [ ] Never expose sensitive data in client-side code
- [ ] API keys stored in server-side environment variables
- [ ] Input sanitization on forms
- [ ] CSRF protection considered
- [ ] XSS protection implemented

### Code Quality
- [ ] ESLint configured and passing
- [ ] Prettier configured for code formatting
- [ ] TypeScript strict mode enabled
- [ ] Components follow single responsibility principle
- [ ] Code is DRY (Don't Repeat Yourself)

### Testing
- [ ] Unit tests for services
- [ ] Component tests with React Testing Library
- [ ] Integration tests for critical flows
- [ ] Mocking configured for API calls
- [ ] Test coverage above 80%

---

## 📝 Complete Working Example

### Full Login Flow
```typescript
// 1. Type Definition
// src/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// 2. Service
// src/services/auth.service.ts
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '@/types/auth.types';

class AuthService extends ApiService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login', data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }

  logout() {
    localStorage.clear();
  }
}

export const authService = new AuthService();

// 3. Hook
// src/hooks/useAuth.ts
import { useState } from 'react';
import { authService } from '@/services';
import { LoginRequest } from '@/types/auth.types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

// 4. Component
// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          required
        />
        
        {error && <p className="text-red-500">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Update .env.local with your API URL
NEXT_PUBLIC_API_URL=http://localhost:3006

# 4. Run development server
npm run dev

# 5. Build for production
npm run build

# 6. Run tests
npm test
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Earth Bound API Documentation](./FRONTEND_INTEGRATION_GUIDE.md)

---

**Last Updated**: January 2026  
**Version**: 1.0.0

---

Happy Coding with Next.js! 🚀
