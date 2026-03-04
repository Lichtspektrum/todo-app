import type { Filter } from '../types';

interface Props {
  filter: Filter;
  onChange: (f: Filter) => void;
}

const OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '待办' },
  { value: 'done', label: '已完成' },
];

export function Filters({ filter, onChange }: Props) {
  return (
    <div className="filters">
      {OPTIONS.map(o => (
        <button
          key={o.value}
          className={`filter-btn${filter === o.value ? ' active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
