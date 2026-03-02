export const APP_EVENT_TODO_COMPLETED = 'todo.completed';

export interface TodoCompletedEvent {
  todoId: string;
  userId: string;
  completedAt: string;
}
