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

## 🏗️ Backend Architecture

The Earth Bound backend uses a **microservices architecture** with three main services:

1. **Auth Service** (Port 3001) - Handles authentication, user management, and JWT tokens
2. **API Service** (Port 3000) - Core business logic for offers, donations, CSR projects, etc.
3. **Gateway Service** (Port 3006) - **Main entry point** that routes requests to appropriate services

**Important**: All frontend requests should go through the **Gateway** at `http://localhost:3006`. The gateway handles:
- Request routing to appropriate microservices
- Load balancing
- Authentication validation
- Error handling and response formatting

### Available Modules
- 👥 **Admin** - Admin user management
- 🏢 **Business** - Business account management
- 👤 **User** - End user management
- 🎁 **Offers** - Business offers and promotions
- 🎫 **User Offers** - User's redeemed/claimed offers
- 💝 **Donations** - Donation transactions
- 🌱 **CSR Projects** - Corporate Social Responsibility projects
- 🎪 **Organizer** - Event organizers
- 💳 **Stripe** - Payment processing

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
│   │   ├── auth.service.ts           # Auth endpoints (port 3001)
│   │   ├── admin.service.ts          # Admin endpoints
│   │   ├── business.service.ts       # Business endpoints
│   │   ├── user.service.ts           # User endpoints
│   │   ├── offers.service.ts         # Offers endpoints
│   │   ├── user-offers.service.ts    # User offers endpoints
│   │   ├── donations.service.ts      # Donations endpoints
│   │   ├── csr-project.service.ts    # CSR projects endpoints
│   │   ├── organizer.service.ts      # Organizer endpoints
│   │   ├── stripe.service.ts         # Stripe payment endpoints
│   │   └── index.ts                  # Export all services
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── useAdmin.ts               # Admin operations hook
│   │   ├── useBusiness.ts            # Business operations hook
│   │   ├── useOffers.ts              # Offers data hook
│   │   ├── useUserOffers.ts          # User offers hook
│   │   ├── useDonations.ts           # Donations data hook
│   │   ├── useCSRProjects.ts         # CSR projects hook
│   │   ├── useOrganizer.ts           # Organizer hook
│   │   ├── useStripe.ts              # Stripe payments hook
│   │   └── useUser.ts                # User data hook
│   │
│   ├── store/                        # Global state management
│   │   ├── authStore.ts              # Auth state (Zustand)
│   │   └── userStore.ts              # User state
│   │
│   ├── types/                        # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── admin.types.ts
│   │   ├── business.types.ts
│   │   ├── offer.types.ts
│   │   ├── user-offer.types.ts
│   │   ├── donation.types.ts
│   │   ├── csr-project.types.ts
│   │   ├── organizer.types.ts
│   │   ├── stripe.types.ts
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

# Gateway API URL (Main entry point for all requests)
NEXT_PUBLIC_API_URL=http://localhost:3006
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Microservices Ports (For reference - not directly accessed by frontend)
# Auth Service: 3001
# API Service: 3000
# Gateway Service: 3006

# Optional: For server-side only (no NEXT_PUBLIC prefix)
API_SECRET_KEY=your-secret-key
```

### Create `.env.example`
```bash
# .env.example (commit this to git)
NEXT_PUBLIC_API_URL=http://localhost:3006
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Using Environment Variables
```typescript
// In any component or service
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Always use Gateway URL

// Server-side only (API routes, getServerSideProps, etc.)
const secretKey = process.env.API_SECRET_KEY;
```

### 📡 API Endpoints Reference

All API calls go through the **Gateway** at port 3006. The gateway routes requests internally:

#### Auth Endpoints (via Gateway → Auth Service)
```
POST   /auth/signup              - User registration
POST   /auth/login               - User login
POST   /auth/refresh             - Refresh access token
GET    /auth/me                  - Get current user
PUT    /auth/change-password     - Change password
POST   /auth/forgot-password     - Request password reset
POST   /auth/reset-password      - Reset password with OTP
GET    /auth/user/:userId        - Get user by ID
GET    /auth/getAllBusinesses    - Get all businesses (Admin)
GET    /auth/getAllBusinesses-notActivated - Get unactivated businesses
```

#### Admin Endpoints (via Gateway → API Service)
```
POST   /api/admin/create         - Create admin
GET    /api/admin/:adminId       - Get admin by ID
PATCH  /api/admin/:adminId       - Update admin
DELETE /api/admin/:adminId       - Delete admin
```

