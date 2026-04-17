# AGENTS.md

## Commands

- `pnpm dev` - Start dev server
- `pnpm build` - Run `tsc -b` then `vite build`
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Notes

- Package manager: pnpm (pnpm-lock.yaml present)
- React 19 + TypeScript + Vite
- TypeScript 6.0.2 (older version, notable for strictness quirks)
- Build requires typecheck before build (`tsc -b`)
- No test framework configured
- No pre-commit hooks