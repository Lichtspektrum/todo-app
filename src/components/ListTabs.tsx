import type { List } from '../types';
import { useLang } from '../contexts/LangContext';

type ListTab = List | 'all';

interface Props {
  current: ListTab;
  onChange: (list: ListTab) => void;
}

export function ListTabs({ current, onChange }: Props) {
  const { t } = useLang();
  const tabs: { value: ListTab; label: string }[] = [
    { value: 'work', label: t.listWork },
    { value: 'life', label: t.listLife },
    { value: 'all', label: t.listAll },
  ];

  return (
    <div className="list-tabs">
      {tabs.map(tab => (
        <button
          key={tab.value}
          className={`list-tab${current === tab.value ? ' active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
