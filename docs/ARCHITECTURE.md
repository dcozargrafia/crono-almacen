# Architecture Documentation

> Crono-Almacén Technical Architecture and Patterns

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | >= 18 |
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.x (strict mode) |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 6.x |
| Authentication | JWT + Passport | - |
| Validation | class-validator | - |
| Testing | Jest | 30.x |
| Package Manager | pnpm | - |

---

## Project Structure

```
crono-almacen/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Version-controlled migrations
│   └── seed.ts             # Initial data seeding
├── src/
│   ├── auth/               # Authentication module
│   │   ├── decorators/     # @CurrentUser, @Roles
│   │   ├── dto/            # LoginDto, ChangePasswordDto
│   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   ├── strategies/     # JWT Strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts
│   ├── users/              # User management module
│   │   ├── dto/            # CreateUserDto, UpdateUserDto
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.service.spec.ts
│   ├── clients/            # Client management module
│   │   ├── dto/            # CreateClientDto, UpdateClientDto, QueryClientsDto
│   │   ├── clients.controller.ts
│   │   ├── clients.module.ts
│   │   ├── clients.service.ts
│   │   └── clients.service.spec.ts
│   ├── types/              # Shared TypeScript types
│   │   ├── index.ts        # Re-exports from Prisma + app types
│   │   └── express.d.ts    # Express type augmentation
│   ├── app.module.ts       # Root module
│   ├── main.ts             # Application entry point
│   └── prisma.service.ts   # Prisma client wrapper
├── test/                   # E2E tests
├── docs/                   # Documentation
└── package.json
```

---

## Design Patterns

### Module Pattern (NestJS Standard)

Each feature is a self-contained module:

```
module/
├── dto/                # Data Transfer Objects (validation)
├── module.module.ts    # Module definition
├── module.controller.ts # HTTP layer (routes)
├── module.service.ts   # Business logic
└── module.service.spec.ts # Unit tests
```

**Flow:**
```
Request → Controller → Service → Prisma → Database
                ↓
            Response
```

### Dependency Injection

NestJS handles DI automatically:

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {} // Injected
}
```

### Guards for Authorization

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
getData() { ... }
```

Guard execution order:
1. `JwtAuthGuard` - Validates JWT, attaches user to request
2. `RolesGuard` - Checks if user has required role

### DTOs for Validation

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

Validation is automatic via global `ValidationPipe`.

---

## Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │   API   │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │ POST /auth/login  │                   │
     │ {email, password} │                   │
     │──────────────────>│                   │
     │                   │ Find user         │
     │                   │──────────────────>│
     │                   │<──────────────────│
     │                   │                   │
     │                   │ Verify password   │
     │                   │ (bcrypt.compare)  │
     │                   │                   │
     │                   │ Generate JWT      │
     │                   │ {sub, email}      │
     │                   │                   │
     │ {user, token}     │                   │
     │<──────────────────│                   │
     │                   │                   │
     │ GET /users        │                   │
     │ Authorization:    │                   │
     │ Bearer <token>    │                   │
     │──────────────────>│                   │
     │                   │                   │
     │                   │ JwtAuthGuard      │
     │                   │ validates token   │
     │                   │                   │
     │                   │ RolesGuard        │
     │                   │ checks role       │
     │                   │                   │
     │ [users]           │                   │
     │<──────────────────│                   │
```

---

## Error Handling

### Error Keys (not messages)

API returns error keys for frontend translation:

```typescript
throw new ConflictException('EMAIL_ALREADY_EXISTS');
// NOT: throw new ConflictException('El email ya está registrado');
```

### Standard Error Response

```json
{
  "statusCode": 404,
  "message": "USER_NOT_FOUND",
  "error": "Not Found"
}
```

### Common Error Keys

| Key | HTTP Code | Meaning |
|-----|-----------|---------|
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `USER_INACTIVE` | 401 | Account deactivated |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `USER_UNAUTHORIZED` | 401 | Invalid/expired token |
| `EMAIL_ALREADY_EXISTS` | 409 | Email taken |
| `INVALID_CURRENT_PASSWORD` | 401 | Wrong current password |
| `CLIENT_NOT_FOUND` | 404 | Client doesn't exist |
| `CODE_SPORTMANIACS_ALREADY_EXISTS` | 409 | Sportmaniacs code taken |

---

## Testing Strategy

### Unit Tests

- Test services in isolation
- Mock dependencies (Prisma, JWT)
- Pattern: Arrange-Act-Assert (AAA)

```typescript
it('should create user', async () => {
  // Arrange
  mockPrisma.user.create.mockResolvedValue(mockUser);

  // Act
  const result = await service.create(dto);

  // Assert
  expect(result).not.toHaveProperty('password');
});
```

### Test Location

```
src/
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts  # Next to the file it tests
```

### Running Tests

```bash
pnpm test              # All tests
pnpm test auth.service # Specific file
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage report
```

---

## Configuration

### Environment Variables

All configuration via `.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3000
```

### Validation

Global validation pipe in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Error on unknown properties
    transform: true,           // Auto-transform types
  }),
);
```

---

## Security Considerations

- **Passwords**: bcrypt with 10 rounds, never returned in responses
- **JWT**: Signed with secret, 7-day expiration
- **Validation**: All input validated via DTOs
- **Authorization**: Role-based access control (RBAC)
- **Soft Delete**: User data preserved for audit

---

## Future Considerations

When adding new modules (Devices, Products, Rentals):

1. Follow the same module pattern
2. Add relations in Prisma schema
3. Create migrations
4. Add audit fields (`createdBy`, `updatedBy`) where needed
5. Write unit tests for services
6. Update API documentation
