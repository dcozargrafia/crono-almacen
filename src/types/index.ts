// Shared application types

// Enums
export type Role = 'USER' | 'ADMIN';

// Entities
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: Role;
}

// JWT payload (inside the token)
export interface JwtPayload {
  sub: number;
  email: string;
}

// Current user extracted from JWT (attached to request.user)
export interface CurrentUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

// Login/register response
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: Role;
  };
  token: string;
}
