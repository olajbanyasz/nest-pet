import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { ChartData } from 'chart.js';
import { getLast14DaysStats } from '../api/todosApi';

const RecentTodoStatsChart: React.FC = () => {
    const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const data = await getLast14DaysStats();

                if (!mounted) return;

                const labels = Object.keys(data?.createdTodos ?? {});
                const createdTodosStat = Object.values(data?.createdTodos ?? {});
                const completedTodosStat = Object.values(data?.completedTodos ?? {});

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
            } catch (err) {
                console.error(err);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);


    if (!chartData) return null;

    return (
        <div>
            <h3>Todos last 14 days</h3>
            <Chart type="line" data={chartData} />
        </div>
    );
};

export default RecentTodoStatsChart;
