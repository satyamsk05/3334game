# Workspace Guidelines

## Codebase Navigation: Graphify First

This repository uses a pre-generated knowledge graph located in `graphify-out/` (694 nodes, 1182 edges, 127 communities).

### Exploration Protocol
Before reading arbitrary files or performing full-repo regex searches:
1. Use **Graphify MCP Tools** (`query_graph`, `get_node`, `get_neighbors`, `god_nodes`).
2. Always supply `"project_path": "/Users/satyamkumar/Desktop/1356"` in tool arguments.
3. Review `graphify-out/GRAPH_REPORT.md` for high-level structure and central "god nodes" (e.g., `AdminController`, `WalletLedger`, `TicTacToeEngine`, `AuthService`).
4. Read files (`view_file`) only after pinpointing the exact target file via Graphify.
