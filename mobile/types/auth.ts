export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  isVerified: boolean;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (loginData: LoginRequest) => Promise<AuthResponse>;
  register: (
    registerData: RegisterRequest
  ) => Promise<{ message: string; email: string }>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}
