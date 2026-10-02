---
name: graphify
description: Navigate, search, and understand the codebase using the Graphify knowledge graph. Always use when finding files, looking up symbols, tracing function calls, or understanding module dependencies.
---

# Graphify Codebase Exploration Skill

Use this skill whenever you need to explore or understand files and logic in this repository.

## Overview
The repository is indexed in `graphify-out/graph.json` containing 694 nodes and 1182 edges across the backend, mobile app, and admin panel.

## Mandatory Tool Argument
All `graphify` MCP tool calls must include:
```json
"project_path": "/Users/satyamkumar/Desktop/1356"
```

## Available MCP Tools & Recipes

### 1. Natural Language Code Search (`query_graph`)
Use to search for features, logic flows, or concepts:
- **Server**: `graphify`
- **Tool**: `query_graph`
- **Arguments**:
  ```json
  {
    "project_path": "/Users/satyamkumar/Desktop/1356",
    "question": "Where is user authentication and JWT verification handled?",
    "mode": "bfs",
    "depth": 3
  }
  ```

### 2. Inspect a Symbol or File (`get_node`)
Use to get the exact file path, type, and doc/metadata of a specific node:
- **Server**: `graphify`
- **Tool**: `get_node`
- **Arguments**:
  ```json
  {
    "project_path": "/Users/satyamkumar/Desktop/1356",
    "label": "AuthService"
  }
  ```

### 3. Trace Dependencies & Callers (`get_neighbors`)
Use to see who calls a function, or what a class imports and depends on:
- **Server**: `graphify`
- **Tool**: `get_neighbors`
- **Arguments**:
  ```json
  {
    "project_path": "/Users/satyamkumar/Desktop/1356",
    "node_id": "AuthService"
  }
  ```

### 4. High-Level Core Hubs (`god_nodes`)
Use to find key architectural components:
- **Server**: `graphify`
- **Tool**: `god_nodes`
- **Arguments**:
  ```json
  {
    "project_path": "/Users/satyamkumar/Desktop/1356"
  }
  ```

### 5. Shortest Path Between Components (`shortest_path`)
Use to trace execution or dependency paths from component A to component B:
- **Server**: `graphify`
- **Tool**: `shortest_path`
- **Arguments**:
  ```json
  {
    "project_path": "/Users/satyamkumar/Desktop/1356",
    "source": "WalletController",
    "target": "Database"
  }
  ```

## Best Practice
1. Start with `query_graph` or `god_nodes`.
2. Inspect the resulting nodes and file paths.
3. Open only the exact required files using `view_file`.
