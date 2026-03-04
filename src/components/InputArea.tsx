import { useState, useRef } from 'react';
import type { Priority } from '../types';

interface Props {
  onAdd: (text: string, priority: Priority) => void;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const LABELS: Record<Priority, string> = { high: '高', medium: '中', low: '低' };

export function InputArea({ onAdd }: Props) {
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
        placeholder="添加一个新任务…"
        maxLength={200}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
      />
      <div className="priority-picker">
        {PRIORITIES.map(p => (
          <button
            key={p}
            className={`priority-dot ${p}${priority === p ? ' active' : ''}`}
            title={LABELS[p] + '优先级'}
            onClick={() => setPriority(p)}
          />
        ))}
      </div>
      <button className="add-btn" title="添加" onClick={handleAdd}>
        <svg viewBox="0 0 14 14">
          <line x1="7" y1="1" x2="7" y2="13" />
          <line x1="1" y1="7" x2="13" y2="7" />
        </svg>
      </button>
    </div>
  );
}
