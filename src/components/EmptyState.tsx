import type { Filter } from '../types';

interface Props {
  filter: Filter;
}

const MESSAGES: Record<Filter, string> = {
  done: '还没有完成的任务',
  active: '没有待办任务，休息一下吧',
  all: '添加第一个任务开始吧',
};

export function EmptyState({ filter }: Props) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <svg viewBox="0 0 24 24">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <p>{MESSAGES[filter]}</p>
    </div>
  );
}
