import { Injectable } from '@nestjs/common';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deleted?: boolean;
}

@Injectable()
export class TodosService {
  private todos: Array<Todo> = [
    { id: 1, title: 'Learn NestJS', completed: false },
    { id: 2, title: 'Build a REST API', completed: true },
    { id: 3, title: 'Write unit tests', completed: false },
  ];

  findAll(completed?: boolean): Todo[] {
    let todos = this.todos;
    if (completed === true) {
      todos = this.todos.filter((todo) => todo.completed);
    } else if (completed === false) {
      todos = this.todos.filter((todo) => !todo.completed);
    }
    return todos.filter((todo) => !todo.deleted);
  }

  findOne(id: number): Todo | undefined {
    if (Number.isNaN(id)) return undefined;
    return this.todos.find((todo) => todo.id === id) || undefined;
  }

  create(todo: Omit<Todo, 'id' | 'completed'>): Todo {
    const newTodo: Todo = {
      id: this.todos.length + 1,
      completed: false,
      ...todo,
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  update(id: number, todoUpdate: Partial<Omit<Todo, 'id'>>): Todo | undefined {
    const numId = Number(id);
    if (Number.isNaN(numId)) return undefined;
    const todoIndex = this.todos.findIndex((todo) => todo.id === numId);
    if (todoIndex === -1) return undefined;
    this.todos.map((todo, index) => {
      if (index === todoIndex) {
        this.todos[index] = { ...todo, ...todoUpdate };
      }
    });
    return this.todos[todoIndex];
  }

  delete(id: number): Todo | boolean {
    if (Number.isNaN(id)) return false;
    this.todos = this.todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, deleted: true };
      }
      return todo;
    });
    return this.todos[id];
  }
}
