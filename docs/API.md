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
