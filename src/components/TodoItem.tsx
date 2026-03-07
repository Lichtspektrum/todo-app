import { useRef, useEffect, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isTomorrow, isYesterday, isBefore, startOfDay, parseISO } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import type { Todo, Priority } from '../types';
import { useLang } from '../contexts/LangContext';

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onUpdatePriority: (priority: Priority) => void;
  isOverlay?: boolean;
}

const NEXT_PRIORITY: Record<Priority, Priority> = { high: 'medium', medium: 'low', low: 'high' };
const locales = { zhCN, enUS };

function getDueDateStatus(dueDate: string): 'overdue' | 'today' | 'tomorrow' | 'yesterday' | 'future' {
  const date = parseISO(dueDate);
  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  if (isYesterday(date)) return 'yesterday';
  if (isBefore(date, startOfDay(new Date()))) return 'overdue';
  return 'future';
}

function formatDate(dueDate: string, localeKey: 'zhCN' | 'enUS'): string {
  const date = parseISO(dueDate);
  return format(date, 'MMM d, EEE', { locale: locales[localeKey] });
}

export const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete, onUpdateText, onUpdatePriority, isOverlay }: Props) {
  const { t } = useLang();
  const divRef = useRef<HTMLDivElement>(null);

  const sortable = useSortable({ id: todo.id, disabled: isOverlay });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = isOverlay ? {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    cursor: 'grabbing',
  } : {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  useEffect(() => {
    if (divRef.current && divRef.current.textContent !== todo.text) {
      divRef.current.textContent = todo.text;
    }
  }, [todo.text]);

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
        role="button"
        tabIndex={0}
        title={t.priorityTip(t.priorityLabels[todo.priority])}
        aria-label={t.priorityTip(t.priorityLabels[todo.priority])}
        onClick={() => onUpdatePriority(NEXT_PRIORITY[todo.priority])}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onUpdatePriority(NEXT_PRIORITY[todo.priority]);
          }
        }}
      />
      {!isOverlay && (
        <div
          className="drag-handle"
          title={t.dragHandle}
          aria-label={t.dragHandle}
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
      )}
      <button
        className={`checkbox${todo.done ? ' checked' : ''}`}
        role="checkbox"
        aria-checked={todo.done}
        aria-label={todo.text}
        onClick={onToggle}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <svg viewBox="0 0 12 10">
          <polyline points="1 5 4.5 8.5 11 1" />
        </svg>
      </button>
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
             dueDateStatus === 'yesterday' ? t.dueDateYesterday :
             dueDateStatus === 'today' ? t.dueDateToday :
             dueDateStatus === 'tomorrow' ? t.dueDateTomorrow :
             formatDate(todo.dueDate, t.dateFnsLocaleKey as "zhCN" | "enUS")}
          </span>
        )}
      </div>
      <span className={`priority-badge ${todo.priority}`}>
        {t.priorityLabels[todo.priority]}
      </span>
      <button className="delete-btn" title={t.deleteTitle} aria-label={t.deleteTitle} onClick={onDelete}>
        <svg viewBox="0 0 14 14">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>
    </div>
  );
});
