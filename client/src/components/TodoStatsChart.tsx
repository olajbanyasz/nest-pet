import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { getLast14DaysStats } from '../api/todosApi';

const TodoStatsChart: React.FC = () => {
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const data = await getLast14DaysStats();

            const labels = Object.keys(data?.createdTodos);
            const createdTodosStat = Object.values(data?.createdTodos);
            const completedTodosStat = Object.values(data?.completedTodos);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Created Todos',
                        data: createdTodosStat,
                        fill: false,
                        tension: 0.4,
                    },
                    {
                        label: 'Completed Todos',
                        data: completedTodosStat,
                        fill: false,
                        tension: 0.4,
                    },
                ],
            });
        };

        load();
    }, []);

    if (!chartData) return null;

    return (
        <div className="card todo-stats-chart">
            <h3>Todos last 14 days</h3>
            <Chart type="line" data={chartData} />
        </div>
    );
};

export default TodoStatsChart;
