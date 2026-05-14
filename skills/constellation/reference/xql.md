# xQL Language Reference

xQL is a GraphQL-inspired language for shaping API responses and orchestrating multi-step workflows across APIs. It replaces scattered integration glue with declarative, analyzable plans.

**xQL is NOT GraphQL.** Key syntax differences below.

## xQL vs GraphQL

| Concept | GraphQL | xQL |
|---------|---------|-----|
| Alias/rename | `alias: field` | `alias = .field` |
| Type annotation | `field: Type!` | `field: Type` (non-null by default) |
| Nullable | implicit | `field: Type?` (explicit `?`) |
| Arguments | `field(arg: value)` | `field(arg = value)` |
| Non-null | `Type!` | `Type` (`!` does not exist) |
| String interpolation | N/A | `"hello {$name}"` |
| Projection | N/A | `value -> { ... }` |

**Most common mistake**: using `:` for aliases. In xQL, `:` is ONLY for type annotations. Use `=` for computed/aliased fields.

## Core Model

- Values: immutable records, lists, scalars (`String`, `Int`, `Float`, `Boolean`, `Decimal`, `ID`, `Url`, `Email`), `null`.
- Selection bodies map focus (`.`) to output. Contributions merge by key (deep-merge, not last-wins).
- Focus: `.` (current), `^.` (parent), `^^.` (grandparent).
- `=` for bindings/computed fields. `:` for type annotations only.

## Source Modes

- **Document mode**: top-level declarations (`namespace`, `op`, `fragment`, `let`, `import schema`, etc.).
- **Script mode**: statements/expressions only; last expression is result.

## Declarations

```xql
namespace travel                          # namespace
scalar Currency                           # custom scalar
interface Money { amount: Decimal }       # structural type
entity Hotel(id: String)                  # nominal identity
entity Flight(airline: String number: String)  # composite key

fragment HotelCard on { kind: "hotel" } { # reusable selection with guard
  name starRating
}

op getHotel($id: String) { ... }          # operation
mutating op bookTrip(...) { ... }         # side-effecting operation
@tool op searchHotels($q: String) { ... } # AI-tool-eligible op

service http::Service { ... }             # service type
let &api = http::Service { baseUrl = "..." }  # service binding
fetch Hotel(id: String) { ... }           # entity fetcher
import schema from &api { ... }           # schema import
extension on Hotel { ... }                # entity extension
```

## Dependency URLs

When an xQL component depends on a data source (graphql, rest) via a namespace dependency, the runtime auto-injects the data source's `config.url` as `env::__DEPENDENCY_URL__{NAMESPACE}` (uppercased). **Always use this convention** instead of hardcoding URLs — it keeps URLs in sync with component config.

```yaml
# xql/constellation.yaml
dependencies:
  ../my-graphql-api:
    namespace: products    # → env::__DEPENDENCY_URL__PRODUCTS
  ../my-rest-api:
    namespace: reviews     # → env::__DEPENDENCY_URL__REVIEWS
```

```xql
# In xQL, reference the auto-injected URL:
let &api = graphql::Service {
  # This variable automatically resolves to the config.url of the dependency
  url = env::__DEPENDENCY_URL__PRODUCTS
}
```

## HTTP Service Calls

Call transport methods directly, then decode with projection. **Never use `query using` for HTTP.**

```xql
namespace sample

let &api = http::Service {
  baseUrl = env::__DEPENDENCY_URL__REVIEWS
}

op getItems($collection: String, $limit: Int = 10) {
  return &api::get(
    path = "collections/{$collection}/items",
    query = { limit = $limit }
  ) -> {
    data: [] {
      id: String
      label: String
      status: String?
    }
  }
}
```

## GraphQL Service Calls

Schema import + `query using` for provider-backed selections.

```xql
namespace sample

let &api = graphql::Service {
  url = env::__DEPENDENCY_URL__SAMPLE
}

import schema from &api {
  Query { repository search }
  Repository { id name nameWithOwner stargazerCount }
}

op getRepo($owner: String, $name: String) {
  return query using &api {
    repository(owner = $owner, name = $name) {
      nameWithOwner
      stargazerCount
    }
  }
}
```

## Selection Bodies

### Copy Forms

