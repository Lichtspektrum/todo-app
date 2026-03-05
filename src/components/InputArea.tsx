import { useState, useRef } from 'react';
import type { Priority, List } from '../types';
import { useLang } from '../contexts/LangContext';

interface Props {
  onAdd: (text: string, priority: Priority, list: List, dueDate?: string) => void;
  defaultList: List;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export function InputArea({ onAdd, defaultList }: Props) {
  const { t } = useLang();
  const [priority, setPriority] = useState<Priority>('medium');
  const [list, setList] = useState<List>(defaultList);
  const [dueDate, setDueDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const userChangedList = useRef(false);

  function handleListChange(l: List) {
    userChangedList.current = true;
    setList(l);
  }

  function handleAdd() {
    const text = inputRef.current?.value.trim() ?? '';
    if (!text) return;
    onAdd(text, priority, list, dueDate || undefined);
    inputRef.current!.value = '';
    setDueDate('');
    userChangedList.current = false;
    setList(defaultList);
    inputRef.current!.focus();
  }

  // Sync list to defaultList when user hasn't manually overridden
  const effectiveList = userChangedList.current ? list : defaultList;

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
              onClick={() => setPriority(p)}
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
        <input
          type="date"
          className="due-date-input"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          title={t.dueDatePlaceholder}
        />
      </div>
    </div>
  );
}
