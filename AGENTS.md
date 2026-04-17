# AGENTS.md

## Commands

- `pnpm dev` - Start dev server
- `pnpm build` - Run `tsc -b` then `vite build`
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Notes

- Package manager: pnpm
- React 19 + TypeScript 6.0.2 + Vite
- Tailwind v4 (uses `@tailwindcss/vite` plugin)
- shadcn/ui configured (`components.json`, uses radix-nova style, lucide icons)
- `@` alias maps to `./src` (configured in vite.config.ts and tsconfig.json)
- Database: Supabase schema in `db/parking-control.sql`
- Build requires typecheck before build (`tsc -b`)
- No test framework configured
- No pre-commit hooks

## Design System

### Mobile First
- All pages and components must be designed mobile-first
- Use responsive classes: `w-full max-w-sm` for mobile-optimized cards
- Touch-friendly: `h-11` (44px minimum) for inputs and buttons
- Generous padding: `p-4`, `p-6` for comfortable mobile tap targets
- Test on narrow viewports first, then scale up

### Color Palette
- Uses CSS variables defined in `src/index.css`
- Light theme (default): `--primary: oklch(0.205 0 0)`, `--background: oklch(1 0 0)`
- Dark theme: `--primary: oklch(0.922 0 0)`, `--background: oklch(0.145 0 0)`
- Use `bg-primary/10`, `text-muted-foreground/60` for subtle accents
- Error states: `bg-destructive/10`, `border-destructive/20`
- Success states: `bg-green-500/10`, `border-green-500/20`

### UI Patterns (Auth Pages)
- Card with glassmorphism: `bg-card/80 backdrop-blur-xl border-none shadow-2xl`
- Gradient accent bar: `absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/50`
- Input icons: wrap with `relative`, icon absolute at `left-3 top-1/2 -translate-y-1/2`
- Input styling: `h-11 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20`
- Button: `h-11 font-medium text-base hover:scale-[1.02] active:scale-[0.98]`
- Error animation: CSS `@keyframes shake` in index.css
- Background effects: `bg-gradient-to-b`, blur-3xl orbs

### Install New shadcn Components
```bash
pnpm dlx shadcn@latest add <component-name> -y
```