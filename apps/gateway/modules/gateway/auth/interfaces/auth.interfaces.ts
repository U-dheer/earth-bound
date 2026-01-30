export interface TokenValidationResponse {
  valid: boolean;
  user?: {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
}
