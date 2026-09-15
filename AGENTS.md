# 3334Game — Project & Agent Guidelines

## Repository Structure

```text
3334game/
├── AGENTS.md
├── app/          # Android App (Kotlin + Jetpack Compose)
├── backend/      # Backend API Server (Authoritative game state, auth, wallet)
├── shared/       # Shared contracts, DTO schemas & protocol definitions
└── docs/         # Architecture plans, guides & documentation
```

## Graphify Rules

This project has a graphify knowledge graph at `graphify-out/`.

Rules:
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).
