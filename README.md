# Portfolio Web App

A React web application showcasing two projects: TaskManager (C#) and CLAI (Rust).

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Zod** - Runtime type validation
- **Tailwind CSS** - Styling (optional, not yet configured)

## Project Structure

```
portfolio/
├── src/
│   ├── api/                    # API clients with Zod schemas
│   │   ├── taskManagerClient.ts
│   │   └── claiClient.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── taskmanager/
│   │   └── clai/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── TaskManager.tsx
│   │   └── ClaiChat.tsx
│   ├── lib/
│   │   └── api-client.ts      # Generic fetch helper
│   └── App.tsx
```

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start dev server
pnpm dev
```

## Backend APIs

This frontend connects to two backend services:

1. **TaskManager API** (C#/.NET) - `http://localhost:5000`
2. **CLAI API** (Rust/Axum) - `http://localhost:3500`

Make sure both backend servers are running before starting the frontend.

## Features

### TaskManager Integration

- View, create, update, and delete tasks
- Filter and sort tasks
- Mark tasks as complete
- Export tasks to various formats

### CLAI Integration

- Chat interface with Claude AI
- Session management
- Role-playing capabilities
- Model selection

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## Deployment

Designed to be deployed on Cloudflare Pages:

- Static site generation with Vite
- Environment variables configured in Cloudflare dashboard
- Serverless functions for API proxying (optional)
