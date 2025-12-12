# Database Documentation

> Crono-Almacén Data Model and Schema

Database: **PostgreSQL 16**
ORM: **Prisma 6.x**

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│        User         │
├─────────────────────┤
│ id (PK)             │
│ email (unique)      │
│ password            │
│ name                │
│ role                │
│ active              │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│       Client        │       │       Device        │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │──────<│ id (PK)             │
│ name                │   1:N │ model               │
│ codeSportmaniacs    │       │ manufacturingCode   │
│ email               │       │ manufacturingStatus │
│ active              │       │ operationalStatus   │
│ createdAt           │       │ availableForRental  │
│ updatedAt           │       │ ownerId (FK)        │
└─────────────────────┘       │ serialNumber        │
                              │ portCount           │
                              │ frequencyRegion     │
                              │ manufacturingDate   │
                              │ notes               │
                              │ ... (model fields)  │
                              │ createdAt           │
                              │ updatedAt           │
                              └─────────────────────┘

Future entities (not yet implemented):
- Product: Other rental equipment (antennas, cables, etc.)
- Rental: Track equipment loans
```

---

## Enums

### Role
User authorization levels.

| Value | Description |
|-------|-------------|
| USER | Regular user |
| ADMIN | Administrator |

### DeviceModel
Types of timing devices manufactured.

| Value | Description |
|-------|-------------|
| TSONE | Basic timing device |
| TS2 | Second generation |
| TS2_PLUS | TS2+ enhanced version |
| CLB | CLB device type |

### ManufacturingStatus
Device manufacturing progress.

| Value | Description |
|-------|-------------|
| PENDING | Not started |
| IN_PROGRESS | Being manufactured |
| PHASE1_COMPLETED | First phase done |
| AWAITING_QA | Waiting for quality check |
| COMPLETED | Finished |
| OUT_OF_STOCK | Missing parts |

### OperationalStatus
Device operational state.

| Value | Description |
|-------|-------------|
| IN_MANUFACTURING | Still being built |
| AVAILABLE | Ready to rent/sell |
| RENTED | Currently rented |
| SOLD | Sold to client |
| IN_REPAIR | Under maintenance |
| RETIRED | No longer in use |

### FrequencyRegion
Regional frequency configuration.

| Value | Description |
|-------|-------------|
| EU | European Union |
| FCC | US (FCC regulations) |
| GX1 | GX1 region |
| GX2 | GX2 region |

---

## Models

### User

System user with JWT authentication.

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

### Client

Client that owns or rents devices (companies/event organizers).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| name | String | - | Client name |
| codeSportmaniacs | String | Unique, optional | ID in Sportmaniacs platform |
| email | String | Optional | Contact email |
| active | Boolean | Default: true | Soft delete flag |
| createdAt | DateTime | Auto | Record creation time |
| updatedAt | DateTime | Auto | Last update time |
| devices | Device[] | Relation | Devices owned by client |

### Device

Timing device manufactured in-house.

**Core fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| model | DeviceModel | Required | Device type |
| manufacturingCode | String | Unique | Assigned at start of manufacturing |
| manufacturingStatus | ManufacturingStatus | Default: PENDING | Manufacturing progress |
| operationalStatus | OperationalStatus | Default: IN_MANUFACTURING | Operational state |
| availableForRental | Boolean | Default: false | Can be rented out |
| ownerId | Int | FK, optional | Client who owns the device |
| serialNumber | String | Unique, optional | Assigned when sold |
| portCount | Int | Optional | Number of ports (TS2, TS2+) |
| frequencyRegion | FrequencyRegion | Optional | Regional configuration |
| manufacturingDate | DateTime | Optional | When manufacturing completed |
| notes | String | Optional | General observations |
| createdAt | DateTime | Auto | Record creation time |
| updatedAt | DateTime | Auto | Last update time |

**TSONE/TS2/TS2+ specific fields (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| reader1SerialNumber | String | First reader serial |
| reader2SerialNumber | String | Second reader serial |
| cpuSerialNumber | String | CPU serial number |
| batterySerialNumber | String | Battery serial |
| tsPowerModel | String | Power model |
| cpuFirmware | String | CPU firmware version |
| gx1ReadersRegion | String | GX1 readers region |
| hasGSM | Boolean | Has GSM connectivity |
| hasGUN | Boolean | Has GUN feature |

**CLB specific fields (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| bluetoothAdapter | String | Bluetooth adapter info |
| coreVersion | String | Core version |
| heatsinks | String | Heatsink configuration |
| picVersion | String | PIC version |

**Indexes:**
- `model` - Filter by device type
- `manufacturingStatus` - Filter by manufacturing state
- `operationalStatus` - Filter by operational state
- `availableForRental` - Filter rentable devices

---

## Design Decisions

### Soft Delete

We use `active: boolean` instead of hard delete for:
- **Users**: Maintain audit trail, allow reactivation
- **Clients**: Preserve rental history

### Two Identification Codes for Devices

- `manufacturingCode`: Assigned internally when manufacturing starts
- `serialNumber`: Assigned when device is sold (format may vary)

### Nullable Model-Specific Fields

Device has many optional fields because different models (TSONE, TS2, CLB) have different components. Using nullable fields in a single table instead of separate tables for simplicity.

### Password Storage

- Algorithm: bcrypt
- Rounds: 10
- Never returned in API responses

### Table Naming

- Prisma models: PascalCase (`User`, `Device`)
- Database tables: snake_case plural (`users`, `devices`)
- Achieved via `@@map("tablename")`

### Timestamps

All entities include:
- `createdAt`: Set automatically on creation
- `updatedAt`: Updated automatically on modification

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
| `20251212200124_add_client_and_device` | Add Client and Device models |

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

### Default Clients

| Name | Description |
|------|-------------|
| Cronochip | Internal client (owns devices for rental) |

---

## Future Schema (Planned)

### Product
Other rental equipment.
- Antennas, stopwatches, cables, phones
- Some have serial numbers, some don't

### Rental
Equipment loans.
- What equipment, to whom, when
- Status tracking
