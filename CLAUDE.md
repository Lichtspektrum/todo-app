# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Type-check + production build (output: dist/)
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

Run tests with `npm test` (Vitest). Test file: `src/hooks/useTodos.test.ts`.

## Architecture

State is managed entirely in `src/hooks/useTodos.ts` — a single custom hook that owns the `Todo[]` array and persists it to `localStorage`. All CRUD operations (add, toggle, delete, updateText, updatePriority, updateDueDate, clearDone, reorderTodos) live here. `App.tsx` consumes this hook and handles filtering, list-tab selection, sort mode, and dnd-kit drag-and-drop orchestration.

**Data model** (`src/types.ts`):
- `Todo`: `{ id, text, done, priority, list, dueDate? }`
- `Priority`: `'high' | 'medium' | 'low'`
- `List`: `'work' | 'life'`
- `Filter`: `'all' | 'active' | 'done'`

**Contexts:**
- `LangContext` — wraps the app in `LangProvider`, exposes `{ lang, t, toggleLang }`. Use the `useLang()` hook and `t.<key>` for all UI strings.
- `ThemeContext` — wraps in `ThemeProvider`; `Header` consumes it directly. Theme is **two orthogonal axes**:
  - `brand`: `'anthropic' | 'nothing'` — visual identity (color palette, fonts, dot-grid pattern, border-radius)
  - `mode`: `'light' | 'dark'` — light/dark scheme
  - API: `{ brand, mode, toggleBrand, toggleMode }`. Both toggles take optional `(originX, originY)` and trigger a View Transitions API circular ripple from that point.
  - Persisted as separate `brand` / `mode` keys in `localStorage`; on first load, migrates the legacy single `theme` key (`'light'|'dark'|'nothing'`) if present, else falls back to `prefers-color-scheme` for `mode`.
  - Driven by `data-brand` and `data-mode` attributes on `<html>`. CSS selectors layer them: `[data-mode="dark"]`, `[data-brand="nothing"]`, `[data-brand="nothing"][data-mode="dark"]`.

**i18n** (`src/i18n.ts`): All strings live in the `translations` object (`zh` / `en`). Adding a new string requires entries in both languages. The `t` object from `useLang()` is typed directly from `translations`, so TypeScript enforces completeness.

**PWA** (`vite.config.ts`): `vite-plugin-pwa` with `registerType: 'autoUpdate'`. Manifest is hand-written at `public/manifest.json` (plugin's `manifest: false`); icons live in `public/icons/`. Workbox precaches all `js/css/html/ico/png/svg/woff2` and runtime-caches Google Fonts (`CacheFirst`, 1-year). `devOptions.enabled: true` — service worker runs in dev too, so a hard-reload may be needed after CSS/JS changes.

**Drag-and-drop**: dnd-kit's `DndContext` + `SortableContext` wrap the todo list. Reordering only works when `filter === 'all'` and `listTab === 'all'`; date-sort mode disables it. The `DragOverlay` renders a floating clone during drag.

**Filtering/sorting** (`App.tsx`): `visibleTodos` is a `useMemo` that chains list-tab filter → status filter → optional date sort. `scopedTodos` (for progress bar / stats) applies only the list-tab filter.
