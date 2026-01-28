import React from "react";

interface TodoFilterProps {
    todoFilter: string;
    setTodoFilter: (filter: string) => void;
}

function TodoFilter({ todoFilter, setTodoFilter }: TodoFilterProps) {

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px', marginBottom: '10px', borderBottom: '1px solid rgb(221, 221, 221)' }}>
            <label htmlFor="todo-filter" style={{ marginRight: '8px' }}>
                Filter:
            </label>

            <select
                id="todo-filter"
                value={todoFilter}
                onChange={(e) => setTodoFilter(e.target.value as string)}
            >
                <option value="all">Show all</option>
                <option value="active">Active only</option>
                <option value="completed">Completed only</option>
            </select>
        </div>);
}

export default TodoFilter;