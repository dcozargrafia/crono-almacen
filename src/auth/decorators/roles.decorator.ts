import { SetMetadata } from '@nestjs/common';
import { Role } from '../../types/index.js';

/**
 * DECORADOR @Roles()
 *
 * Especifica qué roles pueden acceder a un endpoint.
 * Debe usarse en conjunto con RolesGuard.
 *
 * ¿Cómo funciona?
 * - Usa SetMetadata para adjuntar los roles permitidos al método
 * - RolesGuard lee estos metadatos y verifica si el usuario tiene alguno de los roles
 *
 * @param roles - Lista de roles permitidos (puede ser uno o varios)
 *
 * @example
 * ```typescript
 * @Get('admin-only')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 * getAdminData() {
 *   return 'Solo para admins';
 * }
 *
 * @Get('any-user')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('USER', 'ADMIN')
 * getData() {
 *   return 'Para usuarios y admins';
 * }
 * ```
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
