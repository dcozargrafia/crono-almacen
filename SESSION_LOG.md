# Session Log - Crono-Almacén

> Track of learning sessions and project progress

---

## Session 1 - 2024-12-11

### Objective
Project setup and define working methodology with Claude as tutor.

### Completed
- [x] Explored existing project structure (NestJS auth starter)
- [x] Defined project purpose: timing equipment warehouse management
- [x] Clarified domain concepts (Device vs Product)
- [x] Created CLAUDE.md with project instructions
- [x] Created SESSION_LOG.md for session tracking
- [x] Defined coding conventions (English code, Spanish commits)
- [x] Agreed on TDD approach for testing
- [x] Agreed on feature branch workflow

### Decisions Made
- **API responses in English**: Frontend will handle translations
- **Soft delete**: For most entities
- **Audit fields**: Include createdBy/updatedBy
- **Architecture**: Keep standard NestJS pattern, don't overcomplicate
- **Testing**: TDD approach, focus on learning well over coverage numbers

### Current State
- Auth module implemented (register, login, JWT, roles)
- Single entity: Usuario (User)
- No other modules implemented yet

### Pending / Next Session
- Completed in Session 2

---

## Session 2 - 2024-12-12

### Objective
Implement user management system and learn unit testing.

### Completed
- [x] Translated codebase to English (Usuario → User, nombre → name, etc.)
- [x] Removed public registration endpoint
- [x] Added PATCH /auth/password (change own password)
- [x] Created users module with full CRUD for ADMIN
- [x] Created seed script with ADMIN and USER
- [x] Configured Postman collection with auto-token saving
- [x] Learned unit testing with Jest and mocking
- [x] Wrote 8 tests for AuthService (login + changePassword)
- [x] Refactored tests to reduce duplication (createMockUser helper)
- [x] Added "Refactor Phase" to CLAUDE.md workflow
- [x] Updated README.md
- [x] Fixed types/index.ts to re-export from Prisma (single source of truth)

### Decisions Made
- **No public registration**: Only ADMIN can create users
- **User can change own password**: Via PATCH /auth/password (requires current password)
- **ADMIN can reset any password**: Via PATCH /users/:id/password (no current password needed)
- **Types from Prisma**: Re-export Role and User from @prisma/client in types/index.ts
- **Seed with env vars**: SEED_ADMIN_EMAIL, SEED_USER_EMAIL, etc.
- **Refactor after completing**: Review code for improvements after each module/feature

### API Endpoints (Current)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /auth/login | Authenticate | Public |
| GET | /auth/profile | Get my profile | Authenticated |
| PATCH | /auth/password | Change my password | Authenticated |
| POST | /users | Create user | ADMIN |
| GET | /users | List users | ADMIN |
| GET | /users/:id | Get user | ADMIN |
| PATCH | /users/:id | Update user | ADMIN |
| PATCH | /users/:id/password | Reset password | ADMIN |
| DELETE | /users/:id | Soft delete user | ADMIN |

### Testing Concepts Learned
- `describe` / `it` structure
- `beforeEach` for setup
- Mocking with `jest.fn()`
- `mockResolvedValue` (async) vs `mockReturnValue` (sync)
- `jest.clearAllMocks()` between tests
- AAA pattern (Arrange-Act-Assert)
- `expect().toEqual()`, `expect().rejects.toThrow()`, `toHaveBeenCalledWith()`

### Pending / Next Session
- [x] Write tests for UsersService (completed)
- [x] Design data model for Devices (completed - added Client and Device models)
- [ ] Implement Clients module
- [ ] Implement Devices module

### Questions / Doubts (resolved)
- Device serial number format: String, no fixed format (varies by model)
- Device states: Defined as OperationalStatus enum (IN_MANUFACTURING, AVAILABLE, RENTED, SOLD, IN_REPAIR, RETIRED)

---

## Session 3 - 2024-12-13/14

### Objective
Implement Clients module with full CRUD using TDD.