#### Business Endpoints (via Gateway → API Service)
```
POST   /api/business/create      - Create business
GET    /api/business             - Get all businesses
GET    /api/business/:id         - Get business by ID
PATCH  /api/business/:id         - Update business
DELETE /api/business/:id         - Delete business
POST   /api/business/:id/activate - Activate business
```

#### Offers Endpoints (via Gateway → API Service)
```
POST   /api/offers/create        - Create offer
GET    /api/offers/:offerId      - Get offer by ID
GET    /api/offers/available/:userId - Get available offers for user
PATCH  /api/offers/:offerId      - Update offer
DELETE /api/offers/:offerId      - Delete offer
```

#### User Offers Endpoints (via Gateway → API Service)
```
POST   /api/user_offers/redeem/:userId/:offerId - Redeem offer
GET    /api/user_offers/user/:userId - Get user's redeemed offers
GET    /api/user_offers/:id      - Get user offer by ID
DELETE /api/user_offers/:id      - Cancel redeemed offer
```

#### Donation Endpoints (via Gateway → API Service)
```
POST   /api/donation/create/:userId - Create donation
GET    /api/donation/:donationId - Get donation by ID
PATCH  /api/donation/:donationId - Update donation
DELETE /api/donation/:donationId - Delete donation
```

#### CSR Project Endpoints (via Gateway → API Service)
```
POST   /api/csr-project/create   - Create CSR project
GET    /api/csr-project          - Get all CSR projects
GET    /api/csr-project/:id      - Get project by ID
GET    /api/csr-project/organizer/:organizerId - Get projects by organizer
PATCH  /api/csr-project/:id      - Update project
DELETE /api/csr-project/:id      - Delete project
```

#### Organizer Endpoints (via Gateway → API Service)
```
POST   /api/organizer/create     - Create organizer
GET    /api/organizer            - Get all organizers
GET    /api/organizer/:id        - Get organizer by ID
PATCH  /api/organizer/:id        - Update organizer
DELETE /api/organizer/:id        - Delete organizer
```

#### Stripe Payment Endpoints (via Gateway → API Service)
```
POST   /api/stripe/create-payment-intent - Create payment intent
POST   /api/stripe/confirm-payment - Confirm payment
GET    /api/stripe/payment-status/:paymentIntentId - Get payment status
POST   /api/stripe/donation-payment - Create donation payment
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

### 5. Admin Service
```typescript
// src/services/admin.service.ts
import { ApiService } from './api.service';
import { Admin, CreateAdminRequest, UpdateAdminRequest } from '@/types/admin.types';

class AdminService extends ApiService {
  private readonly ADMIN_PREFIX = '/api/admin';

  /**
   * Create new admin
   */
  async create(data: CreateAdminRequest): Promise<Admin> {
    return this.post<Admin, CreateAdminRequest>(
      `${this.ADMIN_PREFIX}/create`,
      data
    );
  }

  /**
   * Get admin by ID
   */
  async getById(adminId: string): Promise<Admin> {
    return this.get<Admin>(`${this.ADMIN_PREFIX}/${adminId}`);
  }

  /**
   * Update admin
   */
  async update(adminId: string, data: UpdateAdminRequest): Promise<Admin> {
    return this.patch<Admin, UpdateAdminRequest>(
      `${this.ADMIN_PREFIX}/${adminId}`,
      data
    );
  }

  /**
   * Delete admin
   */
  async delete(adminId: string): Promise<void> {
    return this.delete<void>(`${this.ADMIN_PREFIX}/${adminId}`);
  }
}

export const adminService = new AdminService();
```

### 6. Business Service
```typescript
// src/services/business.service.ts
import { ApiService } from './api.service';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '@/types/business.types';

class BusinessService extends ApiService {
  private readonly BUSINESS_PREFIX = '/api/business';

  /**
   * Create new business
   */
  async create(data: CreateBusinessRequest): Promise<Business> {
    return this.post<Business, CreateBusinessRequest>(
      `${this.BUSINESS_PREFIX}/create`,
      data
    );
  }

  /**
   * Get business by ID
   */
  async getById(businessId: string): Promise<Business> {
    return this.get<Business>(`${this.BUSINESS_PREFIX}/${businessId}`);
  }

  /**
   * Get all businesses
   */
  async getAll(): Promise<Business[]> {
    return this.get<Business[]>(`${this.BUSINESS_PREFIX}`);
  }

  /**
   * Update business
   */
  async update(businessId: string, data: UpdateBusinessRequest): Promise<Business> {
    return this.patch<Business, UpdateBusinessRequest>(
      `${this.BUSINESS_PREFIX}/${businessId}`,
      data
    );
  }

