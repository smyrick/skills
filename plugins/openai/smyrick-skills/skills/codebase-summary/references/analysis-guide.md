# Architecture Analysis Guide

Read this guide for repository-wide architecture analysis. Skip irrelevant sections for narrow questions.

## Contents

- Repository orientation
- Entry points and interfaces
- Modules and data flow
- Operations and quality
- Diagram selection

## Repository orientation

Start with repository guidance and existing documentation. Inspect manifests and build configuration to establish:

- repository shape: single package, monorepo, services, library, CLI, or application;
- primary languages, runtimes, frameworks, and package boundaries;
- documented development, test, build, and deployment commands;
- generated, vendored, fixture, and build-output directories to exclude from analysis.

Use manifests and executable configuration as evidence. Treat README or design prose as a claim to verify when code or configuration can disagree.

## Entry points and interfaces

Trace from configured entry points rather than relying only on conventional filenames.

Look for:

- manifest `main`, `bin`, scripts, workspace, or plugin declarations;
- application bootstrap functions and executable packages;
- HTTP routes, GraphQL schemas, RPC services, webhooks, or event consumers;
- CLI command registration and argument parsing;
- exported library surfaces;
- UI routes and root components;
- workers, scheduled jobs, migrations, and serverless handlers;
- container entry points and deployment commands.

For each interface, record who calls it, how it is invoked, its authentication boundary when visible, and the first internal module it reaches.

## Modules and data flow

Infer module boundaries from package structure, public exports, imports, dependency injection, and tests. Classify only when the distinction is supported:

- delivery or presentation;
- application or orchestration;
- domain or business logic;
- persistence and data models;
- external adapters and integrations;
- configuration and shared infrastructure.

Trace one or two representative paths end to end. Examples include request → handler → service → repository → database, event → consumer → processor → publisher, or UI action → state → API → rendered result.

Record directional dependencies and important state transitions. Label architectural patterns as inferred unless the repository names them explicitly.

## Operations and quality

Inspect these areas only when they help answer the request or match the chosen artifact depth:

- database schemas and migrations;
- caches, queues, object stores, and third-party services;
- authentication, authorization, and trust boundaries;
- environment-variable names and configuration sources, without exposing values;
- unit, integration, end-to-end, and contract-test layout;
- build, packaging, release, observability, and deployment configuration.

Tests often provide the clearest evidence for intended public behavior. Cite the implementation and its tests when both are material.

## Diagram selection

Use the fewest diagrams that clarify the architecture:

- **High level:** clients, runnable units, data stores, and external services.
- **Execution flow:** one representative request, command, event, or UI interaction.
- **Module dependencies:** major internal boundaries and dependency direction.

Omit a diagram when a short table communicates the same information more clearly. Keep labels repository-specific and attach visible evidence near the diagram.