### Completed
- [x] Learned TDD methodology (Red-Green-Refactor cycle)
- [x] Created CreateClientDto with validations
- [x] Implemented ClientsService with TDD (15 tests total):
  - create() - with codeSportmaniacs duplicate validation
  - findAll() - with optional active filter (true/false/all)
  - findOne() - with NotFoundException
  - findByCodeSportmaniacs() - new endpoint
  - update() - with duplicate validation
  - remove() - soft delete
  - reactivate() - restore soft-deleted client
- [x] Implemented ClientsController with all endpoints
- [x] Added pagination to findAll() endpoint
  - Created QueryClientsDto for query params
  - Response format: { data, meta: { total, page, limit, totalPages } }
- [x] Updated API documentation and CHANGELOG

### Decisions Made
- **findAll() filter**: Query param `?active=true|false|all` instead of always returning active only
- **Endpoint for reactivate**: Separate `PATCH /clients/:id/reactivate` instead of adding `active` to UpdateDto
- **Access control**: All authenticated users can manage clients (no ADMIN restriction for now)
- **TDD pragmatic approach**: Define DTOs first since schema is known, focus TDD on service logic

### TDD Concepts Learned
- Red-Green-Refactor cycle
- Write test FIRST, then minimal code to pass
- `mockResolvedValueOnce()` for sequential mock returns
- Tests should be decoupled from implementation (use object literals, not DTO types)
- ZOMBIES technique for identifying test cases

### API Endpoints (Clients)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /clients | Create client | Authenticated |
| GET | /clients | List clients (filter: ?active=true/false/all) | Authenticated |
| GET | /clients/:id | Get client | Authenticated |
| GET | /clients/sportmaniacs/:code | Find by Sportmaniacs code | Authenticated |
| PATCH | /clients/:id | Update client | Authenticated |
| PATCH | /clients/:id/reactivate | Reactivate client | Authenticated |
| DELETE | /clients/:id | Soft delete client | Authenticated |

### Pending / Next Session
- Completed in Session 4

### Questions / Doubts
- (none)

---

## Session 4 - 2024-12-15

### Objective
Implement Devices module with full CRUD using TDD.

### Completed
- [x] Created DTOs for Devices module
  - CreateDeviceDto, UpdateDeviceDto, QueryDevicesDto
  - UpdateManufactoringStatusDto, UpdateOperationalStatusDto, AssignOwnerDto
- [x] Implemented DevicesService with TDD (29 tests total):
  - create() - with manufactoringCode duplicate validation
  - findAll() - with pagination and filters (model, status, rental availability, owner)
  - findOne() - with NotFoundException
  - update() - with duplicate manufactoringCode validation
  - remove() - sets operationalStatus to RETIRED
  - updateManufactoringStatus() - update manufacturing status
  - updateOperationalStatus() - update operational status
  - assignOwner() - assign/remove device owner (validates client exists)
  - findByReaderSerial() - find by reader1 or reader2 serial
  - findByCpuSerial() - find by CPU serial
  - findByBatterySerial() - find by battery serial
- [x] Implemented DevicesController with all endpoints
- [x] Updated API documentation (docs/API.md)
- [x] Updated CHANGELOG.md

### Decisions Made
- **Spelling**: Using `manufactoring` (with 'o') as defined in schema
- **Pagination**: Using `pageSize` instead of `limit` (consistent with Clients)
- **Soft delete for devices**: Sets operationalStatus to RETIRED (not active flag)
- **Reader search**: Single endpoint searches both reader1 and reader2

### API Endpoints (Devices)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /devices | Create device | Authenticated |
| GET | /devices | List devices (with pagination and filters) | Authenticated |
| GET | /devices/:id | Get device | Authenticated |
| GET | /devices/reader/:serial | Find by reader serial | Authenticated |
| GET | /devices/cpu/:serial | Find by CPU serial | Authenticated |
| GET | /devices/battery/:serial | Find by battery serial | Authenticated |
| PATCH | /devices/:id | Update device | Authenticated |
| PATCH | /devices/:id/manufactoring-status | Update manufacturing status | Authenticated |
| PATCH | /devices/:id/operational-status | Update operational status | Authenticated |
| PATCH | /devices/:id/owner | Assign/remove owner | Authenticated |
| DELETE | /devices/:id | Retire device | Authenticated |

