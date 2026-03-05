import { useState, useEffect } from 'react';
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

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }, [todos]);

  function addTodo(text: string, priority: Priority, list: List, dueDate?: string) {
    setTodos(prev => [
      { id: crypto.randomUUID(), text, done: false, priority, list, dueDate },
      ...prev,
    ]);
  }

  function toggleTodo(id: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function updateText(id: string, text: string) {
    if (!text.trim()) {
      deleteTodo(id);
      return;
    }
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: text.trim() } : t));
  }

  function updatePriority(id: string, priority: Priority) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
  }

  function updateDueDate(id: string, dueDate: string | undefined) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate } : t));
  }

  function clearDone() {
    setTodos(prev => prev.filter(t => !t.done));
  }

  function reorderTodos(newOrder: Todo[]) {
    setTodos(newOrder);
  }

  return { todos, addTodo, toggleTodo, deleteTodo, updateText, updatePriority, updateDueDate, clearDone, reorderTodos };
}
