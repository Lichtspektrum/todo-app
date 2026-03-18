import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTodos } from './useTodos';
import type { Todo } from '../types';

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: false,
});

// crypto.randomUUID is available in jsdom, but let's make it deterministic
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

// ─── helpers ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  uuidCounter = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ─── rebuild a cleaner localStorage mock per-test ────────────────────────────
// The outer mock above keeps `store` via closure; `clear()` does reset it.
// We only need to reset the call history (done by clearAllMocks) and store.

describe('useTodos — 现有行为', () => {

  it('初始状态为空列表', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  it('添加任务（新任务在最前）', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶', 'medium', 'life');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({
      text: '买牛奶',
      done: false,
      priority: 'medium',
      list: 'life',
    });
  });

  it('添加多个任务（最新的在前）', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('第一个', 'low', 'work');
      result.current.addTodo('第二个', 'high', 'life');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].text).toBe('第二个');
    expect(result.current.todos[1].text).toBe('第一个');
  });

  it('切换任务完成状态', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('测试任务', 'medium', 'work');
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].done).toBe(true);

    act(() => {
      result.current.toggleTodo(id);
    });

    expect(result.current.todos[0].done).toBe(false);
  });

  it('更新任务文字', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('旧文字', 'low', 'life');
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.updateText(id, '新文字');
    });

    expect(result.current.todos[0].text).toBe('新文字');
  });

  it('删除任务（updateText 空字符串时）', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('待删除', 'low', 'work');
    });

    expect(result.current.todos).toHaveLength(1);
    const id = result.current.todos[0].id;

    act(() => {
      result.current.updateText(id, '   ');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('设置优先级', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('优先级测试', 'low', 'work');
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.updatePriority(id, 'high');
    });

    expect(result.current.todos[0].priority).toBe('high');
  });

  it('设置截止日期', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('截止日期测试', 'medium', 'work');
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.updateDueDate(id, '2026-03-31');
    });

    expect(result.current.todos[0].dueDate).toBe('2026-03-31');
  });

  it('清除截止日期', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('有截止日期', 'medium', 'work', '2026-03-31');
    });

    const id = result.current.todos[0].id;
    expect(result.current.todos[0].dueDate).toBe('2026-03-31');

    act(() => {
      result.current.updateDueDate(id, undefined);
    });

    expect(result.current.todos[0].dueDate).toBeUndefined();
  });

  it('拖拽重排', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('任务A', 'low', 'work');
      result.current.addTodo('任务B', 'low', 'work');
      result.current.addTodo('任务C', 'low', 'work');
    });

    // 当前顺序: C, B, A（最新在前）
    const [c, b, a] = result.current.todos;
    const newOrder: Todo[] = [a, c, b];

    act(() => {
      result.current.reorderTodos(newOrder);
    });

    expect(result.current.todos[0].text).toBe('任务A');
    expect(result.current.todos[1].text).toBe('任务C');
    expect(result.current.todos[2].text).toBe('任务B');
  });

  it('清空已完成任务', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('未完成', 'low', 'work');
      result.current.addTodo('已完成', 'low', 'work');
    });

    const doneId = result.current.todos[0].id; // 最新的在前

    act(() => {
      result.current.toggleTodo(doneId);
    });

    expect(result.current.todos.filter(t => t.done)).toHaveLength(1);

    act(() => {
      result.current.clearDone();
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('未完成');
  });

  it('localStorage 持久化（debounced 300ms）', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('持久化测试', 'medium', 'life');
    });

    // 300ms 前不应写入
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
      'todos',
      expect.any(String),
    );

    // 推进 300ms 触发 debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'todos',
      expect.stringContaining('持久化测试'),
    );
  });

  it('从 localStorage 加载', () => {
    const savedTodos: Todo[] = [
      { id: 'saved-1', text: '已保存任务', done: false, priority: 'high', list: 'work' },
    ];

    // 在 hook 挂载前预填 localStorage
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedTodos));

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('已保存任务');
    expect(result.current.todos[0].id).toBe('saved-1');
  });
});

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
