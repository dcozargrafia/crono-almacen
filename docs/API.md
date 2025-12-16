# API Documentation

> Crono-Almacén REST API Reference

Base URL: `http://localhost:3000`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth

#### POST /auth/login

Authenticate user and get JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@crono.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "admin@crono.com",
    "name": "Administrator",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 401 | `INVALID_CREDENTIALS` | Email or password incorrect |
| 401 | `USER_INACTIVE` | User account is deactivated |

---

#### GET /auth/profile

Get current authenticated user profile.

**Access:** Authenticated

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@crono.com",
  "name": "Administrator",
  "role": "ADMIN"
}
```

---

#### PATCH /auth/password

Change own password.

**Access:** Authenticated

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:** 204 No Content

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 401 | `USER_NOT_FOUND` | User no longer exists |
| 401 | `INVALID_CURRENT_PASSWORD` | Current password is incorrect |

---

### Users (Admin Only)

All `/users` endpoints require `ADMIN` role.

#### POST /users

Create a new user.

**Access:** ADMIN

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Unique email address |
| password | string | Yes | Min 6 characters |
| name | string | Yes | User display name |
| role | string | No | `USER` (default) or `ADMIN` |

**Response (201):**
```json
{
  "id": 2,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "active": true,
  "createdAt": "2024-12-12T10:00:00.000Z",
  "updatedAt": "2024-12-12T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 409 | `EMAIL_ALREADY_EXISTS` | Email is already registered |

---

#### GET /users

List all users.

**Access:** ADMIN

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "admin@crono.com",
    "name": "Administrator",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2024-12-12T10:00:00.000Z",
    "updatedAt": "2024-12-12T10:00:00.000Z"
  }
]
```

---

#### GET /users/:id

Get a specific user.

**Access:** ADMIN

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@crono.com",
  "name": "Administrator",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2024-12-12T10:00:00.000Z",
  "updatedAt": "2024-12-12T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `USER_NOT_FOUND` | User does not exist |

---

#### PATCH /users/:id

Update user data.

**Access:** ADMIN

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "name": "Updated Name",
  "role": "ADMIN",
  "active": false
}
```

All fields are optional.

**Response (200):**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "name": "Updated Name",
  "role": "ADMIN",
  "active": false,
  "createdAt": "2024-12-12T10:00:00.000Z",
  "updatedAt": "2024-12-12T11:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `USER_NOT_FOUND` | User does not exist |
| 409 | `EMAIL_ALREADY_EXISTS` | New email is already taken |

---

#### PATCH /users/:id/password

Reset user password (admin action).

**Access:** ADMIN

**Request Body:**
```json
{
  "newPassword": "newPassword123"
}
```

**Response:** 204 No Content

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `USER_NOT_FOUND` | User does not exist |

---

#### DELETE /users/:id

Soft delete user (sets `active: false`).

**Access:** ADMIN

**Response:** 204 No Content

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `USER_NOT_FOUND` | User does not exist |

---

### Clients

All `/clients` endpoints require authentication.

#### POST /clients

Create a new client.

**Access:** Authenticated

