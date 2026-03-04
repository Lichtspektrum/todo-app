import { useState, useEffect } from 'react';
import type { Todo, Priority } from '../types';

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
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  function addTodo(text: string, priority: Priority) {
    setTodos(prev => [{ id: Date.now().toString(), text, done: false, priority }, ...prev]);
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

  function clearDone() {
    setTodos(prev => prev.filter(t => !t.done));
  }

  return { todos, addTodo, toggleTodo, deleteTodo, updateText, updatePriority, clearDone };
}
