import { SetMetadata } from '@nestjs/common';
import { Role } from '../../types/index.js';

// Specifies which roles can access an endpoint. Use with RolesGuard.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
