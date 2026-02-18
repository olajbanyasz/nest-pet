import { Chart } from 'primereact/chart';
import React from 'react';

interface TodosPieChartProps {
  appDetails: {
    totalUsers: number;
    totalAdmins: number;
    totalTodos: number;
    totalCompletedTodos: number;
    totalActiveTodos: number;
    totalDeletedTodos: number;
  };
}

const TodosPieChart: React.FC<TodosPieChartProps> = ({ appDetails }) => {
  const data = {
    labels: ['Active Todos', 'Completed Todos', 'Deleted Todos'],
    datasets: [
      {
        data: [
          appDetails.totalActiveTodos,
          appDetails.totalCompletedTodos,
          appDetails.totalDeletedTodos,
        ],
      },
    ],
  };

  return appDetails && <Chart type="pie" data={data} />;
};

export default TodosPieChart;