| Form | Meaning |
|------|---------|
| `field` | Copy `.field` to output |
| `field?` | Guarded copy — omit when absent |
| `field: Type` | Typed copy |
| `field { ... }` | Nested shaping of `.field` |
| `field? { ... }` | Guarded nested shaping |
| `field: [] { ... }` | Typed list with element shaping |

### Computed Forms

| Form | Meaning |
|------|---------|
| `field = expr` | Computed/aliased field |
| `field? = expr` | Omit on absence |
| `field: Type = expr` | Typed computed field |

### Local Bindings (not emitted to output)

```xql
$tmp = expr
$tmp: Type = expr
```

### Spreads and Guards

| Form | Meaning |
|------|---------|
| `...` | Rest copy (all remaining fields) |
| `...Fragment` | Fragment spread |
| `...Fragment(arg = val)` | Parameterized spread |
| `... on Guard { ... }` | Guarded contribution |
| `...expr { ... }` | Expression spread with shaping |

### Projection

```xql
value -> { ... }     # apply selection body; maps lists elementwise
value ->? { ... }    # filter-map; drops null/absent results
```

## Expressions

### Field Access and Optional Chaining

```xql
.field                # required read (Missing if absent)
.field?.nested        # optional chain (Absent if missing/null)
.items[0]             # subscript (Int for lists, String for records)
.items[]              # flatten one level
.items?[0]            # optional subscript
```

### String Interpolation

```xql
"{.hotel.name} · {.hotel.location.city}"
```

### Conditionals

```xql
tier = if .stars >= 4 { "premium" } else { "standard" }
```

### Collecting For

```xql
let $badges = for $offer in $offers {
  if $offer.price < 200 {
    { label = "budget" token = $offer.bookingToken }
  }
}
```

### Nullish Coalescing

```xql
city = .address?.city ?? "unknown"
```

## Presence and Errors

xQL distinguishes presence from nullability:
- **Value**: normal result
- **Absent**: expected absence (guarded copy, optional chain)
- **Missing**: required field not found
- **Error**: non-presence failure

```xql
.field          # Missing if absent
.field?         # Absent if missing/null
expr ?? fallback  # fallback for null/absent/missing
expr ->? { ... }  # drops null/absent results
try { expr } catch { recovery }  # catches Errors only
```

Materialized output separates `data` (shaped output, failed fields omitted) from `errors` (unhandled issues with paths).

## Identity and Entities

```xql
entity Hotel(id: String)

# Construct entity reference
let $hotel = innkeeper::Hotel(id = .hotelId)

# Construct and shape
hotel = innkeeper::Hotel(id = .hotelId) -> {
  id
  name = ^.hotel.name
}

# Identity test
.offer is innkeeper::Hotel(id)   # boolean
```

### Entity Fetchers

```xql
fetch Hotel(id: String) {
  return &api::get(url = "/hotels/{.id}") -> {
    id: String
    name: String
    address: String
  }
}
```

### Entity Queries

```xql
let $details = query $hotel {
  id name address amenities
}
let $name = query $hotel.name   # shorthand
```

## Query Forms

| Form | Use |
|------|-----|
| `query using &provider { ... }` | Schema-scope query (GraphQL) |
| `query $entity { ... }` | Entity-root query via fetchers |
| `query $entity.field` | Shorthand single-field query |

**`query using` is the ONLY form for schema-backed queries. Never use it for HTTP calls.**

## Providers and Extensions

### Schema Import

```xql
import schema from &api {
  Query { repository search }
  Repository { id name stargazerCount owner { login } }
}
```

### Entity Extensions

```xql
extension on Hotel {
  popularityTier: String =
    if .stargazerCount >= 5000 { "high" } else { "emerging" }

  weather($days: Int): [{ date: String summary: String }] =
    meteo::forecastDaily(placeName = .city, days = $days)
      .days -> { date: String summary: String }
}
```

### Service Extensions

```xql
extension oauth::ClientCredentials on http::Service {
  tokenUrl: String
  clientId: String
  clientSecret: String
}

let &api = http::Service {
  baseUrl = "https://weather.example"
  with oauth::ClientCredentials {
    tokenUrl = "https://auth.example/token"
    clientId = env::CLIENT_ID
    clientSecret = env::CLIENT_SECRET
  }
}
```

