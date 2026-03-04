export type Priority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
}

export type Filter = 'all' | 'active' | 'done';