### Test Summary
- Total tests: 68 (all passing)
  - AuthService: 8 tests
  - UsersService: 13 tests
  - ClientsService: 15 tests
  - DevicesService: 29 tests
  - AppController: 3 tests

### Pending / Next Session
- Completed in Session 5

### Questions / Doubts
- (none)

---

## Session 5 - 2024-12-16

### Objective
Implement Products module for rental equipment (non-device items).

### Completed
- [x] Designed two-table architecture for products:
  - Product: quantity-tracked items (cables, antennas)
  - ProductUnit: serial-tracked items (stopwatches, phones, MiFi)
- [x] Updated Prisma schema with Product and ProductUnit models
- [x] Created ProductType and ProductUnitStatus enums
- [x] Generated migration `20251216171645_add_products_and_product_units`
- [x] Generated NestJS modules for both products and product-units
- [x] Implemented ProductsService with TDD (15 tests):
  - create() - initializes quantities
  - findAll() - with pagination and filters (type, active)
  - findOne() - with NotFoundException
  - update() - standard update
  - remove() - soft delete (active: false)
  - reactivate() - restore soft-deleted product
- [x] Implemented ProductUnitsService with TDD (20 tests):
  - create() - with serialNumber duplicate validation
  - findAll() - with pagination and filters (type, status, active)
  - findOne() - with NotFoundException
  - findBySerial() - find by serial number
  - update() - with serialNumber duplicate validation
  - updateStatus() - update unit status
  - remove() - soft delete
  - reactivate() - restore soft-deleted unit
- [x] Implemented ProductsController with all endpoints
- [x] Implemented ProductUnitsController with all endpoints
- [x] Added quantity validation in Product update (totalQuantity >= used)
- [x] Implemented inventory management endpoints (TDD - 17 additional tests):
  - addStock() - Add units to inventory
  - retire() - Remove units from inventory
  - sendToRepair() - Move to repair
  - markRepaired() - Return from repair
- [x] Created QuantityDto for inventory operations
- [x] Documented architectural decisions (ADR-001, ADR-002)
- [x] Updated documentation (API.md, DATABASE.md, ARCHITECTURE.md, CHANGELOG.md)

### Decisions Made
- **Two-table approach**: Product (quantity) vs ProductUnit (serial) for cleaner separation
- **Independent tables**: ProductUnit is NOT related to Product (different use cases)
- **Quantity initialization**: When creating a product, availableQuantity = totalQuantity
- **Status for units**: ProductUnitStatus (AVAILABLE, RENTED, IN_REPAIR, RETIRED)
- **Soft delete**: Both use `active: boolean` field
- **Inventory operations**: HTTP endpoints for admin operations (add-stock, retire, repair)
- **Rental integration**: Service methods (not HTTP) for rental-related quantity changes (ADR-001)

### API Endpoints (Products)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /products | Create product | Authenticated |
| GET | /products | List products (with pagination and filters) | Authenticated |
| GET | /products/:id | Get product | Authenticated |
| PATCH | /products/:id | Update product | Authenticated |
| PATCH | /products/:id/reactivate | Reactivate product | Authenticated |
| DELETE | /products/:id | Soft delete product | Authenticated |
| POST | /products/:id/add-stock | Add units to inventory | Authenticated |
| POST | /products/:id/retire | Remove units (damaged/lost) | Authenticated |
| POST | /products/:id/send-to-repair | Move units to repair | Authenticated |
| POST | /products/:id/mark-repaired | Return units from repair | Authenticated |

