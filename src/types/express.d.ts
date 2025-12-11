/**
 * AUGMENTACIÓN DE TIPOS DE EXPRESS
 *
 * Este archivo extiende los tipos nativos de Express para agregar propiedades
 * personalizadas al objeto Request.
 *
 * ¿Por qué hacemos esto?
 * - Cuando usamos Guards de autenticación (JwtAuthGuard), NestJS adjunta
 *   el usuario al objeto `request.user`
 * - Por defecto, TypeScript NO sabe que `request.user` existe
 * - Al extender el tipo, obtenemos autocompletado y type-safety
 *
 * ¿Cómo funciona?
 * - TypeScript permite "augmentar" módulos externos usando `declare module`
 * - Esto NO modifica Express, solo añade información de tipos
 * - El '?' hace que `user` sea opcional porque solo existe en rutas protegidas
 *
 * Documentación:
 * - Module Augmentation: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 * - Express Types: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express
 */

import { CurrentUser } from './index.js';

declare module 'express' {
  export interface Request {
    /**
     * Usuario autenticado extraído del JWT token.
     *
     * Solo está disponible en rutas protegidas con @UseGuards(JwtAuthGuard).
     * Es undefined en rutas públicas.
     *
     * @example
     * ```typescript
     * @Get('profile')
     * @UseGuards(JwtAuthGuard)
     * getProfile(@Req() req: Request) {
     *   return req.user; // TypeScript sabe que es CurrentUser
     * }
     * ```
     */
    user?: CurrentUser;
  }
}
