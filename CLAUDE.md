# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React 19 + TypeScript portfolio web application that showcases two backend projects:

- **TaskManager** - C#/.NET task management API (runs on `http://localhost:5000`)
- **CLAI** - Rust/Axum chat interface with Claude AI (runs on `http://localhost:3500`)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (runs on http://localhost:5173)
pnpm dev

# Type-check and build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Environment Variables

Copy `.env.example` to `.env` before starting. The application requires:

- `VITE_TASK_API_URL` - TaskManager API endpoint (default: http://localhost:5000)
- `VITE_CLAI_API_URL` - CLAI API endpoint (default: http://localhost:3500)

Both backend services must be running for the frontend to function properly.

## Architecture

### API Client Pattern

All backend communication uses a type-safe pattern with Zod validation:

1. **Zod schemas** define request/response shapes (in `src/api/`)
2. **TypeScript types** are inferred from schemas using `z.infer<>`
3. **Generic fetch helper** (`src/lib/api-client.ts`) handles:
   - JSON serialization
   - Error handling with custom `ApiError` class
   - Runtime validation via Zod schemas

Example client structure:

```typescript
// Define schema
const TaskItemSchema = z.object({ ... });

// Infer type
type TaskItem = z.infer<typeof TaskItemSchema>;

// Use with fetchJson helper
export const taskApi = {
  getTasks: async (): Promise<TaskItem[]> => {
    return fetchJson(`${TASK_API}/tasks`, TaskListSchema);
  },
};
```

### Routing and State Management

- **Routing**: Wouter (lightweight alternative to React Router)
- **Server state**: TanStack Query with 5-minute stale time, 1 retry
- **Query client**: Configured in `App.tsx` and wrapped around entire app

Routes:

- `/` - Home page
- `/tasks` - TaskManager interface
- `/chat` - CLAI chat interface

### Component Organization

```
components/
├── layout/       # Layout components (header, navigation)
├── taskmanager/  # TaskManager-specific UI components
└── clai/         # CLAI chat-specific UI components
```

Each feature area (TaskManager, CLAI) has dedicated components in subdirectories.

## Key Technical Details

- **Build tool**: Vite with React plugin and Tailwind CSS v4
- **TypeScript**: Project references architecture (tsconfig.app.json, tsconfig.node.json)
- **ESLint**: Flat config with TypeScript, React Hooks, and React Refresh plugins
- **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin)

## Backend API Integration

### TaskManager API (C#)

- CRUD operations for tasks
- Task filtering and sorting
- Priority levels: Low, Medium, High, Critical
- Task completion marking
- See `src/api/taskManagerClient.ts` for full API surface

### CLAI API (Rust)

- Session management for chat conversations
- Role-playing system (set custom roles for sessions)
- Model selection (different Claude models)
- Message sending with response handling
- See `src/api/claiClient.ts` for full API surface

## Deployment

Designed for Cloudflare Pages deployment:

- Static site generation via Vite
- Environment variables set in Cloudflare dashboard
- No server-side rendering or API routes required (backends run separately)
