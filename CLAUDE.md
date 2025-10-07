# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React 19 + TypeScript portfolio web application showcasing three main sections:

- **TaskManager** - Integration with C#/.NET task management API (runs on `http://localhost:5000`)
- **CLAI** - Integration with Rust/Axum chat interface with Claude AI (runs on `http://localhost:3500`)
- **CV** - Interactive, printable resume/CV component

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (runs on http://localhost:5173)
pnpm dev

# Type-check code
pnpm typecheck

# Type-check and build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Format code with Prettier (includes Tailwind class sorting)
pnpm format
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
- `/cv` - Interactive CV/resume

### Component Organization

```
components/
├── layout/       # Layout components (header, navigation)
├── taskmanager/  # TaskManager-specific UI components
├── clai/         # CLAI chat-specific UI components
├── cv/           # CV components (sidebar, main sections)
│   ├── sidebar/  # Sidebar: header, contact, education, skills
│   └── main/     # Main: about, work experience, projects, references
└── ui/           # shadcn/ui components (button, card, etc.)
```

Each feature area has dedicated components. CV components maintain a two-panel layout structure.

## Key Technical Details

- **Build tool**: Vite with React plugin and Tailwind CSS v4
- **TypeScript**: Project references architecture (tsconfig.app.json, tsconfig.node.json)
- **ESLint**: Flat config with TypeScript, React Hooks, and React Refresh plugins
- **Styling**:
  - Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin)
  - shadcn/ui components for consistent UI
  - Montserrat font family (Google Fonts)
- **Path aliases**: `@/*` maps to `./src/*` (configured in vite.config.ts and tsconfig)
- **Code formatting**: Prettier with `prettier-plugin-tailwindcss` for automatic class sorting

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

## CV/Resume Section

The `/cv` route displays an interactive, printable CV with a two-panel layout:

- **Sidebar** (left, dark background): Header, contact info, education, skills
- **Main** (right, light background): About, work experience, projects, references

**Print/PDF Support:**
- Print styles in `src/index.css` preserve the two-panel layout for A4 PDFs
- Use Ctrl+P/Cmd+P to print or save as PDF
- Navigation and non-CV elements are hidden when printing
- Page margins set to 0 for edge-to-edge printing

## Deployment

Designed for Cloudflare Pages deployment via GitHub Actions:

- **Build command**: `pnpm build`
- **Output directory**: `dist`
- **GitHub workflow**: `.github/workflows/deploy.yml` automates deployment on push to `main`
- **Required secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Environment variables**: Set in Cloudflare dashboard (VITE_TASK_API_URL, VITE_CLAI_API_URL)
- See `DEPLOYMENT.md` for full setup guide including CORS configuration
