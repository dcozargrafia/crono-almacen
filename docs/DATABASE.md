# Database Documentation

> Crono-Almacén Data Model and Schema

Database: **PostgreSQL 16**
ORM: **Prisma 6.x**

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                         User                            │
├─────────────────────────────────────────────────────────┤
│ id          INT (PK, auto)                              │
│ email       VARCHAR (unique)                            │
│ password    VARCHAR (bcrypt hash)                       │
│ name        VARCHAR                                     │
│ role        ENUM (USER, ADMIN)                          │
│ active      BOOLEAN (soft delete)                       │
│ createdAt   TIMESTAMP                                   │
│ updatedAt   TIMESTAMP                                   │
└─────────────────────────────────────────────────────────┘

Future entities (not yet implemented):
- Device: Timing devices manufactured in-house
- Product: Other rental equipment (antennas, cables, etc.)
- Client: Companies/individuals who rent equipment
- Rental: Track equipment loans
```

---

## Models

### User

System user with JWT authentication.

```prisma
model User {
  id       Int     @id @default(autoincrement())
  email    String  @unique
  password String  // bcrypt hash (10 rounds)
  name     String
  role     Role    @default(USER)
  active   Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| email | String | Unique | Login credential |
| password | String | - | bcrypt hash (10 rounds) |
| name | String | - | Display name |
| role | Role | Default: USER | Authorization level |
| active | Boolean | Default: true | Soft delete flag |
| createdAt | DateTime | Auto | Record creation time |
| updatedAt | DateTime | Auto | Last update time |

---

## Design Decisions

### Soft Delete

We use `active: boolean` instead of hard delete for:
- **Users**: Maintain audit trail, allow reactivation

Future entities will also use soft delete where appropriate.

### Password Storage

- Algorithm: bcrypt
- Rounds: 10
- Never returned in API responses

### Table Naming

- Prisma models: PascalCase (`User`)
- Database tables: snake_case plural (`users`)
- Achieved via `@@map("tablename")`

### Timestamps

All entities include:
- `createdAt`: Set automatically on creation
- `updatedAt`: Updated automatically on modification

Future entities may also include:
- `createdBy`: User ID who created the record
- `updatedBy`: User ID who last modified

---

## Migrations

Migrations are stored in `prisma/migrations/` and tracked in version control.

### Commands

```bash
# Create new migration
pnpm db:migrate --name <migration-name>

# Apply migrations
pnpm db:migrate

# Reset database (dev only)
pnpm prisma migrate reset

# View database
pnpm db:studio
```

### Current Migrations

| Migration | Description |
|-----------|-------------|
| `20251211191813_rename_usuario_to_user` | Initial schema with User model |

---

## Seed Data

Initial data is created via `prisma/seed.ts`:

```bash
pnpm db:seed
```

### Default Users

| Email | Password | Role | Configurable via |
|-------|----------|------|------------------|
| admin@crono.com | admin123 | ADMIN | `SEED_ADMIN_*` env vars |
| user@crono.com | user123 | USER | `SEED_USER_*` env vars |

---

## Future Schema (Planned)

These entities are planned but not yet implemented:

### Device
Timing devices manufactured in-house.
- Unique serial number
- Can be rented or sold
- Track repairs and components

### Product
Other rental equipment.
- Antennas, stopwatches, cables, phones
- Some have serial numbers, some don't

### Client
Companies or individuals.
- Contact information
- Rental history

### Rental
Equipment loans.
- What equipment, to whom, when
- Status tracking
