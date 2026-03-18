# Todo App Portfolio Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add polished animations (task complete / delete / add / toast) and engineering quality improvements (unit tests, A11y, useCallback) to make the todo app shine as a portfolio piece.

**Architecture:** Animations use CSS keyframes + React state flags; `useTodos` gains `removingIds`, `startRemoveTodo`, `undoSnapshot`, and `undo`; a `useToast` hook manages a single-slot toast queue; App.tsx wraps delete/clearDone to trigger toast; A11y improvements are additive attribute changes.

**Tech Stack:** React 19, TypeScript, Vite, dnd-kit, Vitest, @testing-library/react, CSS keyframes

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useTodos.ts` | Modify | Add `removingIds`, `startRemoveTodo`, `undoSnapshot`, `undo`, `clearUndo`; wrap all functions in `useCallback` |
| `src/hooks/useTodos.test.ts` | Create | Unit tests: CRUD, undo, reorder, localStorage |
| `src/hooks/useToast.ts` | Create | Single-slot toast queue: show/hide, auto-dismiss (2s), hover-pause |
| `src/components/Toast.tsx` | Create | Toast UI: slide-in from bottom, dismiss button, undo button |
| `src/components/TodoItem.tsx` | Modify | `todo-entering` CSS class for add animation; `data-removing` for delete; complete toggle animation; A11y labels |
| `src/components/Filters.tsx` | Modify | `role="group"`, `aria-label`, `aria-pressed` on filter buttons |
| `src/components/Header.tsx` | Modify | `aria-label` on theme toggle and lang toggle buttons |
| `src/components/InputArea.tsx` | Modify | `aria-label` on input and submit button |
| `src/App.tsx` | Modify | `handleDelete` triggers animation; `handleClearDone` triggers toast; `useCallback` on all handlers; import Toast |
| `src/i18n.ts` | Modify | Add `markAsDone: (text) => string`, `deleteTask: (text) => string` |
| `src/index.css` | Modify | Keyframes: `todo-enter`, `todo-exit-x`, `todo-exit-h`, `toast-in`; complete/done transitions |
| `package.json` | Modify | Add `vitest`, `@testing-library/react`, `@vitest/ui`, `jsdom` |
| `vitest.config.ts` | Create | Vitest config with jsdom environment |

---

## Task 1: Install Vitest and configure test environment

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install test dependencies**

```bash
cd /Users/ifanr/claudeprojects/todo-app
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Expected: packages installed with no peer-dep errors.

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify config works**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx vitest run --reporter=verbose 2>&1 | head -10
```

Expected: "No test files found" (not a crash).

- [ ] **Step 5: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest + testing-library test setup"
```

---

## Task 2: Write useTodos unit tests (existing behavior)

**Files:**
- Create: `src/hooks/useTodos.test.ts`

- [ ] **Step 1: Write the test file**

Create `src/hooks/useTodos.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe('useTodos — existing behavior', () => {
  it('starts with empty list when localStorage is empty', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  it('adds a task to the front of the list', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Buy milk', 'medium', 'life', undefined); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Buy milk');
    expect(result.current.todos[0].done).toBe(false);
    expect(result.current.todos[0].priority).toBe('medium');
  });

  it('adds newest task at the front', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('First', 'low', 'work', undefined); });
    act(() => { result.current.addTodo('Second', 'low', 'work', undefined); });
    expect(result.current.todos[0].text).toBe('Second');
  });

  it('toggles task done state', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[0].done).toBe(true);
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[0].done).toBe(false);
  });

  it('updates task text', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Old text', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updateText(id, 'New text'); });
    expect(result.current.todos[0].text).toBe('New text');
  });

  it('deletes task when updateText receives empty string', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Delete me', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updateText(id, '   '); });
    expect(result.current.todos).toHaveLength(0);
  });

  it('sets priority', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updatePriority(id, 'high'); });
    expect(result.current.todos[0].priority).toBe('high');
  });

  it('sets due date', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updateDueDate(id, '2026-04-01'); });
    expect(result.current.todos[0].dueDate).toBe('2026-04-01');
  });

  it('clears due date', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', '2026-04-01'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updateDueDate(id, undefined); });
    expect(result.current.todos[0].dueDate).toBeUndefined();
  });

  it('reorders todos', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'low', 'life', undefined); });
    act(() => { result.current.addTodo('B', 'low', 'life', undefined); });
    // Currently: [B, A]
    const reordered = [result.current.todos[1], result.current.todos[0]]; // [A, B]
    act(() => { result.current.reorderTodos(reordered); });
    expect(result.current.todos[0].text).toBe('A');
    expect(result.current.todos[1].text).toBe('B');
  });

  it('clears done tasks', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Keep', 'low', 'life', undefined); });
    act(() => { result.current.addTodo('Delete', 'low', 'life', undefined); });
    const doneId = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(doneId); });
    act(() => { result.current.clearDone(); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Keep');
  });

  it('persists to localStorage (debounced)', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Persist me', 'low', 'life', undefined); });
    act(() => { vi.advanceTimersByTime(400); });
    const stored = JSON.parse(localStorageMock.getItem('todos') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe('Persist me');
    vi.useRealTimers();
  });

  it('loads from localStorage on mount', () => {
    localStorageMock.setItem('todos', JSON.stringify([
      { id: '1', text: 'Loaded task', done: false, priority: 'low', list: 'life' }
    ]));
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos[0].text).toBe('Loaded task');
  });
});
```

