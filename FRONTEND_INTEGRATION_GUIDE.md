# 🚀 Frontend Integration Guide - Earth Bound API

Complete guide for frontend developers on how to integrate with the Earth Bound backend services.

---

## 📚 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Services & Ports](#services--ports)
- [Authentication Flow](#authentication-flow)
- [API Endpoints Reference](#api-endpoints-reference)
- [Frontend Implementation Examples](#frontend-implementation-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

The backend consists of **3 microservices**:

1. **Gateway Service** (Port 3006) - Single entry point for all frontend requests
2. **Auth Service** (Port 3001) - Handles authentication & user management
3. **API Service** (Port 3000) - Business logic & data operations

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Gateway (Port 3006) │  ◄── All requests go here
└──────┬───────────────┘
       │
       ├─────► Auth Service (Port 3001)  [/auth/* routes]
       │
       └─────► API Service (Port 3000)   [/api/* routes]
```

### How It Works:
- **Frontend always calls Gateway** (http://localhost:3006)
- Gateway automatically routes requests based on URL prefix:
  - `/auth/*` → Auth Service
  - `/api/*` → API Service
- Gateway handles request forwarding, headers, and responses

---

## 🌐 Services & Ports

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Gateway** | 3006 | `http://localhost:3006` | **Use this for all API calls** |
| Auth Service | 3001 | `http://localhost:3001` | Authentication (routed via Gateway) |
| API Service | 3000 | `http://localhost:3000` | Business logic (routed via Gateway) |

### ⚠️ IMPORTANT
**Always use the Gateway URL** (`http://localhost:3006`) in your frontend. Never call Auth or API services directly.

---

## 🔐 Authentication Flow

### 1. User Signup
```http
POST http://localhost:3006/auth/signup
Content-Type: application/json

{
  "id": "unique-user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!",
  "role": "USER",
  "phone_number": "+1234567890",
  "accountNumber": "ACC123456",
  "redeemPoints": 0,
  "description": "User description",
  "address": "123 Main St",
  "city": "New York"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "userId": "unique-user-id"
}
```

---

### 2. User Login
```http
POST http://localhost:3006/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "unique-user-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**💾 Store tokens:**
- Save `accessToken` in memory or sessionStorage (more secure)
- Save `refreshToken` in httpOnly cookie (most secure) or localStorage

---

### 3. Refresh Token
```http
POST http://localhost:3006/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

---

### 4. Protected Requests
Add the access token to Authorization header:

```http
GET http://localhost:3006/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. Change Password
```http
PUT http://localhost:3006/auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

### 6. Forgot Password
```http
POST http://localhost:3006/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:** OTP sent to email

---

### 7. Reset Password
```http
POST http://localhost:3006/auth/reset-password
Content-Type: application/json

{
  "otp": "123456",
  "newPassword": "NewSecurePass789!"
}
```

---

### 8. Get Current User
```http
GET http://localhost:3006/auth/me
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "id": "unique-user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "redeemPoints": 100
}
```

---

### 9. Get User by ID
```http
GET http://localhost:3006/auth/user/{userId}
```

---

### 10. Admin: Get All Businesses
```http
GET http://localhost:3006/auth/getAllBusinesses
Authorization: Bearer <admin-access-token>
```

**⚠️ Requires ADMIN role**

---

### 11. Admin: Get Unactivated Businesses
```http
GET http://localhost:3006/auth/getAllBusinesses-notActivated
Authorization: Bearer <admin-access-token>
```

**⚠️ Requires ADMIN role**

---

## 📋 API Endpoints Reference

### 🧑‍💼 Admin Management (`/api/admin`)

#### Create Admin
```http
POST http://localhost:3006/api/admin/create
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  // ... other admin fields
}
```

#### Get Admin by ID
```http
GET http://localhost:3006/api/admin/{adminId}
Authorization: Bearer <access-token>
```

#### Update Admin
```http
PATCH http://localhost:3006/api/admin/{adminId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Admin
```http
DELETE http://localhost:3006/api/admin/{adminId}
Authorization: Bearer <access-token>
```

---

### 👤 User Management (`/api/user`)

#### Create User
```http
POST http://localhost:3006/api/user/create
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  // ... other user fields
}
```

#### Get User by ID
```http
GET http://localhost:3006/api/user/{userId}
Authorization: Bearer <access-token>
```

#### Update User
```http
PATCH http://localhost:3006/api/user/{userId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "city": "Los Angeles"
}
```

#### Delete User
```http
DELETE http://localhost:3006/api/user/{userId}
Authorization: Bearer <access-token>
```

---

### 🏢 Business Management (`/api/bussiness`)

#### Create Business
```http
POST http://localhost:3006/api/bussiness/create
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Business Name",
  "email": "business@example.com",
  // ... other business fields
}
```

#### Get Business by ID
```http
GET http://localhost:3006/api/bussiness/{businessId}
Authorization: Bearer <access-token>
```

#### Update Business
```http
PATCH http://localhost:3006/api/bussiness/{businessId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Business Name"
}
```

#### Delete Business
```http
DELETE http://localhost:3006/api/bussiness/{businessId}
Authorization: Bearer <access-token>
```

---

### 🎁 Offers Management (`/api/offers`)

#### Create Offer
```http
POST http://localhost:3006/api/offers/create
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "50% Off",
  "description": "Limited time offer",
  "pointsRequired": 100,
  "validUntil": "2026-12-31"
}
```

#### Get Offer by ID
```http
GET http://localhost:3006/api/offers/{offerId}
Authorization: Bearer <access-token>
```

#### Get Available Offers for User
```http
GET http://localhost:3006/api/offers/available/{userId}
Authorization: Bearer <access-token>
```

#### Update Offer
```http
PATCH http://localhost:3006/api/offers/{offerId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Updated Offer"
}
```

#### Delete Offer
```http
DELETE http://localhost:3006/api/offers/{offerId}
Authorization: Bearer <access-token>
```

---

### 💰 Donations (`/api/donation`)

#### Create Donation
```http
POST http://localhost:3006/api/donation/create/{userId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "amount": 100,
  "projectId": "project-123",
  "message": "Keep up the good work!"
}
```

#### Get Donation by ID
```http
GET http://localhost:3006/api/donation/{donationId}
Authorization: Bearer <access-token>
```

#### Update Donation
```http
PATCH http://localhost:3006/api/donation/{donationId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "amount": 150
}
```

#### Delete Donation
```http
DELETE http://localhost:3006/api/donation/{donationId}
Authorization: Bearer <access-token>
```

---

### 🌱 CSR Projects (`/api/csr-project`)

#### Create CSR Project
```http
POST http://localhost:3006/api/csr-project/create
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Clean Ocean Initiative",
  "description": "Help clean our oceans",
  "targetAmount": 10000,
  "currentAmount": 0
}
```

#### Get CSR Project by ID
```http
GET http://localhost:3006/api/csr-project/{projectId}
Authorization: Bearer <access-token>
```

#### Update CSR Project
```http
PATCH http://localhost:3006/api/csr-project/{projectId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentAmount": 5000
}
```

#### Delete CSR Project
```http
DELETE http://localhost:3006/api/csr-project/{projectId}
Authorization: Bearer <access-token>
```

---

### 🎪 Organizer Management (`/api/organizer`)

#### Create Organizer
```http
POST http://localhost:3006/api/organizer/create
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Event Organizer Name",
  "email": "organizer@example.com"
}
```

#### Get Organizer by ID
```http
GET http://localhost:3006/api/organizer/{organizerId}
Authorization: Bearer <access-token>
```

#### Update Organizer
```http
PATCH http://localhost:3006/api/organizer/{organizerId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Organizer Name"
}
```

#### Delete Organizer
```http
DELETE http://localhost:3006/api/organizer/{organizerId}
Authorization: Bearer <access-token>
```

---

### 🎟️ User Offers (`/api/user-offers`)

#### Endpoints for managing user redeemed offers
```http
POST http://localhost:3006/api/user-offers/create
GET http://localhost:3006/api/user-offers/{userOfferId}
PATCH http://localhost:3006/api/user-offers/{userOfferId}
DELETE http://localhost:3006/api/user-offers/{userOfferId}
```

---

### 💳 Stripe Payments (`/api/stripe`)

#### Webhook Endpoint
```http
POST http://localhost:3006/api/stripe/webhook
```

**⚠️ Note:** This endpoint expects raw body for Stripe signature verification.

---

## 💻 Frontend Implementation Examples

### React/Next.js with Axios

#### 1. Setup API Client
```typescript
// lib/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3006';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

#### 2. Authentication Service
```typescript
// services/auth.service.ts
import { api } from '@/lib/api';

export interface SignupData {
  id: string;
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: string;
  accountNumber: string;
  redeemPoints: number;
  phone_number?: string;
  address?: string;
  city?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  // Signup
  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Login
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (otp: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      otp,
      newPassword,
    });
    return response.data;
  },
};
```

---

#### 3. Offers Service
```typescript
// services/offers.service.ts
import { api } from '@/lib/api';

export interface CreateOfferData {
  title: string;
  description: string;
  pointsRequired: number;
  validUntil: string;
}

export const offersService = {
  // Create offer
  create: async (data: CreateOfferData) => {
    const response = await api.post('/api/offers/create', data);
    return response.data;
  },

  // Get offer by ID
  getById: async (offerId: string) => {
    const response = await api.get(`/api/offers/${offerId}`);
    return response.data;
  },

  // Get available offers for user
  getAvailableOffers: async (userId: string) => {
    const response = await api.get(`/api/offers/available/${userId}`);
    return response.data;
  },

  // Update offer
  update: async (offerId: string, data: Partial<CreateOfferData>) => {
    const response = await api.patch(`/api/offers/${offerId}`, data);
    return response.data;
  },

  // Delete offer
  delete: async (offerId: string) => {
    const response = await api.delete(`/api/offers/${offerId}`);
    return response.data;
  },
};
```

---

#### 4. React Hook Example
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (err) {
        setError(err.message);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { user, loading, error, login, logout };
};
```

---

#### 5. Login Component Example
```typescript
// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

### Vue.js Example

```typescript
// api/index.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3006',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

```vue
<!-- Login.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/api';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const { data } = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>
```

---

### Vanilla JavaScript / Fetch API

```javascript
// api.js
const API_BASE_URL = 'http://localhost:3006';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry request with new token
          return apiRequest(endpoint, options);
        } else {
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Usage examples
async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
}

async function getOffers(userId) {
  return await apiRequest(`/api/offers/available/${userId}`);
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| **200** | Success | Process response data |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Check request payload/validation |
| **401** | Unauthorized | Token missing/invalid - refresh or re-login |
| **403** | Forbidden | User doesn't have permission |
| **404** | Not Found | Resource doesn't exist |
| **500** | Internal Server Error | Backend issue - try again later |

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Handling Errors in Frontend
```typescript
try {
  const response = await api.post('/api/offers/create', offerData);
  // Success
} catch (error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        console.error('Validation error:', data.message);
        break;
      case 401:
        console.error('Unauthorized - redirecting to login');
        // Handle re-authentication
        break;
      case 403:
        console.error('Forbidden - insufficient permissions');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Server error - please try again');
        break;
      default:
        console.error('Unknown error:', data.message);
    }
  } else if (error.request) {
    // Request made but no response received
    console.error('Network error - check your connection');
  } else {
    // Error setting up request
    console.error('Request error:', error.message);
  }
}
```

---

## ✅ Best Practices

### 1. **Always Use Gateway URL**
```typescript
// ✅ Correct
const API_URL = 'http://localhost:3006';

// ❌ Wrong - Don't call services directly
const AUTH_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:3000';
```

### 2. **Secure Token Storage**
```typescript
// ✅ Best: httpOnly cookies (requires backend support)
// ✅ Good: sessionStorage (cleared on tab close)
sessionStorage.setItem('accessToken', token);

// ⚠️ OK: localStorage (persists across sessions)
localStorage.setItem('accessToken', token);

// ❌ Bad: Never store in regular variables or state only
let accessToken = 'token'; // Lost on refresh
```

### 3. **Implement Token Refresh**
Automatically refresh expired tokens using interceptors (see examples above).

### 4. **Handle Loading States**
```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await api.get('/api/offers/available/user123');
    setData(result.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 5. **Validate Data Before Sending**
```typescript
// Client-side validation
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!validateEmail(formData.email)) {
  setError('Invalid email format');
  return;
}
```

### 6. **Use Environment Variables**
```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3006

// In code
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

### 7. **Implement Request Cancellation**
```typescript
// React example with AbortController
useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: abortController.signal,
      });
      // Handle response
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
      }
    }
  };

  fetchData();

  return () => {
    abortController.abort(); // Cleanup on unmount
  };
}, []);
```

### 8. **Type Safety (TypeScript)**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

// Typed API call
const getUser = async (id: string): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>(`/auth/user/${id}`);
  return response.data;
};
```

### 9. **Rate Limiting & Retry Logic**
```typescript
const retryRequest = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
  }
};

// Usage
const data = await retryRequest(() => api.get('/api/offers'));
```

### 10. **CORS Headers**
The gateway should handle CORS. If you face CORS issues, contact the backend team to configure:
```javascript
// Backend should have
app.enableCors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
});
```

---

## 🔧 Testing API Calls

### Using Postman/Thunder Client

1. **Import Collection**: Use [earth-bound-api.postman_collection.json](earth-bound-api.postman_collection.json)

2. **Set Base URL**: `http://localhost:3006`

3. **Test Authentication Flow**:
   - POST `/auth/signup` → Get user created
   - POST `/auth/login` → Copy `accessToken`
   - Add to Headers: `Authorization: Bearer <accessToken>`
   - GET `/auth/me` → Should return user data

### Using cURL

```bash
# Login
curl -X POST http://localhost:3006/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get user data (with token)
curl -X GET http://localhost:3006/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📞 Support & Contact

- **Backend Team**: Contact for API issues, new endpoints, or service problems
- **Documentation**: Keep this file updated as APIs change
- **Postman Collection**: [earth-bound-api.postman_collection.json](earth-bound-api.postman_collection.json)

---

## 🚀 Quick Start Checklist

- [ ] Backend services running (Gateway on 3006, Auth on 3001, API on 3000)
- [ ] Frontend configured to call Gateway URL (`http://localhost:3006`)
- [ ] API client setup with interceptors for auth tokens
- [ ] Token storage mechanism implemented
- [ ] Error handling in place
- [ ] Environment variables configured
- [ ] Test authentication flow works
- [ ] Protected routes tested with tokens

---

**Last Updated**: January 2026  
**Version**: 1.0.0

---

Happy Coding! 🎉
