# Project Instructions for Agents

## Codebase Architecture & File Exploration Protocol

This project is pre-indexed with a comprehensive **Graphify Knowledge Graph** stored in `graphify-out/`.

### 🚨 Mandatory Requirement: Use Graphify First
Whenever you need to inspect files, understand features, locate symbols/endpoints/functions, or trace dependencies:
- **DO NOT** perform blind global grep searches or traverse directories manually.
- **DO** query the knowledge graph using the **Graphify MCP Server** (`call_mcp_tool` with `ServerName: "graphify"`).

### Tool Call Configuration
Every call to Graphify MCP tools must include `project_path`:
```json
{
  "ServerName": "graphify",
  "ToolName": "query_graph",
  "Arguments": {
    "project_path": "/Users/satyamkumar/Desktop/1356",
    "question": "your question or search term"
  }
}
```

### Graphify MCP Capabilities
- **`query_graph`**: Natural language search across graph entities, relationships, and code locations (BFS/DFS).
- **`get_node`**: Retrieve details and file paths for a specific class, method, or file by label.
- **`get_neighbors`**: Explore incoming/outgoing callers, imports, and dependencies of a node.
- **`god_nodes`**: Discover the core hubs and central abstractions of the application.
- **`get_community`**: Inspect thematic clusters and subsystem modules.
- **`shortest_path`**: Trace connection paths between two components.
- **`graph_stats`**: View graph health, node count, and edge confidence.

Only use `view_file` on targeted files once their location and relevance have been confirmed through Graphify.
