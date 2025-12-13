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

## Session 3 - 2024-12-13

### Objective
Implement Clients module with full CRUD.

### Completed
- [x] Updated SESSION_LOG with correct status from session 2
- [ ] Implement Clients module (controller, service, DTOs)
- [ ] Write tests for ClientsService
- [ ] Update documentation

### Decisions Made
- Serial number format: Free-form string (varies by device model)

### Notes
- Models Client and Device already exist in Prisma schema
- Client has relation to Device (one-to-many: a client can own multiple devices)

### Pending / Next Session
- (to be filled at end of session)

### Questions / Doubts
- (none so far)

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
