interface Props {
  total: number;
  done: number;
  onClearDone: () => void;
}

export function Stats({ total, done, onClearDone }: Props) {
  const active = total - done;
  return (
    <div className="stats">
      <div className="stats-count">
        {total > 0 && (
          <><span>{active}</span> 项待办 · <span>{done}</span> 项完成</>
        )}
      </div>
      <button
        className="clear-done"
        style={{ visibility: done > 0 ? 'visible' : 'hidden' }}
        onClick={onClearDone}
      >
        清除已完成
      </button>
    </div>
  );
}
