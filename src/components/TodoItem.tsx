import { useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

function getDueDateStatus(dueDate: string): 'overdue' | 'today' | 'future' {
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  return 'future';
}

function formatDate(dueDate: string, locale: string): string {
  const [y, m, d] = dueDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function TodoItem({ todo, onToggle, onDelete, onUpdateText, onUpdatePriority }: Props) {
  const { t } = useLang();
  const divRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

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

  const dueDateStatus = todo.dueDate ? getDueDateStatus(todo.dueDate) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item${todo.done ? ' done' : ''}${isDragging ? ' dragging' : ''}`}
    >
      <div
        className={`priority-indicator ${todo.priority}`}
        title={t.priorityTip(t.priorityLabels[todo.priority])}
        onClick={() => onUpdatePriority(NEXT_PRIORITY[todo.priority])}
      />
      <div
        className="drag-handle"
        title={t.dragHandle}
        {...attributes}
        {...listeners}
      >
        <svg viewBox="0 0 10 16">
          <circle cx="3" cy="3" r="1.2" />
          <circle cx="7" cy="3" r="1.2" />
          <circle cx="3" cy="8" r="1.2" />
          <circle cx="7" cy="8" r="1.2" />
          <circle cx="3" cy="13" r="1.2" />
          <circle cx="7" cy="13" r="1.2" />
        </svg>
      </div>
      <div
        className={`checkbox${todo.done ? ' checked' : ''}`}
        onClick={onToggle}
      >
        <svg viewBox="0 0 12 10">
          <polyline points="1 5 4.5 8.5 11 1" />
        </svg>
      </div>
      <div className="todo-main">
        <div
          ref={divRef}
          className={`todo-text${todo.done ? ' done-text' : ''}`}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {todo.dueDate && (
          <span className={`due-date-badge ${dueDateStatus}`}>
            {dueDateStatus === 'overdue' ? t.dueDateOverdue :
             dueDateStatus === 'today' ? t.dueDateToday :
             formatDate(todo.dueDate, t.dateLocale)}
          </span>
        )}
      </div>
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