- [ ] **Step 2: Run tests — expect them to pass**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx vitest run src/hooks/useTodos.test.ts --reporter=verbose
```

Expected: all tests PASS (these test existing behavior).

- [ ] **Step 3: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/hooks/useTodos.test.ts
git commit -m "test: add useTodos unit tests for existing behavior"
```

---

## Task 3: Write failing tests for new useTodos features

**Files:**
- Modify: `src/hooks/useTodos.test.ts`

- [ ] **Step 1: Append new test suite at the bottom of the file**

Add to `src/hooks/useTodos.test.ts`:

```typescript
describe('useTodos — undo (new behavior)', () => {
  it('startRemoveTodo marks id in removingIds without deleting from todos', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.startRemoveTodo(id); });
    expect(result.current.todos).toHaveLength(1); // still in todos
    expect(result.current.removingIds.has(id)).toBe(true);
  });

  it('onRemoveComplete removes task from todos and removingIds', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.startRemoveTodo(id); });
    act(() => { result.current.onRemoveComplete(id); });
    expect(result.current.todos).toHaveLength(0);
    expect(result.current.removingIds.has(id)).toBe(false);
  });

  it('undo after startRemoveTodo restores todos and clears removingIds', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.startRemoveTodo(id); });
    act(() => { result.current.undo(); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.removingIds.size).toBe(0);
  });

  it('undo after clearDone restores done tasks', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Keep', 'low', 'life', undefined); });
    act(() => { result.current.addTodo('Restore', 'low', 'life', undefined); });
    const doneId = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(doneId); });
    act(() => { result.current.clearDone(); });
    expect(result.current.todos).toHaveLength(1);
    act(() => { result.current.undo(); });
    expect(result.current.todos).toHaveLength(2);
  });

  it('undo does nothing if no snapshot exists', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    act(() => { result.current.undo(); }); // no snapshot
    expect(result.current.todos).toHaveLength(1); // unchanged
  });

  it('clearUndo removes the snapshot', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task', 'low', 'life', undefined); });
    const id = result.current.todos[0].id;
    act(() => { result.current.startRemoveTodo(id); });
    act(() => { result.current.clearUndo(); });
    act(() => { result.current.onRemoveComplete(id); });
    // undo now does nothing
    act(() => { result.current.undo(); });
    expect(result.current.todos).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests — expect new suite to FAIL**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx vitest run src/hooks/useTodos.test.ts --reporter=verbose 2>&1 | tail -20
```

Expected: "useTodos — undo" suite FAILS with "result.current.startRemoveTodo is not a function" (or similar).