  /**
   * Delete business
   */
  async delete(businessId: string): Promise<void> {
    return this.delete<void>(`${this.BUSINESS_PREFIX}/${businessId}`);
  }

  /**
   * Activate business account
   */
  async activate(businessId: string): Promise<Business> {
    return this.post<Business>(`${this.BUSINESS_PREFIX}/${businessId}/activate`);
  }
}

export const businessService = new BusinessService();
```

### 7. CSR Project Service
```typescript
// src/services/csr-project.service.ts
import { ApiService } from './api.service';
import { CSRProject, CreateCSRProjectRequest, UpdateCSRProjectRequest } from '@/types/csr-project.types';

class CSRProjectService extends ApiService {
  private readonly CSR_PREFIX = '/api/csr-project';

  /**
   * Create new CSR project
   */
  async create(data: CreateCSRProjectRequest): Promise<CSRProject> {
    return this.post<CSRProject, CreateCSRProjectRequest>(
      `${this.CSR_PREFIX}/create`,
      data
    );
  }

  /**
   * Get CSR project by ID
   */
  async getById(projectId: string): Promise<CSRProject> {
    return this.get<CSRProject>(`${this.CSR_PREFIX}/${projectId}`);
  }

  /**
   * Get all CSR projects
   */
  async getAll(): Promise<CSRProject[]> {
    return this.get<CSRProject[]>(`${this.CSR_PREFIX}`);
  }

  /**
   * Update CSR project
   */
  async update(projectId: string, data: UpdateCSRProjectRequest): Promise<CSRProject> {
    return this.patch<CSRProject, UpdateCSRProjectRequest>(
      `${this.CSR_PREFIX}/${projectId}`,
      data
    );
  }

  /**
   * Delete CSR project
   */
  async delete(projectId: string): Promise<void> {
    return this.delete<void>(`${this.CSR_PREFIX}/${projectId}`);
  }

  /**
   * Get projects by organizer
   */
  async getByOrganizer(organizerId: string): Promise<CSRProject[]> {
    return this.get<CSRProject[]>(`${this.CSR_PREFIX}/organizer/${organizerId}`);
  }
}

export const csrProjectService = new CSRProjectService();
```

### 8. User Offers Service
```typescript
// src/services/user-offers.service.ts
import { ApiService } from './api.service';
import { UserOffer, RedeemOfferRequest } from '@/types/user-offer.types';

class UserOffersService extends ApiService {
  private readonly USER_OFFERS_PREFIX = '/api/user_offers';

  /**
   * Redeem an offer
   */
  async redeem(userId: string, offerId: string, data: RedeemOfferRequest): Promise<UserOffer> {
    return this.post<UserOffer, RedeemOfferRequest>(
      `${this.USER_OFFERS_PREFIX}/redeem/${userId}/${offerId}`,
      data
    );
  }

  /**
   * Get user's offers
   */
  async getUserOffers(userId: string): Promise<UserOffer[]> {
    return this.get<UserOffer[]>(`${this.USER_OFFERS_PREFIX}/user/${userId}`);
  }

  /**
   * Get user offer by ID
   */
  async getById(userOfferId: string): Promise<UserOffer> {
    return this.get<UserOffer>(`${this.USER_OFFERS_PREFIX}/${userOfferId}`);
  }

  /**
   * Cancel redeemed offer
   */
  async cancel(userOfferId: string): Promise<void> {
    return this.delete<void>(`${this.USER_OFFERS_PREFIX}/${userOfferId}`);
  }
}

export const userOffersService = new UserOffersService();
```

### 9. Organizer Service
```typescript
// src/services/organizer.service.ts
import { ApiService } from './api.service';
import { Organizer, CreateOrganizerRequest, UpdateOrganizerRequest } from '@/types/organizer.types';

class OrganizerService extends ApiService {
  private readonly ORGANIZER_PREFIX = '/api/organizer';

  /**
   * Create new organizer
   */
  async create(data: CreateOrganizerRequest): Promise<Organizer> {
    return this.post<Organizer, CreateOrganizerRequest>(
      `${this.ORGANIZER_PREFIX}/create`,
      data
    );
  }

  /**
   * Get organizer by ID
   */
  async getById(organizerId: string): Promise<Organizer> {
    return this.get<Organizer>(`${this.ORGANIZER_PREFIX}/${organizerId}`);
  }

  /**
   * Get all organizers
   */
  async getAll(): Promise<Organizer[]> {
    return this.get<Organizer[]>(`${this.ORGANIZER_PREFIX}`);
  }

