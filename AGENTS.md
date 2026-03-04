# AGENTS.md

## Project Context

- This repository publishes `caffeine`, a browser extension that prevents your screen from dimming or going to sleep, using the modern Screen Wake Lock API.
- The extension is built with WXT (Next-gen framework for browser extensions), React, and Tailwind CSS.
- Package manager: `pnpm`
- Preferred local runtime: Node.js `v24.x` or later.

## Repository Map

- `src/entrypoints/`: Contains WXT entrypoints (popup, background, content scripts, etc.).
- `src/utils/`: Shared utilities and helpers.
- `src/types.ts`: Shared TypeScript types for the extension.
- `wxt.config.ts`: WXT and Vite build configuration.
- `package.json`: Main project configuration, scripts, and dependencies.
- `oxlint.json`, `.oxfmtrc.json`: Oxlint and Oxfmt configuration for linting and formatting.
- `vitest.config.ts`, `vitest.setup.ts`: Vitest configuration and initialization.
- `.github/workflows/ci.yml`: CI checking automation.
- `.github/workflows/release-please.yml`: Release automation.
- `release-please-config.json` and `.release-please-manifest.json`: release-please versioning and changelog config.
- `README.md`: Public documentation and build/dev instructions.

## Working Rules For Agents

- Keep changes aligned with the WXT extension framework constraints and the Screen Wake Lock API standard behavior.
- Treat `README.md` as part of the public contract. If build instructions or extension behavior change, update it.
- Ensure cross-browser extension support (Chrome, Firefox Android/Desktop).
- Validate changes via development servers before concluding (`pnpm dev`, `pnpm dev:firefox`, etc.).
- Do not commit built output in `.output/` unless the user explicitly asks for it.
- Prefer `pnpm` commands over `npm` or `yarn` (e.g., `pnpm install`, `pnpm test`, `pnpm build`).

## Validation

Use the smallest relevant set of checks for the change:

- `pnpm fmt` or `pnpm fmt:check` for code formatting (oxfmt)
- `pnpm lint` or `pnpm lint:fix` for code linting (oxlint)
- `pnpm test` for Vitest tests
- `pnpm compile` for TypeScript checks (`tsc --noEmit`)
- `pnpm build` or `pnpm build:firefox` when explicitly checking extension artifact compilation

## Release Flow

- `release-please` owns version bumps and changelog updates.
- `.github/workflows/release-please.yml` runs on pushes to `main` and maintains the release PR.
- Merging the release PR creates the tag and a draft GitHub release.

## Commit And PR Conventions

- Use Conventional Commits for all commit messages and PR titles.
- Prefer squash merge commit titles that also follow Conventional Commits, because release automation and changelog quality depend on clear commit history.
- Use one of these types when the change should appear in release notes:
  - `feat`: new user-facing functionality
  - `fix`: bug fixes
  - `perf`: performance improvements
  - `refactor`: internal changes that should appear under `Changed`
  - `deps`: dependency updates that should appear under `Changed`
- Use `chore`, `docs`, `test`, and `ci` for changes that should not trigger a release by themselves.

## Format

- Use `type: short summary`
- Optional scope is allowed: `type(scope): short summary`
- Breaking changes must use `!` or a `BREAKING CHANGE:` footer

## Examples

- `feat: add rule-based activation for specific urls`
- `fix: correctly request wake lock immediately when activated`
- `perf: optimize React renders in popup`
- `refactor: simplify wake lock manager helpers`
- `deps: update wxt to latest compatible version`
- `docs: clarify firefox for android testing command`

## Release Notes Mapping

- `feat` -> `Added`
- `fix` -> `Fixed`
- `perf`, `refactor`, `deps` -> `Changed`

## Notes For Agents

- Do not use emoji prefixes in commit messages or PR titles.
- Do not invent non-standard types when a standard type fits.
- If a change is not releasable, prefer `chore`, `docs`, `test`, or `ci`.
