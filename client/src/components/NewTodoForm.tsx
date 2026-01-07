import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

interface NewTodoFormProps {
    onAdd: (title: string) => void;
}

function NewTodoForm({ onAdd }: NewTodoFormProps) {
    const [newTodo, setNewTodo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodo.trim()) {
            onAdd(newTodo);
            setNewTodo('');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '20px' }} className="p-inputgroup flex-1">
            <InputText
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new todo"
                style={{ flexGrow: 1 }}
            />
            <Button label="Add" onClick={handleSubmit} disabled={newTodo.trim().length < 4 } />
        </div>

    );
}

export default NewTodoForm;