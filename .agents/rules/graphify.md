# Rule: Mandatory Codebase Exploration via Graphify

When exploring, navigating, understanding, or searching files and code in this workspace, ALWAYS prioritize the **Graphify Knowledge Graph** before reading raw files.

## Project Graph Context
- **Graph Location**: `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`
- **Graph Metadata**: 694 nodes, 1182 edges, 127 architectural communities.

## Core Rules

1. **Always Use Graphify for File and Symbol Discovery**:
   - Do NOT blindly use `list_dir` or recursive `grep_search` across directories to find how things work.
   - Always search or inspect the graph first using Graphify MCP tools (`call_mcp_tool` with `ServerName: "graphify"`).

2. **Crucial Parameter**:
   - Whenever calling any Graphify MCP tool, ALWAYS pass:
     `project_path: "/Users/satyamkumar/Desktop/1356"`
     (e.g., `{"project_path": "/Users/satyamkumar/Desktop/1356", "question": "..."}`)

3. **Standard Navigation Workflow**:
   - **Step 1 (Semantic / Concept Search)**:
     Call `query_graph` with a natural language question or keyword:
     `call_mcp_tool(ServerName="graphify", ToolName="query_graph", Arguments={"project_path": "/Users/satyamkumar/Desktop/1356", "question": "<search query>"})`
   - **Step 2 (Examine Symbol & File Location)**:
     Call `get_node` by symbol label or node ID:
     `call_mcp_tool(ServerName="graphify", ToolName="get_node", Arguments={"project_path": "/Users/satyamkumar/Desktop/1356", "label": "<symbol/file>"})`
   - **Step 3 (Inspect Dependencies / Callers / Callees)**:
     Call `get_neighbors`:
     `call_mcp_tool(ServerName="graphify", ToolName="get_neighbors", Arguments={"project_path": "/Users/satyamkumar/Desktop/1356", "node_id": "<node_id>"})`
   - **Step 4 (High-Level Architecture & Hubs)**:
     Check `god_nodes` or refer to `graphify-out/GRAPH_REPORT.md` before making architectural decisions:
     `call_mcp_tool(ServerName="graphify", ToolName="god_nodes", Arguments={"project_path": "/Users/satyamkumar/Desktop/1356"})`
   - **Step 5 (Targeted File Reading)**:
     Only call `view_file` once the specific file path and target symbol lines are pinpointed through Graphify.