  /**
   * Update organizer
   */
  async update(organizerId: string, data: UpdateOrganizerRequest): Promise<Organizer> {
    return this.patch<Organizer, UpdateOrganizerRequest>(
      `${this.ORGANIZER_PREFIX}/${organizerId}`,
      data
    );
  }

  /**
   * Delete organizer
   */
  async delete(organizerId: string): Promise<void> {
    return this.delete<void>(`${this.ORGANIZER_PREFIX}/${organizerId}`);
  }
}

export const organizerService = new OrganizerService();
```

### 10. Stripe Payment Service
```typescript
// src/services/stripe.service.ts
import { ApiService } from './api.service';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  ConfirmPaymentRequest,
  PaymentStatus,
} from '@/types/stripe.types';

class StripeService extends ApiService {
  private readonly STRIPE_PREFIX = '/api/stripe';

  /**
   * Create payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    return this.post<PaymentIntentResponse, CreatePaymentIntentRequest>(
      `${this.STRIPE_PREFIX}/create-payment-intent`,
      data
    );
  }

  /**
   * Confirm payment
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentStatus> {
    return this.post<PaymentStatus, ConfirmPaymentRequest>(
      `${this.STRIPE_PREFIX}/confirm-payment`,
      data
    );
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    return this.get<PaymentStatus>(`${this.STRIPE_PREFIX}/payment-status/${paymentIntentId}`);
  }

  /**
   * Create donation payment
   */
  async createDonationPayment(userId: string, projectId: string, amount: number): Promise<PaymentIntentResponse> {
    return this.post<PaymentIntentResponse>(
      `${this.STRIPE_PREFIX}/donation-payment`,
      { userId, projectId, amount }
    );
  }
}

export const stripeService = new StripeService();
```

### 11. Export All Services
```typescript
// src/services/index.ts
export { authService } from './auth.service';
export { adminService } from './admin.service';
export { businessService } from './business.service';
export { offersService } from './offers.service';
export { userOffersService } from './user-offers.service';
export { donationsService } from './donations.service';
export { csrProjectService } from './csr-project.service';
export { organizerService } from './organizer.service';
export { stripeService } from './stripe.service';
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

### 3. Business Hook
```typescript
// src/hooks/useBusiness.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services';
import { CreateBusinessRequest, UpdateBusinessRequest } from '@/types/business.types';

export const useBusiness = () => {
  const queryClient = useQueryClient();

  /**
   * Get all businesses
   */
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Get single business
   */
  const useSingleBusiness = (businessId: string) => {
    return useQuery({
      queryKey: ['business', businessId],
      queryFn: () => businessService.getById(businessId),
      enabled: !!businessId,
    });
  };

  /**
   * Create business mutation
   */
  const createBusiness = useMutation({
    mutationFn: (data: CreateBusinessRequest) => businessService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });

  /**
   * Update business mutation
   */
  const updateBusiness = useMutation({
    mutationFn: ({ businessId, data }: { businessId: string; data: UpdateBusinessRequest }) =>
      businessService.update(businessId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });

  /**
   * Delete business mutation
   */
  const deleteBusiness = useMutation({
    mutationFn: (businessId: string) => businessService.delete(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });

  /**
   * Activate business mutation
   */
  const activateBusiness = useMutation({
    mutationFn: (businessId: string) => businessService.activate(businessId),
    onSuccess: (_, businessId) => {
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });

  return {
    businesses,
    isLoading,
    error,
    useSingleBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    activateBusiness,
  };
};
```

### 4. CSR Projects Hook
```typescript
// src/hooks/useCSRProjects.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { csrProjectService } from '@/services';
import { CreateCSRProjectRequest, UpdateCSRProjectRequest } from '@/types/csr-project.types';

export const useCSRProjects = (organizerId?: string) => {
  const queryClient = useQueryClient();

  /**
   * Get all CSR projects
   */
  const { data: projects, isLoading, error } = useQuery({
    queryKey: organizerId ? ['csr-projects', 'organizer', organizerId] : ['csr-projects'],
    queryFn: () => organizerId 
      ? csrProjectService.getByOrganizer(organizerId) 
      : csrProjectService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Get single CSR project
   */
  const useProject = (projectId: string) => {
    return useQuery({
      queryKey: ['csr-project', projectId],
      queryFn: () => csrProjectService.getById(projectId),
      enabled: !!projectId,
    });
  };

  /**
   * Create CSR project mutation
   */
  const createProject = useMutation({
    mutationFn: (data: CreateCSRProjectRequest) => csrProjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csr-projects'] });
    },
  });

  /**
   * Update CSR project mutation
   */
  const updateProject = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateCSRProjectRequest }) =>
      csrProjectService.update(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['csr-project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['csr-projects'] });
    },
  });

  /**
   * Delete CSR project mutation
   */
  const deleteProject = useMutation({
    mutationFn: (projectId: string) => csrProjectService.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csr-projects'] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    useProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
```

