import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { CurrentUser as CurrentUserType } from '../../types/index.js';

/**
 * DECORADOR @CurrentUser()
 *
 * Extrae el usuario autenticado del request de forma limpia.
 *
 * ¿Cómo funciona?
 * - createParamDecorator crea un decorador de parámetro
 * - Extrae req.user que fue adjuntado por JwtAuthGuard
 * - Permite acceder al usuario sin usar @Req() req
 *
 * IMPORTANTE:
 * - Solo funciona en rutas protegidas con JwtAuthGuard
 * - Si se usa sin guard, user será undefined
 *
 * Ventajas:
 * - Código más limpio y legible
 * - Type-safety automático
 * - Expresivo: se ve claramente que necesitas un usuario autenticado
 *
 * @example
 * ```typescript
 * // Antes
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@Req() req: Request) {
 *   return req.user;
 * }
 *
 * // Después
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUser) {
 *   return user;
 * }
 *
 * // También puedes extraer solo una propiedad
 * @Get('my-id')
 * @UseGuards(JwtAuthGuard)
 * getMyId(@CurrentUser('id') userId: number) {
 *   return userId;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Si se especifica una propiedad, retornar solo esa propiedad
    return data ? user?.[data] : user;
  },
);