- [ ] **Step 3: Commit failing tests**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/hooks/useTodos.test.ts
git commit -m "test: add failing tests for useTodos undo/removingIds features"
```

---

## Task 4: Implement useTodos enhancements

**Files:**
- Modify: `src/hooks/useTodos.ts`

- [ ] **Step 1: Rewrite useTodos.ts**

Replace the full content of `src/hooks/useTodos.ts`:

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Todo, Priority, List } from '../types';

function load(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem('todos') || '[]');
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(load);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [undoSnapshot, setUndoSnapshot] = useState<Todo[] | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('todos', JSON.stringify(todos));
      } catch {
        // Storage quota exceeded or unavailable
      }
    }, 300);
    return () => clearTimeout(saveTimer.current);
  }, [todos]);

  const addTodo = useCallback((text: string, priority: Priority, list: List, dueDate?: string) => {
    setTodos(prev => [
      { id: crypto.randomUUID(), text, done: false, priority, list, dueDate },
      ...prev,
    ]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  // Immediate delete — used internally (e.g. updateText with empty string)
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  // Animated delete — marks id in removingIds, saves undo snapshot
  const startRemoveTodo = useCallback((id: string) => {
    setUndoSnapshot(prev => prev ?? null); // will be set below
    setTodos(current => {
      setUndoSnapshot(current); // snapshot before removal
      return current;
    });
    setRemovingIds(prev => new Set([...prev, id]));
  }, []);

  // Called by TodoItem after exit animation completes (or by 300ms fallback timer)
  const onRemoveComplete = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    setRemovingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    if (!text.trim()) {
      deleteTodo(id);
      return;
    }
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: text.trim() } : t));
  }, [deleteTodo]);

  const updatePriority = useCallback((id: string, priority: Priority) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
  }, []);

  const updateDueDate = useCallback((id: string, dueDate: string | undefined) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate } : t));
  }, []);

  // clearDone saves snapshot BEFORE clearing (so undo restores done tasks)
  const clearDone = useCallback(() => {
    setTodos(prev => {
      setUndoSnapshot(prev); // capture before filter
      return prev.filter(t => !t.done);
    });
  }, []);

  const reorderTodos = useCallback((newOrder: Todo[]) => {
    setTodos(newOrder);
  }, []);

  // Restore todos to snapshot state and clear all in-flight removals
  const undo = useCallback(() => {
    setUndoSnapshot(snapshot => {
      if (snapshot) {
        setTodos(snapshot);
        setRemovingIds(new Set());
      }
      return null;
    });
  }, []);

  // Discard snapshot (called when toast auto-dismisses without undo)
  const clearUndo = useCallback(() => {
    setUndoSnapshot(null);
  }, []);

  return {
    todos,
    removingIds,
    addTodo,
    toggleTodo,
    startRemoveTodo,
    onRemoveComplete,
    updateText,
    updatePriority,
    updateDueDate,
    clearDone,
    reorderTodos,
    undo,
    clearUndo,
  };
}
```

- [ ] **Step 2: Run all tests**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx vitest run src/hooks/useTodos.test.ts --reporter=verbose
```

Expected: all tests PASS, including the new "undo" suite.

- [ ] **Step 3: Fix failing tests if any**

If tests fail, read the error message carefully and fix the implementation (not the tests). Re-run until all pass.

- [ ] **Step 4: Type-check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or fix any that appear).

- [ ] **Step 5: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/hooks/useTodos.ts
git commit -m "feat: enhance useTodos with removingIds, undo snapshot, useCallback"
```

---

## Task 5: Create useToast hook

**Files:**
- Create: `src/hooks/useToast.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useToast.ts`:

```typescript
import { useState, useRef, useCallback } from 'react';

export interface ToastPayload {
  message: string;
  onUndo?: () => void;
}

export interface ToastState extends ToastPayload {
  id: number;
}

const TOAST_DURATION = 2000;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const counterRef = useRef(0);

  const startTimer = useCallback((onDismiss?: () => void) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast(null);
      onDismiss?.();
    }, TOAST_DURATION);
  }, []);

  const showToast = useCallback((payload: ToastPayload, onDismiss?: () => void) => {
    clearTimeout(timerRef.current);
    counterRef.current += 1;
    setToast({ ...payload, id: counterRef.current });
    startTimer(onDismiss);
  }, [startTimer]);

  const dismissToast = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const pauseTimer = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  const resumeTimer = useCallback((onDismiss?: () => void) => {
    startTimer(onDismiss);
  }, [startTimer]);

  return { toast, showToast, dismissToast, pauseTimer, resumeTimer };
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/hooks/useToast.ts
git commit -m "feat: add useToast hook for single-slot toast queue"
```