**Request Body:**
```json
{
  "name": "Acme Sports",
  "codeSportmaniacs": 12345,
  "email": "contact@acme.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Client name |
| codeSportmaniacs | number | No | Unique Sportmaniacs platform ID |
| email | string | No | Contact email |

**Response (201):**
```json
{
  "id": 1,
  "name": "Acme Sports",
  "codeSportmaniacs": 12345,
  "email": "contact@acme.com",
  "active": true,
  "createdAt": "2024-12-14T10:00:00.000Z",
  "updatedAt": "2024-12-14T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 409 | `CODE_SPORTMANIACS_ALREADY_EXISTS` | Sportmaniacs code already registered |

---

#### GET /clients

List clients with pagination and optional active filter.

**Access:** Authenticated

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | `1` | Page number (min: 1) |
| limit | number | `10` | Items per page (min: 1) |
| active | string | `true` | Filter: `true`, `false`, or `all` |

**Examples:**
- `GET /clients` - First 10 active clients
- `GET /clients?page=2&limit=5` - Page 2, 5 items per page
- `GET /clients?active=false` - Inactive clients
- `GET /clients?active=all` - All clients

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Acme Sports",
      "codeSportmaniacs": 12345,
      "email": "contact@acme.com",
      "active": true,
      "createdAt": "2024-12-14T10:00:00.000Z",
      "updatedAt": "2024-12-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

#### GET /clients/:id

Get a specific client by ID.

**Access:** Authenticated

**Response (200):**
```json
{
  "id": 1,
  "name": "Acme Sports",
  "codeSportmaniacs": 12345,
  "email": "contact@acme.com",
  "active": true,
  "createdAt": "2024-12-14T10:00:00.000Z",
  "updatedAt": "2024-12-14T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `CLIENT_NOT_FOUND` | Client does not exist |

---

#### GET /clients/sportmaniacs/:code

Find client by Sportmaniacs code.

**Access:** Authenticated

**Response (200):**
```json
{
  "id": 1,
  "name": "Acme Sports",
  "codeSportmaniacs": 12345,
  "email": "contact@acme.com",
  "active": true,
  "createdAt": "2024-12-14T10:00:00.000Z",
  "updatedAt": "2024-12-14T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `CLIENT_NOT_FOUND` | Client with this code does not exist |

---

#### PATCH /clients/:id

Update client data.

**Access:** Authenticated

**Request Body:**
```json
{
  "name": "Updated Name",
  "codeSportmaniacs": 54321,
  "email": "new@email.com"
}
```

All fields are optional.

**Response (200):**
```json
{
  "id": 1,
  "name": "Updated Name",
  "codeSportmaniacs": 54321,
  "email": "new@email.com",
  "active": true,
  "createdAt": "2024-12-14T10:00:00.000Z",
  "updatedAt": "2024-12-14T11:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `CLIENT_NOT_FOUND` | Client does not exist |
| 409 | `CODE_SPORTMANIACS_ALREADY_EXISTS` | Sportmaniacs code already taken |

---

#### PATCH /clients/:id/reactivate

Reactivate a soft-deleted client.

**Access:** Authenticated

**Response (200):**
```json
{
  "id": 1,
  "name": "Acme Sports",
  "codeSportmaniacs": 12345,
  "email": "contact@acme.com",
  "active": true,
  "createdAt": "2024-12-14T10:00:00.000Z",
  "updatedAt": "2024-12-14T12:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `CLIENT_NOT_FOUND` | Client does not exist |

---

#### DELETE /clients/:id

Soft delete client (sets `active: false`).

**Access:** Authenticated

**Response:** 204 No Content

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `CLIENT_NOT_FOUND` | Client does not exist |

---

### Devices

All `/devices` endpoints require authentication.

#### POST /devices

Create a new device.

**Access:** Authenticated

**Request Body:**
```json
{
  "model": "TS2",
  "manufactoringCode": "TS2-20241215-001",
  "manufactoringStatus": "PENDING",
  "operationalStatus": "IN_MANUFACTURING",
  "availableForRental": false,
  "portCount": 4,
  "notes": "Initial manufacturing batch"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| model | enum | Yes | `TSONE`, `TS2`, `TS2_PLUS`, `CLB` |
| manufactoringCode | string | Yes | Unique manufacturing identifier |
| manufactoringStatus | enum | No | Default: `PENDING` |
| operationalStatus | enum | No | Default: `IN_MANUFACTURING` |
| availableForRental | boolean | No | Default: `false` |
| ownerId | number | No | Client ID (owner) |
| serialNumber | string | No | Assigned when sold |
| portCount | number | No | Number of ports |
| frequencyRegion | enum | No | `EU`, `FCC`, `GX1`, `GX2` |
| manufacturingDate | datetime | No | Manufacturing date |
| notes | string | No | Additional notes |
| reader1SerialNumber | string | No | Reader 1 serial |
| reader2SerialNumber | string | No | Reader 2 serial |
| cpuSerialNumber | string | No | CPU serial |
| batterySerialNumber | string | No | Battery serial |
| tsPowerModel | string | No | Power model |
| cpuFirmware | string | No | CPU firmware version |
| gx1ReadersRegion | string | No | GX1 readers region |
| hasGSM | boolean | No | Has GSM module |
| hasGUN | boolean | No | Has GUN module |
| bluetoothAdapter | string | No | Bluetooth adapter (CLB) |
| coreVersion | string | No | Core version (CLB) |
| heatsinks | string | No | Heatsinks info (CLB) |
| picVersion | string | No | PIC version (CLB) |

**Response (201):**
```json
{
  "id": 1,
  "model": "TS2",
  "manufactoringCode": "TS2-20241215-001",
  "manufactoringStatus": "PENDING",
  "operationalStatus": "IN_MANUFACTURING",
  "availableForRental": false,
  "ownerId": null,
  "serialNumber": null,
  "portCount": 4,
  "notes": "Initial manufacturing batch",
  "createdAt": "2024-12-15T10:00:00.000Z",
  "updatedAt": "2024-12-15T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 400 | `MANUFACTORING_CODE_ALREADY_EXISTS` | Manufacturing code already exists |

---

#### GET /devices

List devices with pagination and filters.

**Access:** Authenticated

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | `1` | Page number (min: 1) |
| pageSize | number | `10` | Items per page (min: 1) |
| model | enum | - | Filter by device model |
| manufactoringStatus | enum | - | Filter by manufacturing status |
| operationalStatus | enum | - | Filter by operational status |
| availableForRental | boolean | - | Filter by rental availability |
| ownerId | number | - | Filter by owner ID |

**Enums:**
- `model`: `TSONE`, `TS2`, `TS2_PLUS`, `CLB`
- `manufactoringStatus`: `PENDING`, `IN_PROGRESS`, `PHASE1_COMPLETED`, `AWAITING_QA`, `COMPLETED`, `OUT_OF_STOCK`
- `operationalStatus`: `IN_MANUFACTURING`, `AVAILABLE`, `RENTED`, `SOLD`, `IN_REPAIR`, `RETIRED`

**Examples:**
- `GET /devices` - First 10 devices
- `GET /devices?model=TS2` - TS2 devices
- `GET /devices?operationalStatus=AVAILABLE&availableForRental=true` - Available for rental

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "model": "TS2",
      "manufactoringCode": "TS2-20241215-001",
      "manufactoringStatus": "COMPLETED",
      "operationalStatus": "AVAILABLE",
      "availableForRental": true,
      "ownerId": null,
      "createdAt": "2024-12-15T10:00:00.000Z",
      "updatedAt": "2024-12-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

---

#### GET /devices/:id

Get a specific device by ID.

**Access:** Authenticated

**Response (200):** Full device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | Device does not exist |

---

#### GET /devices/reader/:serial

Find device by reader serial number (searches reader1 and reader2).

**Access:** Authenticated

**Response (200):** Device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | No device with this reader serial |

---

#### GET /devices/cpu/:serial

Find device by CPU serial number.

**Access:** Authenticated

**Response (200):** Device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | No device with this CPU serial |

---

#### GET /devices/battery/:serial

Find device by battery serial number.

**Access:** Authenticated

**Response (200):** Device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | No device with this battery serial |

---

#### PATCH /devices/:id

Update device data.

**Access:** Authenticated

**Request Body:** Any fields from CreateDeviceDto (all optional)

**Response (200):** Updated device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | Device does not exist |
| 400 | `MANUFACTORING_CODE_ALREADY_EXISTS` | New code already taken |

---

#### DELETE /devices/:id

Retire device (sets `operationalStatus: RETIRED`).

**Access:** Authenticated

**Response (200):** Device with RETIRED status

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | Device does not exist |

---

#### PATCH /devices/:id/manufactoring-status

Update device manufacturing status.

**Access:** Authenticated

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response (200):** Updated device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | Device does not exist |

---

#### PATCH /devices/:id/operational-status

Update device operational status.

**Access:** Authenticated

**Request Body:**
```json
{
  "status": "AVAILABLE"
}
```

**Response (200):** Updated device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | Device does not exist |

---

#### PATCH /devices/:id/owner

Assign or remove device owner.

**Access:** Authenticated

**Request Body:**
```json
{
  "ownerId": 5
}
```

Send `null` or omit `ownerId` to remove owner.

**Response (200):** Updated device object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `DEVICE_NOT_FOUND` | Device does not exist |
| 404 | `CLIENT_NOT_FOUND` | Client (owner) does not exist |

---

### Products

All `/products` endpoints require authentication.

#### POST /products

Create a new product (quantity-based equipment).

**Access:** Authenticated

**Request Body:**
```json
{
  "name": "USB Cable 3m",
  "type": "CABLE",
  "description": "USB-C to USB-A cable, 3 meters",
  "notes": "For TS2 devices",
  "totalQuantity": 50
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| type | enum | Yes | `ANTENNA`, `STOPWATCH`, `PHONE`, `MIFI`, `CABLE`, `OTHER` |
| description | string | No | Product description |
| notes | string | No | Additional notes |
| totalQuantity | number | No | Initial quantity (default: 0) |

**Response (201):**
```json
{
  "id": 1,
  "name": "USB Cable 3m",
  "type": "CABLE",
  "description": "USB-C to USB-A cable, 3 meters",
  "notes": "For TS2 devices",
  "totalQuantity": 50,
  "availableQuantity": 50,
  "rentedQuantity": 0,
  "inRepairQuantity": 0,
  "active": true,
  "createdAt": "2024-12-16T10:00:00.000Z",
  "updatedAt": "2024-12-16T10:00:00.000Z"
}
```

---

#### GET /products

List products with pagination and filters.

**Access:** Authenticated

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | `1` | Page number (min: 1) |
| pageSize | number | `10` | Items per page (min: 1) |
| type | enum | - | Filter by product type |
| active | boolean | - | Filter by active status |

**Examples:**
- `GET /products` - First 10 products
- `GET /products?type=CABLE` - Only cables
- `GET /products?active=true` - Active products only

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "USB Cable 3m",
      "type": "CABLE",
      "totalQuantity": 50,
      "availableQuantity": 45,
      "rentedQuantity": 5,
      "inRepairQuantity": 0,
      "active": true
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

---

#### GET /products/:id

Get a specific product by ID.

**Access:** Authenticated

**Response (200):** Full product object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_NOT_FOUND` | Product does not exist |

---

#### PATCH /products/:id

Update product data.

**Access:** Authenticated

**Request Body:** Any fields from CreateProductDto (all optional)

**Response (200):** Updated product object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_NOT_FOUND` | Product does not exist |

---

#### DELETE /products/:id

Soft delete product (sets `active: false`).

**Access:** Authenticated

**Response (200):** Product with `active: false`

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_NOT_FOUND` | Product does not exist |

---

#### PATCH /products/:id/reactivate

Reactivate a soft-deleted product.

**Access:** Authenticated

**Response (200):** Product with `active: true`

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_NOT_FOUND` | Product does not exist |

---

### Product Units

All `/product-units` endpoints require authentication. Product units are serialized items (tracked by serial number).

#### POST /product-units

Create a new product unit.

**Access:** Authenticated

**Request Body:**
```json
{
  "type": "STOPWATCH",
  "serialNumber": "SW-2024-001",
  "notes": "New batch"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | Yes | `ANTENNA`, `STOPWATCH`, `PHONE`, `MIFI`, `CABLE`, `OTHER` |
| serialNumber | string | Yes | Unique serial number |
| notes | string | No | Additional notes |

**Response (201):**
```json
{
  "id": 1,
  "type": "STOPWATCH",
  "serialNumber": "SW-2024-001",
  "notes": "New batch",
  "status": "AVAILABLE",
  "active": true,
  "createdAt": "2024-12-16T10:00:00.000Z",
  "updatedAt": "2024-12-16T10:00:00.000Z"
}
```

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 400 | `SERIAL_NUMBER_ALREADY_EXISTS` | Serial number already registered |

---

#### GET /product-units

List product units with pagination and filters.

**Access:** Authenticated

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | `1` | Page number (min: 1) |
| pageSize | number | `10` | Items per page (min: 1) |
| type | enum | - | Filter by product type |
| status | enum | - | Filter by status |
| active | boolean | - | Filter by active status |

**Status values:** `AVAILABLE`, `RENTED`, `IN_REPAIR`, `RETIRED`

**Examples:**
- `GET /product-units` - First 10 units
- `GET /product-units?type=PHONE&status=AVAILABLE` - Available phones
- `GET /product-units?active=false` - Inactive units

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "type": "STOPWATCH",
      "serialNumber": "SW-2024-001",
      "status": "AVAILABLE",
      "active": true
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

---

#### GET /product-units/serial/:serial

Find product unit by serial number.

**Access:** Authenticated

**Response (200):** Product unit object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_UNIT_NOT_FOUND` | No unit with this serial |

---

#### GET /product-units/:id

Get a specific product unit by ID.

**Access:** Authenticated

**Response (200):** Full product unit object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_UNIT_NOT_FOUND` | Product unit does not exist |

---

#### PATCH /product-units/:id

Update product unit data.

**Access:** Authenticated

**Request Body:** Any fields from CreateProductUnitDto (all optional)

**Response (200):** Updated product unit object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_UNIT_NOT_FOUND` | Product unit does not exist |
| 400 | `SERIAL_NUMBER_ALREADY_EXISTS` | New serial already taken |

---

#### PATCH /product-units/:id/status

Update product unit status.

**Access:** Authenticated

**Request Body:**
```json
{
  "status": "RENTED"
}
```

**Response (200):** Updated product unit object

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_UNIT_NOT_FOUND` | Product unit does not exist |

---

#### DELETE /product-units/:id

Soft delete product unit (sets `active: false`).

**Access:** Authenticated

**Response (200):** Product unit with `active: false`

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_UNIT_NOT_FOUND` | Product unit does not exist |

---

#### PATCH /product-units/:id/reactivate

Reactivate a soft-deleted product unit.

**Access:** Authenticated

**Response (200):** Product unit with `active: true`

**Errors:**
| Code | Error Key | Description |
|------|-----------|-------------|
| 404 | `PRODUCT_UNIT_NOT_FOUND` | Product unit does not exist |

---

## Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 401,
  "message": "INVALID_CREDENTIALS",
  "error": "Unauthorized"
}
```

For validation errors (400):

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```
