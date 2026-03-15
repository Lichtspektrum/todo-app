import { useRef, useEffect, memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isTomorrow, isYesterday, isBefore, startOfDay, parseISO } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import type { Todo, Priority } from '../types';
import { useLang } from '../contexts/LangContext';

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateText: (text: string) => void;
  onUpdatePriority: (priority: Priority) => void;
  onUpdateDueDate?: (dueDate: string | undefined) => void;
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

export const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete, onUpdateText, onUpdatePriority, onUpdateDueDate, isOverlay }: Props) {
  const { t } = useLang();
  const divRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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
    if (divRef.current) {
      divRef.current.textContent = todo.text;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!datePickerOpen) return;
    function handle(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [datePickerOpen]);

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
  const currentLocale = locales[t.dateFnsLocaleKey as 'zhCN' | 'enUS'];

  function dueDateLabel() {
    if (!dueDateStatus || !todo.dueDate) return null;
    if (dueDateStatus === 'overdue') return t.dueDateOverdue;
    if (dueDateStatus === 'yesterday') return t.dueDateYesterday;
    if (dueDateStatus === 'today') return t.dueDateToday;
    if (dueDateStatus === 'tomorrow') return t.dueDateTomorrow;
    return formatDate(todo.dueDate, t.dateFnsLocaleKey as 'zhCN' | 'enUS');
  }

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
        {onUpdateDueDate ? (
          <div ref={datePickerRef} style={{ position: 'relative', display: 'inline-block' }}>
            {todo.dueDate ? (
              <button
                className={`due-date-badge ${dueDateStatus}`}
                onClick={() => setDatePickerOpen(o => !o)}
              >
                {dueDateLabel()}
              </button>
            ) : (
              <button className="add-date-btn" onClick={() => setDatePickerOpen(o => !o)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {t.dueDatePlaceholder}
              </button>
            )}
            {datePickerOpen && (
              <div className="datepicker-popover" style={{ left: 0, right: 'auto' }}>
                <DayPicker
                  mode="single"
                  selected={todo.dueDate ? parseISO(todo.dueDate) : undefined}
                  onSelect={(date) => {
                    onUpdateDueDate(date ? format(date, 'yyyy-MM-dd') : undefined);
                    setDatePickerOpen(false);
                  }}
                  locale={currentLocale}
                  showOutsideDays
                  className="anthropic-calendar"
                />
              </div>
            )}
          </div>
        ) : todo.dueDate ? (
          <span className={`due-date-badge ${dueDateStatus}`}>
            {dueDateLabel()}
          </span>
        ) : null}
      </div>
      <button
        className={`priority-badge ${todo.priority}`}
        title={t.priorityTip(t.priorityLabels[todo.priority])}
        onClick={() => onUpdatePriority(NEXT_PRIORITY[todo.priority])}
      >
        {t.priorityLabels[todo.priority]}
      </button>
      <button className="delete-btn" title={t.deleteTitle} aria-label={t.deleteTitle} onClick={onDelete}>
        <svg viewBox="0 0 14 14">
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      </button>
    </div>
  );
});
