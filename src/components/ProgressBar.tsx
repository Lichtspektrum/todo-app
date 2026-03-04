interface Props {
  total: number;
  done: number;
}

export function ProgressBar({ total, done }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="progress-wrap">
      <div className="progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