---

## Task 6: Create Toast component

**Files:**
- Create: `src/components/Toast.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/Toast.tsx`:

```typescript
import { useRef } from 'react';
import type { ToastState } from '../hooks/useToast';
import { useLang } from '../contexts/LangContext';

interface Props {
  toast: ToastState | null;
  onDismiss: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Toast({ toast, onDismiss, onMouseEnter, onMouseLeave }: Props) {
  const { t } = useLang();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="toast"
      role="status"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="toast-message">{toast.message}</span>
      <div className="toast-actions">
        {toast.onUndo && (
          <button
            className="toast-undo"
            onClick={() => { toast.onUndo?.(); onDismiss(); }}
            aria-label={t.undoAction}
          >
            {t.undoAction}
          </button>
        )}
        <button
          className="toast-close"
          onClick={onDismiss}
          aria-label={t.dismissToast}
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit (TypeScript errors are expected — i18n keys not added yet)**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/components/Toast.tsx
git commit -m "feat: add Toast component"
```

---

## Task 7: Extend i18n with new strings

**Files:**
- Modify: `src/i18n.ts`

- [ ] **Step 1: Add new fields to translations**

In `src/i18n.ts`, add to the `zh` object (after `dragHandle` / `sortByManual`):

```typescript
    markAsDone: (text: string) => `将「${text}」标记为完成`,
    deleteTask: (text: string) => `删除「${text}」`,
    undoAction: '撤销',
    dismissToast: '关闭',
    toastAdded: '已添加任务',
    toastDeleted: (text: string) => `已删除「${text}」`,
    toastClearedDone: (n: number) => `已清空 ${n} 项已完成任务`,
    switchToLight: '切换到浅色模式',
    switchToDark: '切换到深色模式',
```

Add to the `en` object:

```typescript
    markAsDone: (text: string) => `Mark "${text}" as done`,
    deleteTask: (text: string) => `Delete "${text}"`,
    undoAction: 'Undo',
    dismissToast: 'Dismiss',
    toastAdded: 'Task added',
    toastDeleted: (text: string) => `Deleted "${text}"`,
    toastClearedDone: (n: number) => `Cleared ${n} completed ${n === 1 ? 'task' : 'tasks'}`,
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or fix type mismatches if `t.undoAction` etc. are wrong types).

- [ ] **Step 3: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/i18n.ts
git commit -m "feat: extend i18n with toast, undo, and A11y strings"
```

---

## Task 8: Wire Toast and animated delete into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

In `src/App.tsx`, make the following changes:

**a) Update the useTodos destructure** (add new fields):

```typescript
const {
  todos, addTodo, toggleTodo, startRemoveTodo, onRemoveComplete,
  updateText, updatePriority, updateDueDate, clearDone, reorderTodos,
  undo, clearUndo,
} = useTodos();
```

**b) Add toast hook** (after the useTodos line):

```typescript
import { useToast } from './hooks/useToast';
import { Toast } from './components/Toast';
// ...
const { toast, showToast, dismissToast, pauseTimer, resumeTimer } = useToast();
```

**c) Replace `handleAdd`** with a version that also shows a toast:

```typescript
const handleAdd = useCallback((text: string, priority: Priority, list: List, dueDate?: string) => {
  addTodo(text, priority, list, dueDate);
  if (filter === 'done') setFilter('all');
  showToast({ message: t.toastAdded });
}, [addTodo, filter, showToast, t]);
```

**d) Add `handleDelete`** (new — wraps startRemoveTodo with toast):

```typescript
const handleDelete = useCallback((id: string, text: string) => {
  startRemoveTodo(id);
  showToast(
    {
      message: t.toastDeleted(text),
      onUndo: undo,
    },
    clearUndo,
  );
}, [startRemoveTodo, showToast, t, undo, clearUndo]);
```

**e) Add `handleClearDone`** (new):

```typescript
const handleClearDone = useCallback(() => {
  const doneCount = scopedTodos.filter(t => t.done).length;
  clearDone();
  showToast(
    {
      message: t.toastClearedDone(doneCount),
      onUndo: undo,
    },
    clearUndo,
  );
}, [clearDone, scopedTodos, showToast, t, undo, clearUndo]);
```

