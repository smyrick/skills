## First run

```sh
# starts the constellation platform, opens to a browser window viewing a basic environment
constellation start --open

# create a GraphQL component in this directory by introspecting a live API
constellation introspect graphql https://countries.trevorblades.com

# publish that component
constellation publish countries-trevorblades-com
```

The user can use the (+) buttons in the browser to add the component and connect it their runtime ingress.

```sh
curl http://localhost:51100/graphql \
  -H 'content-type: application/json'
  -d '{ countries { name emoji } }'
```

## Environment "monorepo"

You can organize a complete system in one directory with inter-related components. See [examples/xql-mcp-tools](./examples/xql-mcp-tools/). Calling publish on the directory will publish everything at once.

### Dependency tree and routing

The dependency tree determines what is routable. The environment depends on the ingress, and the ingress depends on downstream components **with routes**. Components not reachable from the ingress dependency tree are not routable.

**Critical pattern**: The environment should only depend on `./ingress`. The ingress then depends on downstream components (like virtual-mcp, supergraph, graphql) with `route` config. Other components are pulled in transitively.

```yaml
# environment constellation.yaml — only depends on ingress
name: dev
type: environment@1
dependencies:
  ./ingress: {}

# ingress/constellation.yaml — routes to downstream components
name: ingress
type: ingress@1
dependencies:
  ../virtual-mcp:
    route:
      path: /mcp
      strategy: prefix
```

Do NOT add all components as flat dependencies of the environment. The ingress is the entry point and its dependencies define the routing table.

## Verification

After publishing, use `fastmcp` (via `uvx`) to verify MCP tools are working. The `-t http` flag is required for constellation's streamable HTTP transport.

```sh
# List available tools
uvx fastmcp list --server-spec http://localhost:51100/mcp -t http

# Call a tool
uvx fastmcp call --server-spec http://localhost:51100/mcp -t http --target "namespace::toolName" argName=argValue
```

## Publishing a single component

A team that owns an API can publish a component for their service for other components to consume.
