# 3334Game Authoritative API & WebSocket Specification

## 1. System Overview

- **Base URL**: `http://3.7.73.109:4001/api/v1`
- **WebSocket URL**: `ws://3.7.73.109:4001/ws`
- **Protocol**: HTTP/1.1 REST & WebSockets
- **Authentication**: JWT Bearer Tokens (`Authorization: Bearer <token>`)
- **Data Format**: JSON (`Content-Type: application/json`)
- **Currency Unit**: Integer Paise (`100 paise = ₹1.00`)

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### 2.1 Admin Login
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/admin/login`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "334game@admin2026"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Admin login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "username": "admin"
    }
  }
  ```

### 2.2 WhatsApp OTP-less Login
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/whatsapp`
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "name": "Player One"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1...",
      "user": {
        "id": "USR-1002",
        "phone": "9876543210",
        "name": "Player One"
      }
    }
  }
  ```

---

## 3. Financial & Wallet Endpoints (`/api/v1/wallet` & `/api/v1/payments`)

### 3.1 Fetch User Balance
- **Method**: `GET`
- **Endpoint**: `/api/v1/wallet/balance`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "depositPaise": 5000,
      "winningPaise": 1500,
      "bonusPaise": 500,
      "totalPaise": 7000
    }
  }
  ```

### 3.2 Request Cash Deposit
- **Method**: `POST`
- **Endpoint**: `/api/v1/payments/deposit`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "amountPaise": 10000,
    "utr": "426189201948"
  }
  ```

### 3.3 Request Withdrawal
- **Method**: `POST`
- **Endpoint**: `/api/v1/payments/withdraw`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "amountPaise": 2500,
    "upiId": "player@upi"
  }
  ```

---

## 4. System Health Endpoint

- **Method**: `GET`
- **Endpoint**: `/api/v1/health`
- **Response (200 OK)**:
  ```json
  {
    "status": "ONLINE",
    "service": "334game-backend-core",
    "timestamp": "2026-09-17T16:14:19.261Z"
  }
  ```
