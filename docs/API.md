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