### 5. User Offers Hook
```typescript
// src/hooks/useUserOffers.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userOffersService } from '@/services';
import { RedeemOfferRequest } from '@/types/user-offer.types';

export const useUserOffers = (userId?: string) => {
  const queryClient = useQueryClient();

  /**
   * Get user's redeemed offers
   */
  const { data: userOffers, isLoading, error } = useQuery({
    queryKey: ['user-offers', userId],
    queryFn: () => userId ? userOffersService.getUserOffers(userId) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });

  /**
   * Get single user offer
   */
  const useUserOffer = (userOfferId: string) => {
    return useQuery({
      queryKey: ['user-offer', userOfferId],
      queryFn: () => userOffersService.getById(userOfferId),
      enabled: !!userOfferId,
    });
  };

  /**
   * Redeem offer mutation
   */
  const redeemOffer = useMutation({
    mutationFn: ({ userId, offerId, data }: { userId: string; offerId: string; data: RedeemOfferRequest }) =>
      userOffersService.redeem(userId, offerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-offers'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] }); // Also refresh available offers
    },
  });

  /**
   * Cancel redeemed offer mutation
   */
  const cancelOffer = useMutation({
    mutationFn: (userOfferId: string) => userOffersService.cancel(userOfferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-offers'] });
    },
  });

  return {
    userOffers,
    isLoading,
    error,
    useUserOffer,
    redeemOffer,
    cancelOffer,
  };
};
```

### 6. Stripe Payment Hook
```typescript
// src/hooks/useStripe.ts
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { stripeService } from '@/services';
import { CreatePaymentIntentRequest } from '@/types/stripe.types';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export const useStripe = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create payment intent mutation
   */
  const createPaymentIntent = useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => 
      stripeService.createPaymentIntent(data),
  });

  /**
   * Process payment
   */
  const processPayment = async (
    amount: number,
    userId: string,
    projectId?: string,
    paymentMethodId?: string
  ) => {
    try {
      setProcessing(true);
      setError(null);

      // Create payment intent
      const paymentIntent = await createPaymentIntent.mutateAsync({
        amount,
        userId,
        projectId,
      });

      if (paymentMethodId) {
        // Confirm payment with payment method
        const result = await stripeService.confirmPayment({
          paymentIntentId: paymentIntent.paymentIntentId,
          paymentMethodId,
        });
        
        return result;
      }

      return paymentIntent;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Payment failed';
      setError(errorMessage);
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Process donation payment
   */
  const processDonation = async (
    userId: string,
    projectId: string,
    amount: number
  ) => {
    try {
      setProcessing(true);
      setError(null);

      const paymentIntent = await stripeService.createDonationPayment(
        userId,
        projectId,
        amount
      );

      return paymentIntent;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Donation payment failed';
      setError(errorMessage);
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Get payment status
   */
  const getPaymentStatus = async (paymentIntentId: string) => {
    try {
      const status = await stripeService.getPaymentStatus(paymentIntentId);
      return status;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get payment status';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    stripePromise,
    processing,
    error,
    processPayment,
    processDonation,
    getPaymentStatus,
    createPaymentIntent: createPaymentIntent.mutateAsync,
  };
};
```

### 7. Generic API Hook
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

## � Stripe Payment Integration

### 1. Setup Stripe
```bash
# Install Stripe dependencies
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Variables
```bash
# Add to .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Stripe Provider Setup
```typescript
// src/app/layout.tsx or providers.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

### 4. Payment Form Component
```typescript
// src/components/payment/DonationPaymentForm.tsx
'use client';

import { useState } from 'react';
import { useStripe as useStripeHook } from '@/hooks/useStripe';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';

interface DonationPaymentFormProps {
  userId: string;
  projectId: string;
  amount: number;
  onSuccess?: () => void;
}

export default function DonationPaymentForm({
  userId,
  projectId,
  amount,
  onSuccess,
}: DonationPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { processDonation, processing, error } = useStripeHook();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setPaymentError(null);

      // Create payment intent
      const paymentIntent = await processDonation(userId, projectId, amount);

      // Confirm payment with card element
      const { error: confirmError, paymentIntent: confirmedPayment } = 
        await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        });

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed');
        return;
      }

      if (confirmedPayment?.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err: any) {
      setPaymentError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {(error || paymentError) && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error || paymentError}
        </div>
      )}

      <div className="text-lg font-semibold">
        Total: ${(amount / 100).toFixed(2)}
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : 'Donate Now'}
      </Button>
    </form>
  );
}
```

### 5. Usage Example
```typescript
// src/app/donate/[projectId]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCSRProjects } from '@/hooks/useCSRProjects';
import { useAuth } from '@/hooks/useAuth';
import DonationPaymentForm from '@/components/payment/DonationPaymentForm';
import { StripeProvider } from '@/providers/StripeProvider';

