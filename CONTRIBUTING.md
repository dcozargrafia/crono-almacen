# Contributing Guide

> Guidelines for contributing to Crono-Almacén

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- Docker and Docker Compose
- Git

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd crono-almacen

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start database
docker-compose up -d

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Start development server
pnpm dev
```

---

## Code Style

### Language

| Context | Language |
|---------|----------|
| Code (variables, functions, classes) | English |
| Comments | English |
| Git commits | Spanish |
| API error keys | English |

### TypeScript Conventions

```typescript
// Variables and functions: camelCase
const userName = 'Juan';
function getUserById() {}

// Classes, interfaces, types: PascalCase
class UserService {}
interface User {}
type Role = 'USER' | 'ADMIN';

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Files: kebab-case
// user.service.ts, create-user.dto.ts
```

### Code Principles

- **Early returns** over deep nesting
- **Small functions** with single responsibility
- **DRY** but don't over-abstract
- **Comments**: Explain "why", not "what"

```typescript
// Good: early return
function getUser(id: number) {
  if (!id) return null;
  if (id < 0) return null;
  return this.prisma.user.findUnique({ where: { id } });
}

// Bad: deep nesting
function getUser(id: number) {
  if (id) {
    if (id > 0) {
      return this.prisma.user.findUnique({ where: { id } });
    }
  }
  return null;
}
```

### Comment Style

Brief, clear, no visual noise.

```typescript
// Good: explains why
// ADMIN resets another user's password (no current password required)
export class ResetPasswordDto { ... }

// Bad: explains what (obvious from code)
// This class is a DTO for resetting password
export class ResetPasswordDto { ... }
```

---

## Git Workflow

### Branches

```
main                 # Stable code
feature/<name>       # New features
fix/<name>           # Bug fixes
```

### Commit Messages

Format: `type: brief description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Rules:**
- Spanish language
- Max 72 characters first line
- Brief (max 4 lines total)
- No Claude/AI mentions

**Examples:**
```
feat: añadir endpoint para resetear contraseña

fix: corregir validación de email duplicado

test: añadir tests unitarios para UsersService

docs: actualizar documentación de API
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with frequent commits
3. Write/update tests
4. Ensure all tests pass: `pnpm test`
5. Ensure build works: `pnpm build`
6. Push branch and create PR
7. Merge to `main` after review

---

## Testing

### Philosophy

- Write tests for all service methods
- Use mocks for external dependencies
- Follow AAA pattern (Arrange-Act-Assert)

### Structure

```typescript
describe('UsersService', () => {
  describe('create', () => {
    it('should create user and return without password', async () => {
      // Arrange
      const dto = { ... };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email exists', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });
  });
});
```

### Commands

```bash
pnpm test              # Run all tests
pnpm test <pattern>    # Run specific tests
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage report
```

---

## Database Changes

### Adding a New Field

1. Update `prisma/schema.prisma`
2. Create migration: `pnpm db:migrate --name <description>`
3. Update DTOs if needed
4. Update tests
5. Update documentation

### Adding a New Model

1. Add model to `prisma/schema.prisma`
2. Create migration
3. Generate module: `npx nest g resource <name> --no-spec`
4. Implement service methods
5. Add guards/decorators to controller
6. Write tests
7. Update `docs/API.md` and `docs/DATABASE.md`

---

## Project Structure

When adding new modules, follow this structure:

```
src/<module>/
├── dto/
│   ├── create-<module>.dto.ts
│   └── update-<module>.dto.ts
├── <module>.controller.ts
├── <module>.module.ts
├── <module>.service.ts
└── <module>.service.spec.ts
```

---

## Documentation

Update documentation when:

- Adding new endpoints → `docs/API.md`
- Changing database schema → `docs/DATABASE.md`
- Changing architecture/patterns → `docs/ARCHITECTURE.md`
- Releasing a version → `CHANGELOG.md`

---

## Questions?

If something is unclear, check the documentation in `/docs` or ask in the project discussions.
