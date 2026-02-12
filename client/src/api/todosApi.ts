import api from './axios';

const API_BASE_URL = '/todos';

export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

export type DayStats = Record<string, number>;

export interface StatsData {
  createdTodos: DayStats;
  completedTodos: DayStats;
}

export const fetchTodos = async (todoFilter: string): Promise<Todo[]> => {
  const query =
    todoFilter === 'all' ? '' : `?completed=${todoFilter === 'completed'}`;
  const res = await api.get<Todo[]>(`${API_BASE_URL}${query}`);
  return res.data;
};

export const addTodo = async (title: string): Promise<void> => {
  await api.post(API_BASE_URL, { title });
};

export const toggleTodo = async (
  id: string,
  completed: boolean,
): Promise<void> => {
  await api.patch(`${API_BASE_URL}/${id}`, { completed });
};

export const updateTodoTitle = async (
  id: string,
  title: string,
): Promise<void> => {
  await api.patch(`${API_BASE_URL}/${id}`, { title });
};

export const deleteTodo = async (id: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/${id}`);
};

export const getLast14DaysStats = async (): Promise<StatsData> => {
  const { data } = await api.get<StatsData>(
    `${API_BASE_URL}/stats/last-14-days`,
  );
  return data;
};