export default function DonatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { useProject } = useCSRProjects();
  const { data: project, isLoading } = useProject(params.projectId as string);
  const [amount, setAmount] = useState(1000); // $10.00 in cents

  const handleSuccess = () => {
    alert('Thank you for your donation!');
    router.push('/dashboard');
  };

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
      <p className="mb-4">{project.description}</p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Donation Amount
        </label>
        <input
          type="number"
          value={amount / 100}
          onChange={(e) => setAmount(Math.round(parseFloat(e.target.value) * 100))}
          min="1"
          step="0.01"
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <StripeProvider>
        <DonationPaymentForm
          userId={user!.id}
          projectId={project.id}
          amount={amount}
          onSuccess={handleSuccess}
        />
      </StripeProvider>
    </div>
  );
}
```

---

## �🔒 Protected Routes

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

### 4. Admin Types
```typescript
// src/types/admin.types.ts
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminRequest extends Partial<CreateAdminRequest> {}
```

### 5. Business Types
```typescript
// src/types/business.types.ts
export interface Business {
  id: string;
  name: string;
  email: string;
  role: 'business';
  phone_number?: string;
  accountNumber: string;
  description?: string;
  address?: string;
  city?: string;
  isActivated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone_number?: string;
  accountNumber: string;
  description?: string;
  address?: string;
  city?: string;
}

