import { useState, useRef } from 'react';
import type { Priority } from '../types';
import { useLang } from '../contexts/LangContext';

interface Props {
  onAdd: (text: string, priority: Priority) => void;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export function InputArea({ onAdd }: Props) {
  const { t } = useLang();
  const [priority, setPriority] = useState<Priority>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const text = inputRef.current?.value.trim() ?? '';
    if (!text) return;
    onAdd(text, priority);
    inputRef.current!.value = '';
    inputRef.current!.focus();
  }

  return (
    <div className="input-area">
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
            onClick={() => setPriority(p)}
          />
        ))}
      </div>
      <button className="add-btn" title={t.addTitle} onClick={handleAdd}>
        <svg viewBox="0 0 14 14">
          <line x1="7" y1="1" x2="7" y2="13" />
          <line x1="1" y1="7" x2="13" y2="7" />
        </svg>
      </button>
    </div>
  );
}
