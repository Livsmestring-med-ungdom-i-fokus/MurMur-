# MurMur Motion Avatar v0.2

TypeScript monorepo for a modular AI motion-control system for artist avatars in **ID / Mirror / Free / Performance Sync** modes.

## Structure

- `apps/web`: Vite + React studio UI with Three.js `AvatarCanvas`, mode switcher, event monitor, simulation controls, and websocket stream.
- `apps/api`: Express API with routes for sessions, events, agents, motion fusion, style profile, and health.
- `packages/shared`: Reusable types, event schemas, and a type-safe event bus.
- `packages/agents`: Starter agents (`style-agent`, `rhythm-agent`, `physics-agent`) using shared contracts.
- `packages/cognitive-core`: Mode-aware fusion + session memory core.
- `packages/motion-planner`: Translates fused output into avatar rig targets.

## Endpoints

- `POST /sessions`
- `GET /sessions/:id`
- `PATCH /sessions/:id/mode`
- `POST /events/ingest`
- `POST /agents/evaluate`
- `POST /motion/fuse`
- `GET /profiles/:artistId/style`
- `GET /health`
- `WS /ws` (real-time agent-output stream)

## Quick start

```bash
pnpm install
pnpm dev
```

- API runs on `http://localhost:4000`
- Web app runs on `http://localhost:5173`

## Notes

- Runtime AI logic is intentionally placeholder-based for MVP.
- Input is simulated with generated audio events until real pose/audio capture is wired in.