**f) Wrap `handleDragStart`, `handleDragEnd`, `setFilter`, `setListTab`, `setSortMode` in `useCallback`** (add `useCallback` import if not already there):

```typescript
const handleDragStart = useCallback((event: DragStartEvent) => {
  setActiveId(event.active.id as string);
}, []);

const handleDragEnd = useCallback((event: DragEndEvent) => {
  const { active, over } = event;
  setActiveId(null);
  if (!over || active.id === over.id || sortMode === 'date') return;
  if (filter !== 'all' || listTab !== 'all') return;
  const oldIndex = todos.findIndex(t => t.id === active.id);
  const newIndex = todos.findIndex(t => t.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;
  reorderTodos(arrayMove(todos, oldIndex, newIndex));
}, [sortMode, filter, listTab, todos, reorderTodos]);
```

**g) Update TodoItem `onDelete` prop** to use the new handler:

```tsx
onDelete={() => handleDelete(todo.id, todo.text)}
```

**h) Update Stats `onClearDone` prop**:

```tsx
<Stats total={scopedTodos.length} done={doneCount} onClearDone={handleClearDone} />
```

**i) Add Toast component before `<Footer />`**:

```tsx
<Toast
  toast={toast}
  onDismiss={() => { dismissToast(); clearUndo(); }}
  onMouseEnter={() => pauseTimer()}
  onMouseLeave={() => resumeTimer(clearUndo)}
/>
<Footer />
```

- [ ] **Step 2: Type-check and fix errors**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit 2>&1
```

Fix any type errors that appear. Note: `switchToLight`/`switchToDark` keys were added in Task 7 — if Header.tsx uses them and you skipped Task 7, type errors will appear here.

- [ ] **Step 3: Run tests to verify existing tests still pass**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx vitest run --reporter=verbose
```

Expected: all tests PASS.

- [ ] **Step 4: Start dev server and manually test toast**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npm run dev
```

Open http://localhost:5173. Add a task → should see "已添加任务" toast. Delete a task → should see "已删除「xxx」" toast with Undo button. Click Undo → task should reappear.

- [ ] **Step 5: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/App.tsx
git commit -m "feat: wire Toast and animated delete into App"
```

---

## Task 9: Add CSS animations

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add keyframes and animation classes to index.css**

Append the following to the end of `src/index.css`:

```css
/* ===== Animations ===== */

/* --- Task enter (new task slides in from top) --- */
@keyframes todo-enter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.todo-entering {
  animation: todo-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* --- Task delete exit (slides right + height collapse) --- */
@keyframes todo-exit-slide {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.todo-item-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 250ms ease;
}

.todo-item-wrapper.removing {
  grid-template-rows: 0fr;
}

.todo-item-wrapper > .todo-item {
  overflow: hidden;
  min-height: 0;
}

.todo-item[data-removing] {
  animation: todo-exit-slide 250ms ease forwards;
}

/* --- Task complete toggle animation --- */
.todo-check {
  transition: background-color 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 200ms ease,
              transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.todo-item.done .todo-check {
  transform: scale(1.1);
  animation: check-bounce 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes check-bounce {
  0%   { transform: scale(0.8); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1.0); }
}

.todo-text {
  transition: color 250ms ease, text-decoration-color 250ms ease;
}

.todo-item.done .priority-indicator {
  transition: opacity 250ms ease;
  opacity: 0.3;
}

/* --- Toast --- */
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #3d2b1f;
  color: #f5e6d3;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  animation: toast-in 220ms cubic-bezier(0.34, 1.2, 0.64, 1) both;
  z-index: 1000;
  white-space: nowrap;
}

.toast-message {
  flex: 1;
}

.toast-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-undo {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}

.toast-undo:hover {
  opacity: 0.75;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(245, 230, 211, 0.5);
  font-size: 18px;
  line-height: 1;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.toast-close:hover {
  color: #f5e6d3;
}
```

- [ ] **Step 2: Verify styles load**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npm run dev
```

Open http://localhost:5173. Add a task — should see slide-in animation. Toast should animate in from bottom.

- [ ] **Step 3: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/index.css
git commit -m "feat: add CSS animations for enter, delete, complete, and toast"
```

