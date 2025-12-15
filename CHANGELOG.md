# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Device management module (CRUD for authenticated users)
  - `POST /devices` - Create device
  - `GET /devices` - List devices (with pagination and filters)
  - `GET /devices/:id` - Get device
  - `GET /devices/reader/:serial` - Find by reader serial number
  - `GET /devices/cpu/:serial` - Find by CPU serial number
  - `GET /devices/battery/:serial` - Find by battery serial number
  - `PATCH /devices/:id` - Update device
  - `PATCH /devices/:id/manufactoring-status` - Update manufacturing status
  - `PATCH /devices/:id/operational-status` - Update operational status
  - `PATCH /devices/:id/owner` - Assign/remove owner
  - `DELETE /devices/:id` - Retire device (soft delete)
- Pagination and filters for `GET /devices` endpoint
  - Query params: `page`, `pageSize`, `model`, `manufactoringStatus`, `operationalStatus`, `availableForRental`, `ownerId`
- Unit tests for DevicesService (29 tests with TDD)
- Client management module (CRUD for authenticated users)
  - `POST /clients` - Create client
  - `GET /clients` - List clients (with pagination and active filter)
  - `GET /clients/:id` - Get client
  - `GET /clients/sportmaniacs/:code` - Find by Sportmaniacs code
  - `PATCH /clients/:id` - Update client
  - `PATCH /clients/:id/reactivate` - Reactivate soft-deleted client
  - `DELETE /clients/:id` - Soft delete client
- Pagination support for `GET /clients` endpoint
  - Query params: `page`, `pageSize`, `active`
  - Response includes `meta` object with total, page, pageSize, totalPages
- Unit tests for ClientsService (15 tests with TDD)
- Client and Device models in database schema
  - Client: companies/event organizers that own devices
  - Device: timing devices with manufacturing and operational status
- New enums: DeviceModel, ManufactoringStatus, OperationalStatus, FrequencyRegion
- Seed data: Cronochip as internal client

### Planned
- Product module (rental equipment)
- Rental module

---

## [0.2.0] - 2024-12-12

### Added
- User management module (CRUD for ADMIN)
  - `POST /users` - Create user
  - `GET /users` - List users
  - `GET /users/:id` - Get user
  - `PATCH /users/:id` - Update user
  - `PATCH /users/:id/password` - Reset password
  - `DELETE /users/:id` - Soft delete user
- Change own password endpoint (`PATCH /auth/password`)
- Seed script with configurable ADMIN and USER
- Unit tests for AuthService (8 tests)
- Unit tests for UsersService (13 tests)
- Project documentation
  - `docs/API.md` - API reference
  - `docs/DATABASE.md` - Data model
  - `docs/ARCHITECTURE.md` - Technical architecture
  - `CONTRIBUTING.md` - Contribution guidelines
  - `CHANGELOG.md` - This file

### Changed
- Removed public registration (`POST /auth/register`)
- Translated codebase from Spanish to English
- Types now re-exported from Prisma (single source of truth)

### Security
- Only ADMIN can create/manage users
- Users can only change their own password (requires current password)
- ADMIN can reset any user's password

---

## [0.1.0] - 2024-12-11

### Added
- Initial project setup from NestJS Auth Starter
- JWT authentication with Passport
- Role-based authorization (USER, ADMIN)
- User entity with Prisma
- Auth endpoints
  - `POST /auth/login`
  - `GET /auth/profile`
- Custom decorators (`@CurrentUser`, `@Roles`)
- Custom guards (`JwtAuthGuard`, `RolesGuard`)
- Docker Compose for PostgreSQL
- Basic project documentation (`README.md`)

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.2.0 | 2024-12-12 | User management, tests, documentation |
| 0.1.0 | 2024-12-11 | Initial setup, authentication |
