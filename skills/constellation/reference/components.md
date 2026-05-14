# Foundational components

## environment

The root of a graph of components, usually representing an environment or region (dev, prod, us-east1) or a fork of one (dev-pr-42).

## ingress

Proxy for incoming requests to routes to other components.

## client

A named client or agent identity. Matched against incoming requests by the ingress using header rules defined in `config.match`. Use `allowedRoutes` to restrict which ingress routes this client may access.

An empty `match` object is the anonymous client — it matches all requests that don't match a more specific client.

Examples:

```yaml
# anonymous — matches any request
name: anonymous
type: client@1
config:
  match: {}
allowedRoutes:
  - "*"
```

```yaml
# named client matched by header
name: claude-code
type: client@1
config:
  match:
    headers:
      x-client-id: claude-code
allowedRoutes:
  - /mcp
  - /xql
```

# Data source components

The components represent services outside of a constellation runtime.

## graphql

A standard GraphQL service.

## mcp-server

A standard MCP service.

## rest

A HTTP API service described as in an OpenAPI specification.

## subgraph

A Apollo Federation-compliant GraphQL service.

# Orchestration components

## xql

xQL allows scripting operations and workflows against different kinds of APIs in a declarative, type safe language. xQL operations can be used as MCP tools, and "code mode" allows exposing "list_definitions" and "run_script" for agents with xQL knowledge to dynamically run deterministic workflows.

## virtual-mcp

aggregates tools from multiple MCP servers into one.

## supergraph

Apollo Federation supergraph made up of one or more subgraphs, providing a GraphQL API.

## contract

A filter of a supergraph, limiting exposure.

## graphql operations

A collection of GraphQL operations. Can be used as MCP tools or exposed as a GraphQL API with a limited set of possible operations ("persisted queries" or "trusted documents".)