---

## Task 10: Update TodoItem for animations and A11y

**Files:**
- Modify: `src/components/TodoItem.tsx`

- [ ] **Step 1: Add entering animation, data-removing support, and A11y**

In `src/components/TodoItem.tsx`, make these changes:

**a) Update Props interface** to include new props:

```typescript
interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onUpdatePriority: (priority: Priority) => void;
  onUpdateDueDate?: (dueDate: string | undefined) => void;
  onRemoveComplete?: (id: string) => void; // new
  isRemoving?: boolean;                    // new
  isNew?: boolean;                         // new
  isOverlay?: boolean;
}
```

**b) Update the component signature** to destructure new props:

```typescript
export const TodoItem = memo(function TodoItem({
  todo, onToggle, onDelete, onUpdateText, onUpdatePriority,
  onUpdateDueDate, onRemoveComplete, isRemoving, isNew, isOverlay
}: Props) {
```

**c) Add `useEffect` for delete animation fallback** (after existing useEffect):

```typescript
useEffect(() => {
  if (!isRemoving) return;
  // 300ms fallback: if animationend doesn't fire, clean up anyway
  const timer = setTimeout(() => onRemoveComplete?.(todo.id), 300);
  return () => clearTimeout(timer);
}, [isRemoving, todo.id, onRemoveComplete]);
```

**d) Update the outer `div` className and add `onAnimationEnd`**:

Find the return statement's outer div. Wrap it in a `todo-item-wrapper` div and attach animation end handler:

```tsx
return (
  <div className={`todo-item-wrapper${isRemoving ? ' removing' : ''}`}>
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item${todo.done ? ' done' : ''}${isDragging ? ' dragging' : ''}${isNew ? ' todo-entering' : ''}`}
      data-removing={isRemoving || undefined}
      onAnimationEnd={(e) => {
        if (e.animationName === 'todo-exit-slide') {
          onRemoveComplete?.(todo.id);
        }
      }}
    >
      {/* ... existing inner content ... */}
    </div>
  </div>
);
```

**e) Update the checkbox/toggle button** with A11y attributes:

Find the toggle button (the `.todo-check` div/button). Add:

```tsx
role="checkbox"
aria-checked={todo.done}
aria-label={t.markAsDone(todo.text)}
tabIndex={0}
onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(); } }}
```

**f) Update the delete button** with A11y:

```tsx
aria-label={t.deleteTask(todo.text)}
```

**g) Update keyboard handler** in the `todo-text` div to support `Escape` and `Delete`:

The existing `handleKeyDown` likely handles Enter and Escape for editing. Add:

```typescript
if (e.key === 'Delete' && e.currentTarget.getAttribute('contenteditable') !== 'true') {
  onDelete();
}
```

- [ ] **Step 2: Update App.tsx to pass new props to TodoItem**

In `src/App.tsx`, find the `TodoItem` render and update:

```tsx
visibleTodos.map((todo, index) => (
  <TodoItem
    key={todo.id}
    todo={todo}
    onToggle={() => toggleTodo(todo.id)}
    onDelete={() => handleDelete(todo.id, todo.text)}
    onUpdateText={text => updateText(todo.id, text)}
    onUpdatePriority={priority => updatePriority(todo.id, priority)}
    onUpdateDueDate={dueDate => updateDueDate(todo.id, dueDate)}
    onRemoveComplete={onRemoveComplete}
    isRemoving={removingIds.has(todo.id)}
    isNew={index === 0 && !removingIds.has(todo.id)}
  />
))
```

Note: `isNew={index === 0}` triggers the enter animation only for the newest task (at index 0 since new tasks are prepended).

Also update `SortableContext items` to only include non-removing items for a cleaner drag experience (keep removing items in todos for state but exclude from dnd):

```tsx
items={visibleTodos.filter(t => !removingIds.has(t.id)).map(t => t.id)}
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit 2>&1
```

Fix any errors.

- [ ] **Step 4: Manual test all animations**

```bash
npm run dev
```

- Add task → slides in from top ✓
- Delete task → slides right + collapses ✓
- Check task → bounce animation + strikethrough ✓
- Undo → task reappears ✓

- [ ] **Step 5: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/components/TodoItem.tsx src/App.tsx
git commit -m "feat: add enter/delete/complete animations and A11y to TodoItem"
```

