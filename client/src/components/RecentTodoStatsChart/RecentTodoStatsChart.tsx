import { ChartData } from 'chart.js';
import { Chart } from 'primereact/chart';
import React from 'react';

type RecentTodoStatsChartProps = {
  chartData: ChartData<'line'> | null;
};

const RecentTodoStatsChart: React.FC<RecentTodoStatsChartProps> = ({
  chartData,
}) => {
  if (!chartData) return null;

  return (
    <div>
      <h3>Todos last 14 days</h3>
      <Chart type="line" data={chartData} />
    </div>
  );
};

export default RecentTodoStatsChart;
