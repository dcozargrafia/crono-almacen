# NestJS Auth Starter

API REST con autenticación JWT y autorización basada en roles, lista para iniciar nuevos proyectos backend.

## Stack

- **NestJS** - Framework Node.js enterprise
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM type-safe con migraciones
- **JWT + Passport** - Autenticación stateless
- **bcrypt** - Hash seguro de contraseñas
- **class-validator** - Validación automática de DTOs
- **TypeScript** - Type safety completo
- **Docker Compose** - PostgreSQL para desarrollo

## Características

- Sistema de autenticación completo (register/login)
- JWT tokens con expiración configurable (default: 7 días)
- Sistema de roles (USER/ADMIN) extensible
- Guards personalizados (JwtAuthGuard, RolesGuard)
- Decoradores útiles (@CurrentUser, @Roles)
- Validación global automática de requests
- Extensión de tipos de Express (type-safe req.user)
- Prisma Studio para gestión visual de BD
- Hot reload en desarrollo

## Prerrequisitos

- Node.js >= 18
- npm, yarn o pnpm
- Docker y Docker Compose

## Quick Start

### 1. Clonar e instalar

```bash
git clone <tu-repo> mi-api
cd mi-api
npm install
```

### 2. Configurar variables de entorno

Crea `.env` en la raíz:

```env
DATABASE_URL="postgresql://cronochip:cronochip_dev_password@localhost:5432/cronochip_db"
JWT_SECRET="cambia-esto-por-un-secret-muy-seguro-en-produccion"
PORT=3000
```

### 3. Levantar PostgreSQL

```bash
docker-compose up -d
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
```

### 5. Iniciar en modo desarrollo

```bash
npm run dev
```

API disponible en: http://localhost:3000

## Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   └── migrations/            # Migraciones versionadas
├── src/
│   ├── auth/
│   │   ├── decorators/        # @CurrentUser, @Roles
│   │   ├── dto/               # LoginDto, RegisterDto
│   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   ├── strategies/        # JWT Strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── types/
│   │   ├── index.ts           # Tipos compartidos
│   │   └── express.d.ts       # Extensión de tipos Express
│   ├── prisma.service.ts
│   └── main.ts
├── test/
├── docker-compose.yml
└── package.json
```

## Endpoints

### Autenticación

```
POST   /auth/register
Body: { email, password, nombre }
Response: { user, token }

POST   /auth/login
Body: { email, password }
Response: { user, token }

GET    /auth/profile
Headers: Authorization: Bearer <token>
Response: { id, email, nombre, role }
```

### Ejemplos con autorización

```
GET    /auth/admin-only      → Requiere rol ADMIN
GET    /auth/user-or-admin   → Requiere rol USER o ADMIN
```

## Uso de Guards y Decoradores

### Proteger un endpoint

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from './types/index.js';

@Controller('productos')
export class ProductosController {
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: CurrentUserType) {
    return { message: `Usuario ${user.nombre} consultando productos` };
  }
}
```

### Restringir por rol

```typescript
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getDashboard() {
    return { message: 'Solo administradores' };
  }
}
```

## Scripts

```bash
# Desarrollo
npm run dev              # Servidor con hot reload
npm run build            # Compilar
npm run start:prod       # Ejecutar compilado

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:studio        # GUI visual de BD
npm run db:generate      # Regenerar Prisma Client

# Testing
npm test                 # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Coverage

# Calidad
npm run lint             # ESLint
npm run format           # Prettier
```

## Personalización

### Agregar un nuevo rol

1. Actualizar tipo en `src/types/index.ts`:
```typescript
export type Role = 'USER' | 'ADMIN' | 'MODERATOR';
```

2. Actualizar schema de Prisma:
```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}
```

3. Ejecutar migración:
```bash
npm run db:migrate
```

### Agregar un nuevo modelo

1. Editar `prisma/schema.prisma`
2. Ejecutar `npm run db:migrate`
3. Generar módulo: `npx nest g resource productos`

## Producción

### Variables de entorno

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="usa-un-generador-de-secrets-aleatorios-muy-largo"
PORT=3000
NODE_ENV=production
```

### Generar secret seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Licencia

MIT
