import api from './axios';

const AUTOMATION_BASE_URL = '/automation';

export interface TodoCompletionStats {
  userId: string;
  completedTodoEvents: number;
  lastCompletedTodoAt: string | null;
  currentStreakDays: number;
  bestStreakDays: number;
}

export const getMyTodoCompletionStats =
  async (): Promise<TodoCompletionStats> => {
    const { data } = await api.get<TodoCompletionStats>(
      `${AUTOMATION_BASE_URL}/me/todo-completion-stats`,
    );
    return data;
  };
