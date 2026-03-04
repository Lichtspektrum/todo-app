import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { Filter, Priority, List } from './types';
import { useTodos } from './hooks/useTodos';
import { LangProvider, useLang } from './contexts/LangContext';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ProgressBar } from './components/ProgressBar';
import { Stats } from './components/Stats';
import { Filters } from './components/Filters';
import { ListTabs } from './components/ListTabs';
import { TodoItem } from './components/TodoItem';
import { EmptyState } from './components/EmptyState';

type ListTab = List | 'all';

function LangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button className="lang-toggle" onClick={toggleLang} title="Switch language">
      <span className={lang === 'zh' ? 'active' : ''}>中</span>
      <span className="separator">·</span>
      <span className={lang === 'en' ? 'active' : ''}>EN</span>
    </button>
  );
}

function TodoApp() {
  const { todos, addTodo, toggleTodo, deleteTodo, updateText, updatePriority, clearDone, reorderTodos } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');
  const [listTab, setListTab] = useState<ListTab>('all');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const visibleTodos = todos.filter(t => {
    const listMatch = listTab === 'all' || t.list === listTab;
    const filterMatch =
      filter === 'active' ? !t.done :
      filter === 'done' ? t.done :
      true;
    return listMatch && filterMatch;
  });

  const scopedTodos = listTab === 'all' ? todos : todos.filter(t => t.list === listTab);
  const doneCount = scopedTodos.filter(t => t.done).length;

  function handleAdd(text: string, priority: Priority, list: List, dueDate?: string) {
    addTodo(text, priority, list, dueDate);
    if (filter === 'done') setFilter('all');
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex(t => t.id === active.id);
    const newIndex = todos.findIndex(t => t.id === over.id);
    reorderTodos(arrayMove(todos, oldIndex, newIndex));
  }

  const defaultList: List = listTab === 'all' ? 'work' : listTab;

  return (
    <div className="container">
      <Header />
      <ListTabs current={listTab} onChange={setListTab} />
      <InputArea onAdd={handleAdd} defaultList={defaultList} />
      <ProgressBar total={scopedTodos.length} done={doneCount} />
      <Stats total={scopedTodos.length} done={doneCount} onClearDone={clearDone} />
      <Filters filter={filter} onChange={setFilter} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                  onDelete={() => deleteTodo(todo.id)}
                  onUpdateText={text => updateText(todo.id, text)}
                  onUpdatePriority={priority => updatePriority(todo.id, priority)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <LangToggle />
      <TodoApp />
    </LangProvider>
  );
}
