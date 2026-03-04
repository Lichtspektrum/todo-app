export type Priority = 'high' | 'medium' | 'low';

export type List = 'work' | 'life';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  list: List;
  dueDate?: string; // 'YYYY-MM-DD'
}

export type Filter = 'all' | 'active' | 'done';
