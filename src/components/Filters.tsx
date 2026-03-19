import type { Filter } from '../types';
import { useLang } from '../contexts/LangContext';

interface Props {
  filter: Filter;
  onChange: (f: Filter) => void;
}

export function Filters({ filter, onChange }: Props) {
  const { t } = useLang();

  const options: { value: Filter; label: string }[] = [
    { value: 'all', label: t.filterAll },
    { value: 'active', label: t.filterActive },
    { value: 'done', label: t.filterDone },
  ];

  return (
    <div className="filters" role="group" aria-label={t.filterGroupLabel}>
      {options.map(o => (
        <button
          key={o.value}
          className={`filter-btn${filter === o.value ? ' active' : ''}`}
          onClick={() => onChange(o.value)}
          aria-pressed={filter === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
