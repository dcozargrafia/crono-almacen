# Crono-Almacén

Internal warehouse management system for timing equipment. Handles device manufacturing, rentals, sales, and repair tracking.

## Stack

- **NestJS** - Node.js enterprise framework
- **PostgreSQL** - Relational database
- **Prisma** - Type-safe ORM with migrations
- **JWT + Passport** - Stateless authentication
- **bcrypt** - Secure password hashing
- **class-validator** - Automatic DTO validation
- **TypeScript** - Full type safety
- **Docker Compose** - PostgreSQL for development

## Features

- Complete authentication system (register/login)
- JWT tokens with configurable expiration (default: 7 days)
- Role-based authorization (USER/ADMIN)
- Custom guards (JwtAuthGuard, RolesGuard)
- Useful decorators (@CurrentUser, @Roles)
- Global automatic request validation
- Express type extensions (type-safe req.user)

## Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- Docker and Docker Compose

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo> crono-almacen
cd crono-almacen
pnpm install
```

### 2. Configure environment variables

Copy the example file and edit as needed:

```bash
cp .env.example .env
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run migrations

```bash
pnpm db:migrate
```

### 5. Start development server

```bash
pnpm dev
```

API available at: http://localhost:3000

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database models
│   └── migrations/            # Versioned migrations
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
│   │   ├── index.ts           # Shared types
│   │   └── express.d.ts       # Express type extensions
│   ├── prisma.service.ts
│   └── main.ts
├── test/
├── docker-compose.yml
└── package.json
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create new user | No |
| POST | `/auth/login` | Authenticate user | No |
| GET | `/auth/profile` | Get current user | JWT |

### Request/Response Examples

**Register**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456", "name": "John Doe"}'
```

**Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456"}'
```

**Profile (authenticated)**
```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <your-token>"
```

## Scripts

```bash
# Development
pnpm dev              # Server with hot reload
pnpm build            # Compile
pnpm start:prod       # Run compiled

# Database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Visual DB GUI
pnpm db:generate      # Regenerate Prisma Client

# Testing
pnpm test             # Unit tests
pnpm test:e2e         # End-to-end tests
pnpm test:cov         # Coverage

# Quality
pnpm lint             # ESLint
pnpm format           # Prettier
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for signing tokens | Use a long random string |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` / `production` |

### Generate secure JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## License

MIT
