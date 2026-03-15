import { useLang } from '../contexts/LangContext';

interface Props {
  total: number;
  done: number;
  onClearDone: () => void;
}

export function Stats({ total, done, onClearDone }: Props) {
  const { t } = useLang();
  const active = total - done;

  return (
    <div className="stats">
      <div className="stats-count">
        {total > 0 && (
          <><span>{active}</span>{t.activeSuffix} · <span>{done}</span>{t.doneSuffix}</>
        )}
      </div>
      {done > 0 && (
        <button className="clear-done" onClick={onClearDone}>
          {t.clearDone}
        </button>
      )}
    </div>
  );
}
