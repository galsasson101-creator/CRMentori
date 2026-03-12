# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRMentori is a CRM (Customer Relationship Management) application with a monorepo structure containing a React client and an Express server.

## Commands

### Development
```bash
npm run install:all    # Install all dependencies (root + client + server)
npm run dev            # Start both client and server concurrently
npm run dev:client     # Start only the Vite dev server (client/)
npm run dev:server     # Start only the Express server with nodemon (server/)
```

### Build
```bash
cd client && npm run build    # Build client for production
```

### Seed Data
```bash
cd server && npm run seed     # Populate server/data/ JSON files with sample data
```

## Architecture

### Monorepo Layout
- **`client/`** — React 18 SPA using Vite, Tailwind CSS, React Router
- **`server/`** — Express API server (CommonJS), no database — uses JSON files in `server/data/`

### Server
- **DAL (Data Access Layer):** `server/dal/` — `BaseRepository` provides file-backed CRUD using JSON files in `server/data/`. Entity repositories (DealRepository, UserRepository, etc.) extend BaseRepository.
- **Routes:** `server/routes/` — REST endpoints mounted at `/api/{resource}` (deals, users, contacts, tasks, comms, activities, dashboard).
- **Middleware:** `server/middleware/` — logger and error handler.
- Server runs on port 3001 by default.

### Client
- **Routing:** `client/src/App.jsx` — React Router with routes: `/` (dashboard), `/pipelines`, `/users`, `/users/:id`, `/tasks`, `/comms`.
- **API layer:** `client/src/lib/api.js` — thin fetch wrapper; all requests go to `/api` which Vite proxies to `localhost:3001`.
- **Data fetching:** `client/src/hooks/useApi.js` — hook wrapping async fetch with loading/error/refetch state.
- **State:** `client/src/context/AppContext.jsx` — global context for sidebar state, search query, and current user (currently hardcoded mock).
- **Board views:** `client/src/components/board/` — reusable table and kanban views using @dnd-kit for drag-and-drop.
- **Page structure:** Each page in `client/src/pages/{feature}/` typically has a main page component, column definitions, and a detail panel.
- **Styling:** Tailwind CSS with custom theme colors defined in `client/tailwind.config.js` (navy, surface, success, info, warning, danger, purple).
- **Icons:** lucide-react. **Charts:** recharts.

### MongoDB
- **Connection:** Users collection is connected to MongoDB Atlas (`server/.env` has the URI). Mongoose model in `server/models/User.js`.
- **Read-only access:** No modifications to MongoDB data — only data retrieval. Do not create, update, or delete documents in MongoDB.
