// Re-export Prisma types (single source of truth)
import { Role } from '@prisma/client';
export { Role };
export type { User } from '@prisma/client';

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

// Auth response
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: Role;
  };
  token: string;
}
