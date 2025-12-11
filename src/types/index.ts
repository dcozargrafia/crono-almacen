/**
 * Tipos compartidos de la aplicación
 * (Consolidado desde packages/types para proyecto standalone)
 */

// ============================================
// ENUMS
// ============================================

export type Role = 'USER' | 'ADMIN';

// ============================================
// ENTITIES
// ============================================

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  role: Role;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AUTH DTOs
// ============================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  role: Role;
}

// JWT Payload (lo que va dentro del token)
export interface JwtPayload {
  sub: number;
  email: string;
}

// Usuario actual extraído del JWT (adjuntado a request.user)
export interface CurrentUser {
  id: number;
  email: string;
  nombre: string;
  role: Role;
}

// Respuesta de login/register
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    nombre: string;
    role: Role;
  };
  token: string;
}
