import React from 'react';

const TodoCompletionStat: React.FC<{
  completedTodoEvents: number;
  lastCompletedTodoAt: string | null;
}> = ({ completedTodoEvents, lastCompletedTodoAt }) => {
  return (
    <div style={{ padding: '0.5rem 2.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Automation Stats</h3>
      <p style={{ margin: '0.4rem 0' }}>
        Todo completion events: <strong>{completedTodoEvents}</strong>
      </p>
      <p style={{ margin: '0.4rem 0' }}>
        Last completion:{' '}
        <strong>
          {lastCompletedTodoAt
            ? new Date(lastCompletedTodoAt).toLocaleString()
            : 'No completion event yet'}
        </strong>
      </p>
    </div>
  );
};

export default TodoCompletionStat;
