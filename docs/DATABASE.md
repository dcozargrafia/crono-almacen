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

┌─────────────────────┐       ┌─────────────────────┐
│       Product       │       │     ProductUnit     │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ name                │       │ type                │
│ type                │       │ serialNumber (uniq) │
│ description         │       │ notes               │
│ notes               │       │ status              │
│ totalQuantity       │       │ active              │
│ availableQuantity   │       │ createdAt           │
│ rentedQuantity      │       │ updatedAt           │
│ inRepairQuantity    │       └─────────────────────┘
│ active              │                ▲
│ createdAt           │                │ 1:N
│ updatedAt           │                │
└─────────────────────┘       ┌────────┴────────────┐
        ▲                     │  RentalProductUnit  │
        │ 1:N                 ├─────────────────────┤
        │                     │ id (PK)             │
┌───────┴─────────────┐       │ rentalId (FK)       │
│    RentalProduct    │       │ productUnitId (FK)  │
├─────────────────────┤       └─────────────────────┘
│ id (PK)             │                ▲
│ rentalId (FK)       │                │
│ productId (FK)      │      ┌─────────┴───────────┐
│ quantity            │      │       Rental        │
└─────────────────────┘      ├─────────────────────┤
                             │ id (PK)             │
┌─────────────────────┐      │ clientId (FK)       │───> Client
│    RentalDevice     │      │ startDate           │
├─────────────────────┤      │ expectedEndDate     │
│ id (PK)             │      │ actualEndDate       │
│ rentalId (FK)       │<─────│ status              │
│ deviceId (FK)       │      │ notes               │
└─────────────────────┘      │ createdAt           │
        │                    │ updatedAt           │
        │ N:1                └─────────────────────┘
        ▼
     Device
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

### ProductType
Types of rental equipment.

| Value | Description |
|-------|-------------|
| ANTENNA | Antennas for timing |
| STOPWATCH | Manual stopwatches |
| PHONE | Mobile phones |
| MIFI | MiFi devices |
| CABLE | Cables |
| OTHER | Other equipment |

### ProductUnitStatus
Status for serialized product units.

| Value | Description |
|-------|-------------|
| AVAILABLE | Ready to rent |
| RENTED | Currently rented |
| IN_REPAIR | Under maintenance |
| RETIRED | No longer in use |

### RentalStatus
Rental transaction status.

| Value | Description |
|-------|-------------|
| ACTIVE | Rental in progress |
| RETURNED | All items returned |
| CANCELLED | Rental cancelled |

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

### Product

Quantity-based rental equipment (tracked by quantity, not individual serial numbers).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| name | String | Required | Product name |
| type | ProductType | Required | Equipment type |
| description | String | Optional | Product description |
| notes | String | Optional | Additional notes |
| totalQuantity | Int | Default: 0 | Total units owned |
| availableQuantity | Int | Default: 0 | Units available for rent |
| rentedQuantity | Int | Default: 0 | Units currently rented |
| inRepairQuantity | Int | Default: 0 | Units under repair |
| active | Boolean | Default: true | Soft delete flag |
| createdAt | DateTime | Auto | Record creation time |
| updatedAt | DateTime | Auto | Last update time |

### ProductUnit

Serialized rental equipment (tracked individually by serial number).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| type | ProductType | Required | Equipment type |
| serialNumber | String | Unique, required | Unique serial number |
| notes | String | Optional | Additional notes |
| status | ProductUnitStatus | Default: AVAILABLE | Current status |
| active | Boolean | Default: true | Soft delete flag |
| createdAt | DateTime | Auto | Record creation time |
| updatedAt | DateTime | Auto | Last update time |

### Rental

Equipment rental transaction.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| clientId | Int | FK, required | Client receiving the rental |
| startDate | DateTime | Required | Rental start date |
| expectedEndDate | DateTime | Required | Expected return date |
| actualEndDate | DateTime | Optional | Actual return date |
| status | RentalStatus | Default: ACTIVE | Rental status |
| notes | String | Optional | Additional notes |
| createdAt | DateTime | Auto | Record creation time |
| updatedAt | DateTime | Auto | Last update time |

**Relations:**
- `client`: Client who receives the rental
- `devices`: RentalDevice[] - Devices in this rental
- `products`: RentalProduct[] - Products (by quantity) in this rental
- `productUnits`: RentalProductUnit[] - Product units (by serial) in this rental

**Indexes:**
- `clientId` - Filter by client
- `status` - Filter by rental status
- `startDate` - Filter/sort by date

### RentalDevice

Join table for devices in a rental.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| rentalId | Int | FK, required | Parent rental |
| deviceId | Int | FK, required | Device being rented |

**Constraints:**
- Unique index on `(rentalId, deviceId)` - Device can only appear once per rental
- Cascade delete when rental is deleted

### RentalProduct

Join table for products (quantity-based) in a rental.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| rentalId | Int | FK, required | Parent rental |
| productId | Int | FK, required | Product being rented |
| quantity | Int | Required | Quantity rented |

**Constraints:**
- Unique index on `(rentalId, productId)` - Product can only appear once per rental
- Cascade delete when rental is deleted

### RentalProductUnit

Join table for product units (serial-based) in a rental.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Int | PK, auto-increment | Unique identifier |
| rentalId | Int | FK, required | Parent rental |
| productUnitId | Int | FK, required | Product unit being rented |

**Constraints:**
- Unique index on `(rentalId, productUnitId)` - Unit can only appear once per rental
- Cascade delete when rental is deleted

---

## Design Decisions

### Soft Delete

We use `active: boolean` instead of hard delete for:
- **Users**: Maintain audit trail, allow reactivation
- **Clients**: Preserve rental history
- **Products**: Preserve inventory history
- **ProductUnits**: Preserve rental/serial tracking history

### Two Identification Codes for Devices

- `manufacturingCode`: Assigned internally when manufacturing starts
- `serialNumber`: Assigned when device is sold (format may vary)

### Nullable Model-Specific Fields

Device has many optional fields because different models (TSONE, TS2, CLB) have different components. Using nullable fields in a single table instead of separate tables for simplicity.

### Two-Table Approach for Products

Products are split into two independent tables:
- **Product**: For quantity-tracked items (cables, antennas) where we only care about counts
- **ProductUnit**: For serialized items (stopwatches, phones) where each unit is tracked individually

This separation provides:
- Cleaner inventory management (no complex nullable fields)
- Better serial number tracking for valuable equipment
- Simpler rental integration (rentals can reference quantities or specific units)

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
| `20251216171645_add_products_and_product_units` | Add Product and ProductUnit models |
| `20251216183543_add_rentals` | Add Rental and join tables |

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

## Future Enhancements

### Rentals Module

| Feature | Description | Impact |
|---------|-------------|--------|
| Pending rentals endpoint | `GET /rentals/pending` - Rentals past expectedEndDate but still ACTIVE | New endpoint, useful for frontend alerts |
| Partial returns | Return only some items from a rental | May require RentalItemStatus or split rental logic |
| Rental extension | Extend expectedEndDate on active rentals | Simple PATCH, could add extension history |
