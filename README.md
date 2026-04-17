# Parking Control

React + TypeScript + Vite app with Supabase backend.

## Tech Stack

- React 19 + TypeScript 6.0.2
- Vite 8
- Tailwind v4
- shadcn/ui (radix-nova style)
- Supabase
- Zustand (state management)
- React Router v7
- React Query

## Development

```bash
pnpm dev      # Start dev server
pnpm build    # Typecheck + build
pnpm lint     # Run ESLint
pnpm preview  # Preview production build
```

## Project Structure

- `src/application/` - Application logic, stores
- `src/config/` - Configuration
- `src/core/` - Core utilities
- `src/infrastructure/` - External services (Supabase)
- `src/layouts/` - Layout components
- `src/pages/` - Page components
- `src/presentation/components/` - UI components
- `src/routes/` - Route definitions
- `db/parking-control.sql` - Database schema