---

## Task 11: A11y for Filters, Header, and InputArea

**Files:**
- Modify: `src/components/Filters.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/InputArea.tsx`

- [ ] **Step 1: Update Filters.tsx**

Replace the return JSX in `Filters.tsx`:

```tsx
return (
  <div className="filters" role="group" aria-label={t.filterAll}>
    {options.map(o => (
      <button
        key={o.value}
        className={`filter-btn${filter === o.value ? ' active' : ''}`}
        onClick={() => onChange(o.value)}
        aria-pressed={filter === o.value}
      >
        {o.label}
      </button>
    ))}
  </div>
);
```

- [ ] **Step 2: Update Header.tsx**

In `Header.tsx`, find the theme toggle button and add `aria-label`. Find the lang toggle button and add `aria-label`. Example (adjust to match actual class/structure):

```tsx
// Theme toggle button:
aria-label={isDark ? t.switchToLight : t.switchToDark}

// Lang toggle button:
aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
```

If `switchToLight`/`switchToDark` keys don't exist in i18n, add them in Task 7's i18n additions:

```typescript
// zh:
switchToLight: '切换到浅色模式',
switchToDark: '切换到深色模式',
// en:
switchToLight: 'Switch to light mode',
switchToDark: 'Switch to dark mode',
```

- [ ] **Step 3: Update InputArea.tsx**

Find the input element and add:

```tsx
aria-label={t.placeholder}
```

Find the submit button and add:

```tsx
aria-label={t.addTitle}
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit 2>&1
```

Add any missing i18n keys if type errors appear.

- [ ] **Step 5: Commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add src/components/Filters.tsx src/components/Header.tsx src/components/InputArea.tsx src/i18n.ts
git commit -m "feat: add A11y attributes to Filters, Header, InputArea"
```

---

## Task 12: Final check and cleanup

- [ ] **Step 1: Run all tests**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx vitest run --reporter=verbose
```

Expected: all tests PASS.

- [ ] **Step 2: Full type-check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build check**

```bash
cd /Users/ifanr/claudeprojects/todo-app && npm run build 2>&1 | tail -10
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Final manual smoke test**

Open http://localhost:5173 and verify:
- [ ] Add task → enters with slide animation + toast appears
- [ ] Delete task → exits with slide animation + toast with Undo
- [ ] Click Undo on delete → task reappears
- [ ] Check task → bounce animation + strikethrough + priority line fades
- [ ] Uncheck task → animation reverses
- [ ] Clear done → toast with Undo + tasks disappear
- [ ] Undo clear done → tasks restored
- [ ] Drag to reorder still works
- [ ] Dark mode toggle still works
- [ ] Language toggle still works
- [ ] Filter buttons work (All/Active/Done)
- [ ] No console errors

- [ ] **Step 5: Final commit**

```bash
cd /Users/ifanr/claudeprojects/todo-app
git add -A
git commit -m "feat: complete portfolio optimization — animations, toast/undo, A11y, tests"
```

---

## Notes for Implementer

- **CSS class naming:** The plan uses `.todo-item-wrapper` as the outer wrapper for height-collapse animation. If the existing CSS already uses `.todo-item` for the outer element, adjust class names accordingly to avoid conflicts.
- **TodoItem `isNew` prop:** The `index === 0` heuristic triggers the enter animation on the first item (newest). If the list is sorted by date or filtered, the newest task may not be at index 0. A more robust approach: track `newId` in App state and compare `todo.id === newId`.
- **`deleteTodo` vs `startRemoveTodo`:** The old `deleteTodo` export is kept for internal use by `updateText` (empty text → immediate delete, no animation). Only `startRemoveTodo` is used in App.tsx for user-triggered deletes.
- **Hover pause on toast:** `resumeTimer(clearUndo)` passes `clearUndo` as the dismiss callback. This means after hover, the timer restarts and on expiry calls `clearUndo` (discards undo snapshot). If the user already clicked Undo before hovering off, `clearUndo` is a no-op.
