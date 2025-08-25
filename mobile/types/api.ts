export interface ApiError {
  error: string;
  message?: string;
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  UNAUTHORIZED = 401, // Token expired
  FORBIDDEN = 403, // Wrong role
  CONFLICT = 409, // Username/email exists
}
