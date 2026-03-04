import { useState } from 'react';
import type { Filter, Priority } from './types';
import { useTodos } from './hooks/useTodos';
import { LangProvider, useLang } from './contexts/LangContext';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ProgressBar } from './components/ProgressBar';
import { Stats } from './components/Stats';
import { Filters } from './components/Filters';
import { TodoItem } from './components/TodoItem';
import { EmptyState } from './components/EmptyState';

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
  const { todos, addTodo, toggleTodo, deleteTodo, updateText, updatePriority, clearDone } = useTodos();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = todos.filter(t => t.done).length;

  function handleAdd(text: string, priority: Priority) {
    addTodo(text, priority);
    if (filter === 'done') setFilter('all');
  }

  return (
    <div className="container">
      <Header />
      <InputArea onAdd={handleAdd} />
      <ProgressBar total={todos.length} done={doneCount} />
      <Stats total={todos.length} done={doneCount} onClearDone={clearDone} />
      <Filters filter={filter} onChange={setFilter} />
      <div className="todo-list">
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filtered.map(todo => (
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
