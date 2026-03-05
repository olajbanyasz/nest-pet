import React from 'react';

const TodoCompletionStat: React.FC<{
  completedTodoEvents: number;
  lastCompletedTodoAt: string | null;
  currentStreakDays: number;
  bestStreakDays: number;
}> = ({
  completedTodoEvents,
  lastCompletedTodoAt,
  currentStreakDays,
  bestStreakDays,
}) => {
  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        color: '#4b5563',
      }}
    >
      <h3 style={{ margin: 0 }}>Automation Stats</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '0.6rem 1.2rem',
        }}
      >
        <p style={{ margin: 0 }}>
          Todo completion events: <strong>{completedTodoEvents}</strong>
        </p>
        <p style={{ margin: 0 }}>
          Last completion:{' '}
          <strong>
            {lastCompletedTodoAt
              ? new Date(lastCompletedTodoAt).toLocaleString()
              : 'No completion event yet'}
          </strong>
        </p>
        <p style={{ margin: 0 }}>
          Current streak: <strong>{currentStreakDays} day(s)</strong>
        </p>
        <p style={{ margin: 0 }}>
          Best streak: <strong>{bestStreakDays} day(s)</strong>
        </p>
      </div>
    </div>
  );
};

export default TodoCompletionStat;
