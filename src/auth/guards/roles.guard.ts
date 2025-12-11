import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '../../types/index.js';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * ROLES GUARD
 *
 * Verifica si el usuario autenticado tiene alguno de los roles requeridos.
 *
 * ¿Cómo funciona?
 * 1. Lee los metadatos del decorador @Roles() usando Reflector
 * 2. Si no hay roles especificados, permite el acceso (ruta sin restricción de roles)
 * 3. Extrae el usuario de request.user (adjuntado por JwtAuthGuard)
 * 4. Verifica si el rol del usuario está en la lista de roles permitidos
 *
 * IMPORTANTE:
 * - Debe usarse DESPUÉS de JwtAuthGuard (que adjunta req.user)
 * - Si se usa solo, asume que req.user ya existe
 *
 * @example
 * ```typescript
 * @Get('admin-only')
 * @UseGuards(JwtAuthGuard, RolesGuard)  // ← Orden importante
 * @Roles('ADMIN')
 * getAdminData() {
 *   return 'Solo admins';
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Leer los roles requeridos desde los metadatos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles especificados, permitir acceso
    if (!requiredRoles) {
      return true;
    }

    // Extraer el usuario del request (adjuntado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest<Request>();

    // Verificar si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some((role) => user?.role === role);
  }
}