## Guards and Conditional Contribution

### Structural Guards

```xql
{
  kind
  ... on { kind: "flight" } { itinerary { segments } }
  ... on { kind: "hotel" } { hotel { name city } }
}
```

### Nominal Guards (from imported schemas)

```xql
query using &api {
  search(query = "xql") {
    nodes {
      ... on Repository { name = .nameWithOwner }
      ... on User { login }
    }
  }
}
```

### Entity-Key Guards

```xql
... on innkeeper::Hotel(id) { hotelName = .name }
```

### Exclusive Choice

```xql
oneof {
  on { kind: "flight" } { summary = "flight" }
  on { kind: "hotel" } { summary = "hotel" }
  else { summary = "unknown" }
}
```

`oneof` is strict: exactly one arm must match. Multiple matches = `ONEOF_AMBIGUOUS`. Zero = `ONEOF_NO_MATCH`.

## Orchestration (Op Bodies)

Plans describe intent and dependencies. Runtime schedules concurrently when possible.

### Bindings

```xql
let $x = expr          # immediate, immutable
let $y                  # deferred — assigned once later
var $z = expr           # mutable
$z = newValue           # reassignment
```

### Phase Barrier (`then`)

Everything before `then` must complete before anything after begins.

```xql
let $hold1 = createFlightHold(token = $t1)
let $hold2 = createHotelHold(token = $t2)

then {
  let $confirm1 = confirmFlight(holdToken = $hold1.holdToken)
  let $confirm2 = confirmHotel(holdToken = $hold2.holdToken)
}
```

### Cleanup

```xql
defer { releaseLock(id = $lock.id) }         # always runs (like finally)
compensate { cancelHold(token = $hold.token) } # runs only on failure (rollback)
```

Compensations run in reverse registration order on failure.

### Yield (Streaming)

```xql
yield { status = "holds_created" }
then { ... }
```

### Full Orchestration Example

```xql
@tool op bookTrip(
  $customer: accounts::Customer(id),
  $flightToken: String,
  $hotelToken: String,
  $paymentId: String
) {
  let $flight = aero::createFlightHold(offerToken = $flightToken)
  compensate { aero::cancelFlightHold(holdToken = $flight.holdToken) }

  let $hotel = innkeeper::createHotelHold(bookingToken = $hotelToken)
  compensate { innkeeper::cancelHotelHold(holdToken = $hotel.holdToken) }

  let $auth = payments::authorize(
    paymentMethodId = $paymentId
    flightTotal = $flight.totalAmount
    hotelTotal = $hotel.totalAmount
  )
  compensate { payments::voidAuthorization(authorizationId = $auth.authorizationId) }

  let $flightBooking
  let $hotelBooking

  then {
    $flightBooking = aero::confirmFlight(holdToken = $flight.holdToken)
    $hotelBooking = innkeeper::confirmHotel(holdToken = $hotel.holdToken)
  }

  return { customer = $customer flight = $flightBooking hotel = $hotelBooking }
}
```

## `@tool` Directive

Exposes an op as an MCP tool for AI agents. Add doc strings for tool/parameter descriptions.

```xql
"""Look up current order status by ID."""
@tool op getOrderStatus(
  "The order identifier, e.g. 'ORD-12345'."
  $orderId: String
) {
  return &api::get(path = "/orders/{$orderId}") -> {
    id: String
    status: String
    updatedAt: String
  }
}
```

## Fragments

```xql
fragment Money {
  totalAmount
  currency
}

fragment HotelCard($label: String) on { kind: "hotel" } {
  title = $label
  name
  starRating
}

# Usage:
price { ...Money }
...HotelCard(label = "Featured")
```

## Anti-Patterns

1. **`query using` for HTTP** — use `&binding::method(...)` directly
2. **`:` for aliases** — use `=` (`fullName = .user.name`, not `fullName: .user.name`)
3. **`:` for arguments** — use `=` (`items(limit = 10)`, not `items(limit: 10)`)
4. **Bare postfix selection** — use `->` (`value -> { ... }`, not `value { ... }`)
5. **`?` for optional params** — use defaults (`$p: String = "default"`, not `$p?: String`)
6. **`!` for non-null** — types are non-null by default; `!` doesn't exist
7. **Explicit op return types** — omit unless specifically requested
