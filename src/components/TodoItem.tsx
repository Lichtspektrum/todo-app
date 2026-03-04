import { useRef, useEffect } from 'react';
import type { Todo, Priority } from '../types';

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onUpdatePriority: (priority: Priority) => void;
}

const PRIORITY_LABELS: Record<Priority, string> = { high: '高', medium: '中', low: '低' };
const NEXT_PRIORITY: Record<Priority, Priority> = { high: 'medium', medium: 'low', low: 'high' };

export function TodoItem({ todo, onToggle, onDelete, onUpdateText, onUpdatePriority }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  // Only set innerHTML on mount to avoid cursor jumping
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

  function cyclePriority() {
    onUpdatePriority(NEXT_PRIORITY[todo.priority]);
  }

  return (
    <div className={`todo-item${todo.done ? ' done' : ''}`}>
      <div
        className={`priority-indicator ${todo.priority}`}
        title={`优先级：${PRIORITY_LABELS[todo.priority]}（点击切换）`}
        onClick={cyclePriority}
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
        {PRIORITY_LABELS[todo.priority]}
      </span>
      <button className="delete-btn" title="删除" onClick={onDelete}>
        <svg viewBox="0 0 14 14">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>
    </div>
  );
}