export interface UpdateBusinessRequest {
  name?: string;
  phone_number?: string;
  description?: string;
  address?: string;
  city?: string;
}
```

### 6. CSR Project Types
```typescript
// src/types/csr-project.types.ts
export interface CSRProject {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  organizerId: string;
  organizerName?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCSRProjectRequest {
  title: string;
  description: string;
  goalAmount: number;
  organizerId: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

export interface UpdateCSRProjectRequest {
  title?: string;
  description?: string;
  goalAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'cancelled';
  imageUrl?: string;
}
```

### 7. User Offer Types
```typescript
// src/types/user-offer.types.ts
export interface UserOffer {
  id: string;
  userId: string;
  offerId: string;
  offerTitle?: string;
  redeemCode: string;
  pointsUsed: number;
  redeemedAt: string;
  status: 'active' | 'used' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface RedeemOfferRequest {
  pointsToUse: number;
}
```

### 8. Organizer Types
```typescript
// src/types/organizer.types.ts
export interface Organizer {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  description?: string;
  address?: string;
  city?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizerRequest {
  name: string;
  email: string;
  phone_number?: string;
  description?: string;
  address?: string;
  city?: string;
  websiteUrl?: string;
}

export interface UpdateOrganizerRequest extends Partial<CreateOrganizerRequest> {}
```

### 9. Stripe Types
```typescript
// src/types/stripe.types.ts
export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  currency?: string; // Default: 'usd'
  userId: string;
  projectId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId: string;
}

export interface PaymentStatus {
  paymentIntentId: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'failed';
  amount: number;
  currency: string;
  created: number;
  metadata?: Record<string, any>;
}
```

### 10. API Response Types
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
- [ ] Base URL uses Gateway endpoint (port 3006)
- [ ] TypeScript types defined for all API responses
- [ ] Path aliases configured in `tsconfig.json`
- [ ] All requests go through Gateway (never directly to Auth/API services)

### Service Layer
- [ ] Services extend base `ApiService` class
- [ ] All API calls go through service layer
- [ ] Services use TypeScript for type safety
- [ ] Error handling implemented in services
- [ ] Singleton pattern used for service instances
- [ ] All modules have corresponding services (auth, admin, business, etc.)

### Authentication
- [ ] Tokens stored securely (httpOnly cookies preferred over localStorage)
- [ ] Token refresh logic implemented with request queue
- [ ] 401 errors handled with automatic token refresh
- [ ] Logout clears all stored tokens
- [ ] Protected routes middleware configured
- [ ] Role-based access control implemented where needed

### React Components
- [ ] Custom hooks used for API calls
- [ ] Loading states displayed to users
- [ ] Error messages shown appropriately
- [ ] Forms have client-side validation
- [ ] Success messages shown after actions
- [ ] React Query used for caching and optimistic updates

### Performance
- [ ] React Query used for data caching
- [ ] Stale-while-revalidate strategy implemented
- [ ] Debouncing used for search/filter inputs
- [ ] Pagination implemented for large lists
- [ ] Images optimized with Next.js Image component
- [ ] Query keys properly structured for cache invalidation

### Error Handling
- [ ] All API calls wrapped in try-catch
- [ ] User-friendly error messages displayed
- [ ] Network errors handled gracefully
- [ ] 404 errors show appropriate pages
- [ ] Error boundaries implemented
- [ ] Axios interceptors handle global errors

### Security
- [ ] Never expose sensitive data in client-side code
- [ ] API keys stored in server-side environment variables
- [ ] Input sanitization on forms
- [ ] CSRF protection considered
- [ ] XSS protection implemented
- [ ] Stripe publishable key (not secret key) used in frontend

### Code Quality
- [ ] ESLint configured and passing
- [ ] Prettier configured for code formatting
- [ ] TypeScript strict mode enabled
- [ ] Components follow single responsibility principle
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Meaningful variable and function names

### Testing
- [ ] Unit tests for services
- [ ] Component tests with React Testing Library
- [ ] Integration tests for critical flows
- [ ] Mocking configured for API calls
- [ ] Test coverage above 80%
- [ ] E2E tests for main user flows

### Microservices Architecture
- [ ] Understand that Gateway (port 3006) is the only entry point
- [ ] Never hardcode Auth (3001) or API (3000) service URLs in frontend
- [ ] Gateway handles routing, load balancing, and error handling
- [ ] Services are independently scalable
- [ ] Proper error handling for microservices communication

---

## 🚀 Deployment Considerations

### Environment Variables in Production
```bash
# Production .env
NEXT_PUBLIC_API_URL=https://api.earthbound.com
NEXT_PUBLIC_APP_URL=https://earthbound.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
```

### Docker Deployment
```dockerfile
# Dockerfile for Next.js app
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Nginx Configuration for Gateway
```nginx
# nginx.conf - For production gateway
upstream auth_service {
    server auth:3001;
}

upstream api_service {
    server api:3000;
}

server {
    listen 3006;
    server_name api.earthbound.com;

    # Auth routes
    location /auth {
        proxy_pass http://auth_service;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes
    location /api {
        proxy_pass http://api_service;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Compose for Full Stack
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://gateway:3006
    depends_on:
      - gateway

  gateway:
    build: ./gateway
    ports:
      - "3006:3006"
    depends_on:
      - auth
      - api

  auth:
    build: ./apps/auth
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}

  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=earthbound
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📝 Complete Real-World Examples

### 1. Business Dashboard with Offers Management
```typescript
// src/app/(dashboard)/business/offers/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOffers } from '@/hooks/useOffers';
import { CreateOfferRequest } from '@/types/offer.types';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function BusinessOffersPage() {
  const { user } = useAuth();
  const { offers, isLoading, createOffer, deleteOffer } = useOffers(user?.id);
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false);
      setFormData({ title: '', description: '', pointsRequired: 0, validUntil: '' });
      alert('Offer created successfully!');
    } catch (error: any) {
      alert(`Failed to create offer: ${error.message}`);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteOffer.mutateAsync(offerId);
        alert('Offer deleted successfully!');
      } catch (error: any) {
        alert(`Failed to delete offer: ${error.message}`);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Offers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create New Offer'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Points Required</label>
              <input
                type="number"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <Button type="submit" disabled={createOffer.isPending}>
              {createOffer.isPending ? 'Creating...' : 'Create Offer'}
            </Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers?.map((offer) => (
          <div key={offer.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
            <p className="text-gray-600 mb-4">{offer.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">
                Points: {offer.pointsRequired}
              </span>
              <span className="text-sm text-gray-500">
                Valid until: {new Date(offer.validUntil).toLocaleDateString()}
              </span>
            </div>
            <Button
              onClick={() => handleDelete(offer.id)}
              disabled={deleteOffer.isPending}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      {offers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No offers created yet. Create your first offer!</p>
        </div>
      )}
    </div>
  );
}
```

### 2. User Dashboard - Browse and Redeem Offers
```typescript
// src/app/(dashboard)/user/offers/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOffers } from '@/hooks/useOffers';
import { useUserOffers } from '@/hooks/useUserOffers';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function UserOffersPage() {
  const { user } = useAuth();
  const { offers, isLoading } = useOffers(user?.id);
  const { redeemOffer } = useUserOffers(user?.id);

  const handleRedeem = async (offerId: string, pointsRequired: number) => {
    if (!user) return;

    if (user.redeemPoints < pointsRequired) {
      alert('Insufficient points!');
      return;
    }

    if (confirm(`Redeem this offer for ${pointsRequired} points?`)) {
      try {
        await redeemOffer.mutateAsync({
          userId: user.id,
          offerId,
          data: { pointsToUse: pointsRequired },
        });
        alert('Offer redeemed successfully!');
      } catch (error: any) {
        alert(`Failed to redeem offer: ${error.message}`);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Available Offers</h1>
        <p className="text-gray-600 mt-2">
          Your Points: <span className="font-semibold text-green-600">{user?.redeemPoints || 0}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers?.map((offer) => (
          <div key={offer.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
            <p className="text-gray-600 mb-4">{offer.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-green-600">
                {offer.pointsRequired} Points
              </span>
              <span className="text-sm text-gray-500">
                Until: {new Date(offer.validUntil).toLocaleDateString()}
              </span>
            </div>
            <Button
              onClick={() => handleRedeem(offer.id, offer.pointsRequired)}
              disabled={
                redeemOffer.isPending ||
                (user?.redeemPoints || 0) < offer.pointsRequired
              }
              className="w-full"
            >
              {(user?.redeemPoints || 0) < offer.pointsRequired
                ? 'Insufficient Points'
                : 'Redeem Offer'}
            </Button>
          </div>
        ))}
      </div>

      {offers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No offers available at the moment.</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Admin Dashboard - Manage Businesses
```typescript
// src/app/(dashboard)/admin/businesses/page.tsx
'use client';

import { useBusiness } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function AdminBusinessesPage() {
  const { businesses, isLoading, activateBusiness, deleteBusiness } = useBusiness();

  const handleActivate = async (businessId: string) => {
    if (confirm('Activate this business account?')) {
      try {
        await activateBusiness.mutateAsync(businessId);
        alert('Business activated successfully!');
      } catch (error: any) {
        alert(`Failed to activate: ${error.message}`);
      }
    }
  };

  const handleDelete = async (businessId: string) => {
    if (confirm('Are you sure you want to delete this business?')) {
      try {
        await deleteBusiness.mutateAsync(businessId);
        alert('Business deleted successfully!');
      } catch (error: any) {
        alert(`Failed to delete: ${error.message}`);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Business Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Business Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {businesses?.map((business) => (
              <tr key={business.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {business.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{business.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      business.isActivated
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {business.isActivated ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {!business.isActivated && (
                    <Button
                      onClick={() => handleActivate(business.id)}
                      disabled={activateBusiness.isPending}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(business.id)}
                    disabled={deleteBusiness.isPending}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {businesses?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No businesses found.</p>
        </div>
      )}
    </div>
  );
}
```

### 4. CSR Projects List with Donations
```typescript
// src/app/projects/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCSRProjects } from '@/hooks/useCSRProjects';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading } = useCSRProjects();

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">CSR Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => {
          const progress = (project.currentAmount / project.goalAmount) * 100;
          
          return (
            <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>${project.currentAmount.toLocaleString()}</span>
                    <span className="text-gray-500">
                      of ${project.goalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>Organizer: {project.organizerName}</p>
                  <p>
                    Ends: {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  onClick={() => router.push(`/donate/${project.id}`)}
                  className="w-full"
                  disabled={project.status !== 'active'}
                >
                  {project.status === 'active' ? 'Donate Now' : 'Project Ended'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No active projects at the moment.</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Complete Full Login Flow
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
- [Stripe Documentation](https://stripe.com/docs)
- [Earth Bound API Documentation](./FRONTEND_INTEGRATION_GUIDE.md)
- [Docker Documentation](https://docs.docker.com/)

---

## 🎓 Summary

This comprehensive guide provides a complete integration blueprint for Earth Bound's microservices backend with Next.js frontend. Key takeaways:

1. **Always use the Gateway** (port 3006) - Never directly access Auth or API services
2. **Service layer pattern** - Encapsulate all API logic in dedicated service classes
3. **React Query** - Leverage caching, optimistic updates, and automatic refetching
4. **Type safety** - Use TypeScript throughout for better developer experience
5. **Error handling** - Implement robust error handling at multiple levels
6. **Security** - Follow best practices for token management and data protection
7. **Testing** - Write comprehensive tests for services and components
8. **Microservices aware** - Understand the architecture and how services communicate

---

**Last Updated**: January 29, 2026  
**Version**: 2.0.0  
**Backend Architecture**: Microservices (Auth + API + Gateway)

---

Happy Coding with Earth Bound! 🌍🚀
