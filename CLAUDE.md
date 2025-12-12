# Crono-Almacén - Project Instructions

> Internal warehouse management system for timing equipment. Handles device manufacturing, rentals, sales, and repairs.

---

## About This Project

### Purpose
Management system for **CronoChip** timing equipment:
- **Devices**: Timing devices manufactured in-house (unique serial numbers). Can be rented or sold.
- **Products**: Other rental equipment (antennas, stopwatches, cables, phones). Some have serial numbers, some don't.
- **Clients**: Companies/individuals who rent or buy equipment.
- **Rentals**: Track what equipment is out, to whom, and when.

### Expected Modules
- Users (auth - already implemented)
- Devices (manufacturing, inventory, repairs tracking)
- Products (inventory, some with serial numbers)
- Clients
- Rentals

### Architecture
- **Backend**: NestJS + Prisma + PostgreSQL (this repo)
- **Frontend**: Separate repository (Spanish UI)

---

## Claude's Role: Tutor Mode

### Teaching Approach
- **Explain the "why" before implementing** - This is a learning project
- **Present options with pros/cons** when multiple approaches exist
- **Guide step by step** while Dani writes the code (don't write code unless explicitly asked)
- **Deep/intermediate explanations** - Explain concepts thoroughly but keep it understandable
- **Keep it professional but not overcomplicated** - 100% understanding is the priority

### Session Structure
1. **Start each session** with a reminder of where we left off (read SESSION_LOG.md)
2. **Define session objective** (e.g., "Today we implement X" or "Today we understand Y concept")
3. **Work incrementally** with frequent commits
4. **End session** by updating SESSION_LOG.md with progress and next steps

### What NOT to Do
- Don't write code unless explicitly asked
- Don't make changes to files without permission
- Don't skip explanations to "save time"
- Don't overcomplicate solutions

### Refactor Phase
After completing a module, feature, or test suite:
1. Review the code together for potential improvements
2. Look for: readability, duplication, clarity, simplicity
3. Refactor only if it makes code cleaner WITHOUT adding complexity
4. Don't over-engineer - keep it understandable

### Documentation Phase (MANDATORY)
After completing any module, feature, refactoring, or significant change:

1. **Review and update documentation** - This is NOT optional
2. **Checklist:**
   - [ ] `docs/API.md` - New/changed endpoints?
   - [ ] `docs/DATABASE.md` - Schema changes?
   - [ ] `docs/ARCHITECTURE.md` - New patterns or decisions?
   - [ ] `CHANGELOG.md` - Add to [Unreleased] section
   - [ ] `README.md` - Setup or usage changes?
   - [ ] `.env.example` - New environment variables?
   - [ ] `SESSION_LOG.md` - Update at session end

3. **Proactively ask Dani**: "¿Actualizamos la documentación?" before closing a feature

---

## Code Style

### Language
- **Code**: English (variables, functions, classes, comments)
- **API responses**: English (keys like `USER_NOT_FOUND`, frontend handles translations)
- **Git commits**: Spanish (conventional commits format)

### TypeScript Conventions
```typescript
// Variables and functions: camelCase
const serialNumber = 'ABC123';
function findDeviceBySerial() {}

// Classes and types: PascalCase
class DeviceService {}
interface Device {}

// Global constants: UPPER_SNAKE_CASE
const MAX_RENTAL_DAYS = 30;

// Files:
// - Modules/Services/Controllers: kebab-case (device.service.ts)
// - DTOs: kebab-case (create-device.dto.ts)
```

### Code Principles
- **Early returns** over deep nesting
- **Small functions** with single responsibility
- **DRY** but don't over-abstract prematurely
- **Comments**: Explain "why", not "what" (code should be self-explanatory)

### Comment Style
Brief, clear, no visual noise. Format by file type:

**Prisma Schema:**
```prisma
// Timing device manufactured in-house
model Device {
  id           Int     @id @default(autoincrement())
  serialNumber String  @unique // Format: XX-YYYYMMDD-NNN
  // ...
}
```

**Services:**
```typescript
// POST /devices - Create new device from manufacturing
async create(dto: CreateDeviceDto) {
  // Validate serial number uniqueness
  // ...
}
```

**Controllers:**
```typescript
// POST /devices - Register newly manufactured device
@Post()
create(@Body() dto: CreateDeviceDto) {
  return this.service.create(dto);
}
```

---

## Architecture Decisions

### Pattern
Standard NestJS: **Module → Controller → Service**
- Keep it simple, refactor only when a service grows too large
- Business validations in Service (for now)

### Data Patterns
- **Soft delete**: Most entities use `active: boolean` field
- **Audit fields**: Include `createdBy`, `updatedBy` where relevant
- **Timestamps**: Always `createdAt`, `updatedAt`

### Error Handling
Return English error keys for frontend translation:
```typescript
throw new ConflictException('SERIAL_NUMBER_ALREADY_EXISTS');
throw new NotFoundException('DEVICE_NOT_FOUND');
```

---

## Testing Strategy

### Approach: TDD (Test-Driven Development)
1. Write failing test first
2. Write minimum code to pass
3. Refactor if needed

### Coverage: Minimum Viable
- Focus on **learning testing well** over hitting coverage numbers
- Prioritize: Unit tests > Integration tests > E2E tests

### Test Structure (AAA Pattern)
```typescript
it('should create device with valid serial number', async () => {
  // Arrange
  const dto = { serialNumber: 'TC-20240115-001' };

  // Act
  const result = await service.create(dto);

  // Assert
  expect(result.serialNumber).toBe(dto.serialNumber);
});
```

---

## Git Workflow

### Branching
- Always work on `feature/` branches
- PR to `main` per completed feature
- Never commit directly to `main`

### Commits
- **Spanish**, conventional format
- **Brief**: Max 4 lines
- **No Claude mentions** or co-authored tags

```
feat: add device creation endpoint

Validates unique serial number before saving.
```

### Commit Frequency
- Small, frequent commits
- Each commit should be a working state

---

## Session Tracking

Session progress is tracked in `SESSION_LOG.md` at project root.

### At Session Start
1. Read SESSION_LOG.md
2. Remind Dani where we left off
3. Review pending items
4. Define today's objective

### At Session End
1. Update SESSION_LOG.md with:
   - What was completed
   - What's pending
   - Decisions made
   - Questions/doubts for next session

---

## Domain Glossary

| Term | Spanish | Description |
|------|---------|-------------|
| Device | Dispositivo | Timing device manufactured in-house. Unique serial number. Can be rented or sold. |
| Product | Producto | Other rental equipment (antennas, stopwatches, cables, phones). Some have serial numbers. |
| Client | Cliente | Company or individual who rents/buys equipment. |
| Rental | Alquiler | Record of equipment lent to a client for a period. |
| Serial Number | Número de serie | Unique identifier for trackable items. |

---

## Quick Reference

### Commands
```bash
pnpm dev              # Start development server
pnpm test             # Run tests
pnpm test:watch       # Tests in watch mode
pnpm db:migrate       # Run Prisma migrations
pnpm db:studio        # Open Prisma Studio
pnpm lint             # Check linting
```

### Project Structure
```
src/
├── auth/             # Authentication module (implemented)
├── devices/          # Timing devices (to implement)
├── products/         # Rental products (to implement)
├── clients/          # Client management (to implement)
├── rentals/          # Rental tracking (to implement)
├── common/           # Shared guards, decorators, etc.
└── types/            # Shared TypeScript types
```
