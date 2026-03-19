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
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
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

  const clearDone = useCallback(() => {
    setTodos(prev => {
      setUndoSnapshot(prev);
      return prev.filter(t => !t.done);
    });
  }, []);

  const reorderTodos = useCallback((newOrder: Todo[]) => {
    setTodos(newOrder);
  }, []);

  const startRemoveTodo = useCallback((id: string) => {
    setTodos(prev => {
      setUndoSnapshot(prev);
      return prev;
    });
    setRemovingIds(prev => new Set(prev).add(id));
  }, []);

  const onRemoveComplete = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    setRemovingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setUndoSnapshot(snapshot => {
      if (snapshot !== null) {
        setTodos(snapshot);
        setRemovingIds(new Set());
      }
      return null;
    });
  }, []);

  const clearUndo = useCallback(() => {
    setUndoSnapshot(null);
  }, []);

  return {
    todos,
    removingIds,
    undoSnapshot,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateText,
    updatePriority,
    updateDueDate,
    clearDone,
    reorderTodos,
    startRemoveTodo,
    onRemoveComplete,
    undo,
    clearUndo,
  };
}
