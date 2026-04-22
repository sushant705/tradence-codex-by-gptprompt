# Workflow Designer System (React + TypeScript)

A modular foundation for building a production-grade workflow designer, including:

- a reusable workflow canvas abstraction on top of React Flow,
- a schema-driven dynamic node configuration form system,
- a replaceable API layer (mock + HTTP adapters), and
- a pure TypeScript workflow simulation engine.

---

## Project overview

This project provides core building blocks for a visual workflow product where users can:

1. Design workflows as graphs (nodes + edges),
2. Configure node behavior through dynamic forms,
3. Simulate execution before publishing, and
4. Integrate with backend APIs via clear contracts.

The code prioritizes **separation of concerns**, **strong typing**, and **replaceable infrastructure** so teams can iterate safely as requirements grow.

---

## Architecture

The codebase is organized into feature modules under `src/modules`, with each module owning its own types, logic, and public exports.

### 1) `workflow-canvas`
- Encapsulates React Flow integration in `useWorkflowCanvas`.
- Exposes a presentational `WorkflowCanvas` component.
- Handles node/edge add, connect, and delete operations.

### 2) `node-config-form`
- Schema-first form engine for node configuration.
- Supports static and async field options.
- Supports dynamic fields resolved at runtime.
- Includes controlled field rendering + validation.

### 3) `workflow-api`
- Defines `WorkflowApi` contract (`getAutomations`, `simulateAutomation`).
- Includes `MockWorkflowApi` for local development.
- Includes `HttpWorkflowApi` for real backend integration.
- Uses provider + hooks (`useAutomations`, `useSimulation`) for clean React consumption.

### 4) `workflow-simulation`
- Pure domain logic for workflow validation + simulation.
- Validates graph quality (cycles, missing connections, start constraints).
- Executes node handlers step-by-step and returns structured logs.

---

## Folder structure

```txt
src/
  modules/
    node-config-form/
      DynamicNodeConfigForm.tsx
      FieldRenderer.tsx
      schemaRegistry.ts
      types.ts
      useDynamicNodeForm.ts
      index.ts

    workflow-api/
      contracts.ts
      factory.ts
      httpWorkflowApi.ts
      mockWorkflowApi.ts
      provider.tsx
      hooks.ts
      types.ts
      WorkflowApiIntegrationExample.tsx
      index.ts

    workflow-canvas/
      WorkflowCanvas.tsx
      useWorkflowCanvas.ts
      types.ts
      index.ts

    workflow-simulation/
      engine.ts
      handlers.ts
      validation.ts
      types.ts
      index.ts
```

---

## Key design decisions

- **Contract-first API design**: React components depend on `WorkflowApi` interface, not concrete transport implementations.
- **Schema-driven forms**: Node configuration forms are generated from declarative schema metadata.
- **UI-independent simulation engine**: Simulation logic is pure TypeScript and testable without React.
- **Module-level encapsulation**: Each feature module exposes a clean public API through `index.ts`.
- **Strict typing**: Core operations and payloads are explicitly typed to reduce runtime ambiguity.

---

## Trade-offs (time constraints)

To deliver quickly, this foundation intentionally keeps some areas lightweight:

- No production styling/design-system integration yet.
- No formal test suite yet (unit/integration/e2e).
- Limited runtime schema/version migration support.
- No persistent storage layer wiring in this repo.
- Basic mock data realism (sufficient for development workflows).

These trade-offs keep momentum while preserving a scalable architecture for incremental hardening.

---

## How to run the project

### Prerequisites
- Node.js 20+
- npm 10+

### Run locally
```bash
npm install
npm run dev
```

Open the URL shown by Vite (default: `http://localhost:5173`).

### Useful commands
```bash
npm run typecheck
npm run build
npm run preview
```

---

## Future improvements

1. Add full automated test coverage:
   - simulation unit tests,
   - form engine behavior tests,
   - API hook integration tests.
2. Introduce module-internal layering (`domain`, `application`, `infrastructure`, `ui`) as complexity grows.
3. Add observability hooks (logging/telemetry) for simulation and API calls.
4. Add node plugin system for external node packages.
5. Add persistence + versioning strategy for workflow definitions.
6. Optimize dynamic form option loading with cancellation, caching, and debouncing.
7. Strengthen simulation semantics (branch conditions, retries, timeout semantics, partial outcomes).

---

## License

Internal / project-specific.