### API Endpoints (Product Units)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /product-units | Create product unit | Authenticated |
| GET | /product-units | List units (with pagination and filters) | Authenticated |
| GET | /product-units/serial/:serial | Find by serial number | Authenticated |
| GET | /product-units/:id | Get product unit | Authenticated |
| PATCH | /product-units/:id | Update product unit | Authenticated |
| PATCH | /product-units/:id/status | Update status | Authenticated |
| PATCH | /product-units/:id/reactivate | Reactivate unit | Authenticated |
| DELETE | /product-units/:id | Soft delete unit | Authenticated |

### Test Summary
- Total tests: 120 (all passing)
  - AuthService: 8 tests
  - UsersService: 13 tests
  - ClientsService: 15 tests
  - DevicesService: 29 tests
  - ProductsService: 32 tests (15 CRUD + 17 inventory)
  - ProductUnitsService: 20 tests
  - AppController: 3 tests

### Pending / Next Session
- [x] Implement Rental module (completed in Session 6)

### Questions / Doubts
- (none)

---

## Session 6 - 2024-12-16

### Objective
Implement Rentals module for equipment tracking.

### Completed
- [x] Designed Rental schema with join tables:
  - Rental: main transaction record
  - RentalDevice: devices in rental
  - RentalProduct: products (by quantity) in rental
  - RentalProductUnit: product units (by serial) in rental
- [x] Added RentalStatus enum (ACTIVE, RETURNED, CANCELLED)
- [x] Generated migration `20251216183543_add_rentals`
- [x] Added internal methods to ProductsService (ADR-001):
  - rentQuantity() - Move from available to rented
  - returnQuantity() - Move from rented to available
- [x] Generated NestJS Rentals module
- [x] Implemented RentalsService with TDD (24 tests):
  - create() - with validation of client, devices, products, productUnits
  - findAll() - with pagination and filters (status, clientId)
  - findOne() - with NotFoundException
  - update() - update basic fields (only ACTIVE rentals)
  - returnRental() - mark as returned, restore inventory
  - cancelRental() - mark as cancelled, restore inventory
- [x] Implemented RentalsController with all endpoints
- [x] Updated documentation (API.md, DATABASE.md)

### Decisions Made
- **No DRAFT status**: Started simple with only ACTIVE, RETURNED, CANCELLED
- **Service-level integration**: RentalsService calls ProductsService methods, not HTTP endpoints (ADR-001)
- **Transactional operations**: Create, return, and cancel use $transaction for atomicity
- **Inventory restoration**: Both return and cancel restore all inventory (devices, products, productUnits)

### API Endpoints (Rentals)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /rentals | Create rental | Authenticated |
| GET | /rentals | List rentals (with pagination and filters) | Authenticated |
| GET | /rentals/:id | Get rental | Authenticated |
| PATCH | /rentals/:id | Update rental (dates, notes) | Authenticated |
| POST | /rentals/:id/return | Mark as returned | Authenticated |
| POST | /rentals/:id/cancel | Cancel rental | Authenticated |

### Test Summary
- Total tests: 152 (all passing)
  - AuthService: 8 tests
  - UsersService: 13 tests
  - ClientsService: 15 tests
  - DevicesService: 29 tests
  - ProductsService: 40 tests (32 + 8 rental quantity methods)
  - ProductUnitsService: 20 tests
  - RentalsService: 24 tests
  - AppController: 3 tests

### Pending / Next Session
- [ ] Test Rentals endpoints with Postman
- [ ] E2E testing of full rental workflow

### Future Features (Rentals)
- [ ] **Pending rentals endpoint** - GET /rentals/pending para el frontend
- [ ] **Partial returns** - Devolver solo algunos items de un alquiler
- [ ] **Rental extension** - Extender fecha de devolución esperada

### Questions / Doubts
- (none)

---

<!-- Template for new sessions:

## Session N - YYYY-MM-DD

### Objective
[What we plan to accomplish]

### Completed
- [ ] Task 1
- [ ] Task 2

### Decisions Made
- Decision 1: reason

### Pending / Next Session
- [ ] Item 1

### Questions / Doubts
- Question 1

-->
