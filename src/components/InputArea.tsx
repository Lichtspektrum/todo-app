import { useState, useRef } from 'react';
import type { Priority, List } from '../types';
import { useLang } from '../contexts/LangContext';
import { DatePicker } from './DatePicker';

interface Props {
  onAdd: (text: string, priority: Priority, list: List, dueDate?: string) => void;
  defaultList: List;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function InputArea({ onAdd, defaultList }: Props) {
  const { t } = useLang();
  const [priority, setPriority] = useState<Priority | null>(null);
  const [userSelectedList, setUserSelectedList] = useState<List | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Use user selected list if available, otherwise fall back to defaultList prop
  const effectiveList = userSelectedList ?? defaultList;

  function handleListChange(l: List) {
    setUserSelectedList(l);
  }

  function handleAdd() {
    const text = inputRef.current?.value.trim() ?? '';
    if (!text) return;
    
    // Format date to string YYYY-MM-DD for the backend/storage
    const dateStr = dueDate 
      ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`
      : undefined;

    onAdd(text, priority ?? 'medium', effectiveList, dateStr);

    inputRef.current!.value = '';
    setDueDate(undefined);
    setPriority(null);
    setUserSelectedList(null);
    inputRef.current!.focus();
  }

  return (
    <div className="input-area">
      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          placeholder={t.placeholder}
          maxLength={200}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <div className="priority-picker">
          {PRIORITIES.map(p => (
            <button
              key={p}
              className={`priority-dot ${p}${priority === p ? ' active' : ''}`}
              title={t.priorityTitles[p]}
              aria-label={t.priorityTitles[p]}
              onClick={() => setPriority(prev => prev === p ? null : p)}
            />
          ))}
        </div>
        <button className="add-btn" title={t.addTitle} aria-label={t.addTitle} onClick={handleAdd}>
          <svg viewBox="0 0 14 14">
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </button>
      </div>
      <div className="input-meta">
        <div className="list-picker">
          {(['work', 'life'] as List[]).map(l => (
            <button
              key={l}
              className={`list-picker-btn${effectiveList === l ? ' active' : ''}`}
              onClick={() => handleListChange(l)}
            >
              {l === 'work' ? t.listWork : t.listLife}
            </button>
          ))}
        </div>
        <DatePicker date={dueDate} onDateChange={setDueDate} />
      </div>
    </div>
  );
}
