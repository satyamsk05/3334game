# Shared Contracts & Data Schemas

This directory contains shared DTO definitions, WebSocket event payloads, and API contract specifications shared conceptually between the Android client (`app/`) and backend server (`backend/`).

## Contract Specifications
- `GameRoundDto`: Schema for round lifecycle states (`BETTING`, `LOCKED`, `SPINNING`, `RESULT`)
- `GameResultDto`: Payload for game round outcome and fairness commitments
- `WalletDto`: Account balance payload
- `TransactionDto`: Financial operation payload with idempotency key
