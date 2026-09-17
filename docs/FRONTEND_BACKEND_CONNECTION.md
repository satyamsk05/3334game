# Frontend & Backend Architecture & Connection Guide

## Overview

This document specifies the network architecture and connection configurations between the 3334Game clients (**Android Native App** and **Next.js Admin Panel**) and the **Express Authoritative Backend** deployed via Docker on AWS EC2.

---

## Network Architecture & Endpoints

```text
               ┌────────────────────────────────────────┐
               │        Supabase PostgreSQL DB          │
               └───────────────────▲────────────────────┘
                                   │
                                   │ (Database Connection)
                                   ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │                      Express Backend Server                         │
 │                     AWS EC2: 3.7.73.109:4001                        │
 └─────────────────▲───────────────────────────────▲───────────────────┘
                   │                               │
       REST API & WebSockets              REST API & Admin Auth
                   │                               │
 ┌─────────────────┴─────────────┐   ┌─────────────┴───────────────────┐
 │    Android Native Client      │   │    Next.js Admin Panel          │
 │    - Base: 3.7.73.109:4001    │   │    - Base: 3.7.73.109:4001    │
 │    - WS: ws://3.7.73.109:4001 │   │    - WS: ws://3.7.73.109:4001 │
 └───────────────────────────────┘   └─────────────────────────────────┘
```

### Production Endpoints:
- **AWS EC2 Public IP**: `3.7.73.109`
- **Host Port**: `4001`
- **Container Port**: `4000`
- **REST API Base URL**: `http://3.7.73.109:4001/api/v1`
- **WebSocket Endpoint**: `ws://3.7.73.109:4001/ws`
- **Health Check**: `http://3.7.73.109:4001/api/v1/health`

---

## 1. Android Application Configuration

The Android application is built with Kotlin and Jetpack Compose.

### Configuration Files:
- **`app/src/main/AndroidManifest.xml`**:
  ```xml
  <application
      android:allowBackup="false"
      android:usesCleartextTraffic="true"
      android:icon="@mipmap/ic_launcher"
      ... >
  ```
  *Note*: `android:usesCleartextTraffic="true"` enables cleartext HTTP communication with non-SSL IP targets (`http://3.7.73.109:4001`).

- **`app/src/main/java/com/example/app334/core/config/ClientConfig.kt`**:
  ```kotlin
  object ClientConfig {
      var SERVER_BASE_URL: String = "http://3.7.73.109:4001"
      val API_BASE_URL: String get() = "$SERVER_BASE_URL/api/v1"
      val WEBSOCKET_URL: String get() = SERVER_BASE_URL.replace("http://", "ws://") + "/ws"
  }
  ```

---

## 2. Next.js Admin Panel Configuration

The Admin Panel is built with Next.js 14, TailwindCSS, and Lucide icons.

### Configuration Files:
- **`admin-panel/.env.local`**:
  ```env
  NEXT_PUBLIC_API_URL=http://3.7.73.109:4001/api/v1
  NEXT_PUBLIC_WS_URL=ws://3.7.73.109:4001/ws
  ```
- **`admin-panel/src/services/api.ts`**:
  ```typescript
  export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://3.7.73.109:4001/api/v1',
    headers: { 'Content-Type': 'application/json' }
  });
  ```

---

## 3. Backend Docker Configuration

- **`backend/docker-compose.yml`**:
  ```yaml
  version: '3.8'

  services:
    app:
      build: .
      container_name: 334game-backend
      restart: always
      ports:
        - "4001:4000"
      env_file:
        - .env
      environment:
        - PORT=4000
  ```

---

## Deployment Commands for EC2 Instance

To deploy or restart the backend container on AWS EC2:

```bash
# 1. Pull latest backend code
git pull origin main

# 2. Rebuild and restart docker container
docker compose down
docker compose up -d --build

# 3. Check logs & container status
docker compose logs -f
```
