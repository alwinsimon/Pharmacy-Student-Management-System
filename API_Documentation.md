# Pharmacy College Management System API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

### Register User
```http
POST /auth/register
```

Request Body:
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "role": "string",
    "status": "string"
  }
}
```

### Login
```http
POST /auth/login
```

Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

Request Body:
```json
{
  "refreshToken": "string"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### Logout
```http
POST /auth/logout
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "refreshToken": "string"
}
```

Response (200):
```json
{
  "success": true
}
```

### Verify Email
```http
POST /auth/verify-email
```

Request Body:
```json
{
  "token": "string"
}
```

Response (200):
```json
{
  "success": true
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

Request Body:
```json
{
  "email": "string"
}
```

Response (200):
```json
{
  "success": true
}
```

### Reset Password
```http
POST /auth/reset-password
```

Request Body:
```json
{
  "token": "string",
  "password": "string"
}
```

Response (200):
```json
{
  "success": true
}
```

## Users

### Get User Profile
```http
GET /users/profile
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "status": "string"
  }
}
```

### Update User Profile
```http
PUT /users/profile
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "firstName": "string",
  "lastName": "string"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "status": "string"
  }
}
```

### Change Password
```http
PUT /users/change-password
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

Response (200):
```json
{
  "success": true
}
```

## Cases

### Create Case
```http
POST /cases
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "type": "string",
  "priority": "string"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "priority": "string",
    "status": "string",
    "createdBy": "string",
    "createdAt": "string"
  }
}
```

### Get Cases
```http
GET /cases
```

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- page (number)
- limit (number)
- status (string)
- type (string)
- priority (string)

Response (200):
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "type": "string",
        "priority": "string",
        "status": "string",
        "createdBy": "string",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### Get Case by ID
```http
GET /cases/:id
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "priority": "string",
    "status": "string",
    "createdBy": "string",
    "createdAt": "string",
    "comments": [
      {
        "id": "string",
        "content": "string",
        "createdBy": "string",
        "createdAt": "string"
      }
    ]
  }
}
```

### Update Case
```http
PUT /cases/:id
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "title": "string",
  "description": "string",
  "type": "string",
  "priority": "string",
  "status": "string"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "priority": "string",
    "status": "string",
    "createdBy": "string",
    "createdAt": "string"
  }
}
```

### Add Comment to Case
```http
POST /cases/:id/comments
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "content": "string"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "content": "string",
    "createdBy": "string",
    "createdAt": "string"
  }
}
```

## Documents

### Upload Document
```http
POST /documents
```

Headers:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

Request Body:
```
file: File
type: string
description: string
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "filename": "string",
    "type": "string",
    "description": "string",
    "url": "string",
    "uploadedBy": "string",
    "uploadedAt": "string"
  }
}
```

### Get Documents
```http
GET /documents
```

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- page (number)
- limit (number)
- type (string)

Response (200):
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "string",
        "filename": "string",
        "type": "string",
        "description": "string",
        "url": "string",
        "uploadedBy": "string",
        "uploadedAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### Get Document by ID
```http
GET /documents/:id
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "filename": "string",
    "type": "string",
    "description": "string",
    "url": "string",
    "uploadedBy": "string",
    "uploadedAt": "string"
  }
}
```

### Delete Document
```http
DELETE /documents/:id
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true
}
```

## QR Codes

### Generate QR Code
```http
POST /qrcodes
```

Headers:
```
Authorization: Bearer <access_token>
```

Request Body:
```json
{
  "data": "string",
  "type": "string"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "data": "string",
    "type": "string",
    "qrCode": "string",
    "createdBy": "string",
    "createdAt": "string"
  }
}
```

### Get QR Codes
```http
GET /qrcodes
```

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- page (number)
- limit (number)
- type (string)

Response (200):
```json
{
  "success": true,
  "data": {
    "qrcodes": [
      {
        "id": "string",
        "data": "string",
        "type": "string",
        "qrCode": "string",
        "createdBy": "string",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### Get QR Code by ID
```http
GET /qrcodes/:id
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "data": "string",
    "type": "string",
    "qrCode": "string",
    "createdBy": "string",
    "createdAt": "string"
  }
}
```

## Logs

### Get Logs
```http
GET /logs
```

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- page (number)
- limit (number)
- level (string)
- startDate (string)
- endDate (string)

Response (200):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "string",
        "level": "string",
        "message": "string",
        "timestamp": "string",
        "userId": "string",
        "action": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

## Dashboard

### Get Dashboard Stats
```http
GET /dashboard/stats
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "totalUsers": "number",
    "totalCases": "number",
    "totalDocuments": "number",
    "activeCases": "number",
    "pendingCases": "number",
    "recentActivities": [
      {
        "id": "string",
        "type": "string",
        "description": "string",
        "timestamp": "string",
        "userId": "string"
      }
    ]
  }
}
```

## Departments

### Get Departments
```http
GET /departments
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "head": "string",
        "totalStaff": "number"
      }
    ]
  }
}
```

### Get Department by ID
```http
GET /departments/:id
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "head": "string",
    "totalStaff": "number",
    "staff": [
      {
        "id": "string",
        "name": "string",
        "role": "string",
        "email": "string"
      }
    ]
  }
}
```

## Notifications

### Get Notifications
```http
GET /notifications
```

Headers:
```
Authorization: Bearer <access_token>
```

Query Parameters:
- page (number)
- limit (number)
- read (boolean)

Response (200):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "string",
        "message": "string",
        "read": "boolean",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### Mark Notification as Read
```http
PUT /notifications/:id/read
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true
}
```

### Mark All Notifications as Read
```http
PUT /notifications/read-all
```

Headers:
```
Authorization: Bearer <access_token>
```

Response (200):
```json
{
  "success": true
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "string"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "string"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "string"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "string"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "string"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "string"
}
``` 