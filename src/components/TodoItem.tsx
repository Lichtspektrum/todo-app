import { useRef, useEffect } from 'react';
import type { Todo, Priority } from '../types';
import { useLang } from '../contexts/LangContext';

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onUpdatePriority: (priority: Priority) => void;
}

const NEXT_PRIORITY: Record<Priority, Priority> = { high: 'medium', medium: 'low', low: 'high' };

export function TodoItem({ todo, onToggle, onDelete, onUpdateText, onUpdatePriority }: Props) {
  const { t } = useLang();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.textContent = todo.text;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todo.id]);

  function handleBlur() {
    const text = divRef.current?.textContent ?? '';
    onUpdateText(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      divRef.current?.blur();
    }
  }

  return (
    <div className={`todo-item${todo.done ? ' done' : ''}`}>
      <div
        className={`priority-indicator ${todo.priority}`}
        title={t.priorityTip(t.priorityLabels[todo.priority])}
        onClick={() => onUpdatePriority(NEXT_PRIORITY[todo.priority])}
      />
      <div
        className={`checkbox${todo.done ? ' checked' : ''}`}
        onClick={onToggle}
      >
        <svg viewBox="0 0 12 10">
          <polyline points="1 5 4.5 8.5 11 1" />
        </svg>
      </div>
      <div
        ref={divRef}
        className={`todo-text${todo.done ? ' done-text' : ''}`}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <span className={`priority-badge ${todo.priority}`}>
        {t.priorityLabels[todo.priority]}
      </span>
      <button className="delete-btn" title={t.deleteTitle} onClick={onDelete}>
        <svg viewBox="0 0 14 14">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>
    </div>
  );
}
