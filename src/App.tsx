import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { compareAsc } from 'date-fns';
import type { Filter, Priority, List } from './types';
import { useTodos } from './hooks/useTodos';
import { useToast } from './hooks/useToast';
import { useLang } from './contexts/LangContext';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ProgressBar } from './components/ProgressBar';
import { Stats } from './components/Stats';
import { Filters } from './components/Filters';
import { ListTabs } from './components/ListTabs';
import { TodoItem } from './components/TodoItem';
import { EmptyState } from './components/EmptyState';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

type ListTab = List | 'all';
type SortMode = 'manual' | 'date';

function TodoApp() {
  const {
    todos, addTodo, toggleTodo, startRemoveTodo, onRemoveComplete,
    updateText, updatePriority, updateDueDate, clearDone, reorderTodos,
    undo, clearUndo, removingIds,
  } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');
  const [listTab, setListTab] = useState<ListTab>('all');
  const [sortMode, setSortMode] = useState<SortMode>('manual');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { t } = useLang();
  const { toast, showToast, dismissToast, pauseTimer, resumeTimer } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const visibleTodos = useMemo(() => {
    let result = todos.filter(t => {
      const listMatch = listTab === 'all' || t.list === listTab;
      const filterMatch =
        filter === 'active' ? !t.done :
        filter === 'done' ? t.done :
        true;
      return listMatch && filterMatch;
    });

    if (sortMode === 'date') {
      result = [...result].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // Put items without due date at the end
        if (!b.dueDate) return -1;
        return compareAsc(new Date(a.dueDate), new Date(b.dueDate));
      });
    }

    return result;
  }, [todos, listTab, filter, sortMode]);

  const scopedTodos = useMemo(() => {
    return listTab === 'all' ? todos : todos.filter(t => t.list === listTab);
  }, [todos, listTab]);

  const doneCount = useMemo(() => {
    return scopedTodos.filter(t => t.done).length;
  }, [scopedTodos]);

  const handleAdd = useCallback((text: string, priority: Priority, list: List, dueDate?: string) => {
    addTodo(text, priority, list, dueDate);
    if (filter === 'done') setFilter('all');
    showToast({ message: t.toastAdded });
  }, [addTodo, filter, showToast, t]);

  const handleDelete = useCallback((id: string, text: string) => {
    startRemoveTodo(id);
    showToast(
      { message: t.toastDeleted(text), onUndo: undo },
      clearUndo,
    );
  }, [startRemoveTodo, showToast, t, undo, clearUndo]);

  const handleClearDone = useCallback(() => {
    const doneCount = scopedTodos.filter(todo => todo.done).length;
    clearDone();
    showToast(
      { message: t.toastClearedDone(doneCount), onUndo: undo },
      clearUndo,
    );
  }, [clearDone, scopedTodos, showToast, t, undo, clearUndo]);

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

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

  const defaultList: List = listTab === 'all' ? 'work' : listTab;

  // Suppress unused variable warnings for now
  void onRemoveComplete;
  void removingIds;

  return (
    <div className="container">
      <Header />
      <ListTabs current={listTab} onChange={setListTab} />
      <InputArea onAdd={handleAdd} defaultList={defaultList} />
      <ProgressBar total={scopedTodos.length} done={doneCount} />
      <Stats total={scopedTodos.length} done={doneCount} onClearDone={handleClearDone} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Filters filter={filter} onChange={setFilter} />
        <button
          className="sort-btn"
          onClick={() => setSortMode(m => m === 'manual' ? 'date' : 'manual')}
        >
          {sortMode === 'manual' ? t.sortByDate : t.sortByManual}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="todo-list">
            {visibleTodos.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              visibleTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => handleDelete(todo.id, todo.text)}
                  onUpdateText={text => updateText(todo.id, text)}
                  onUpdatePriority={priority => updatePriority(todo.id, priority)}
                  onUpdateDueDate={dueDate => updateDueDate(todo.id, dueDate)}
                />
              ))
            )}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{
          duration: 400,
          easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}>
          {activeTodo ? (
            <TodoItem
              todo={activeTodo}
              onToggle={() => {}}
              onDelete={() => {}}
              onUpdateText={() => {}}
              onUpdatePriority={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <Toast
        toast={toast}
        onDismiss={() => { dismissToast(); clearUndo(); }}
        onMouseEnter={() => pauseTimer()}
        onMouseLeave={() => resumeTimer(clearUndo)}
      />
      <Footer />
    </div>
  );
}

export default function App() {
  return <TodoApp />;
}
