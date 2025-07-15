
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ProductivityData } from '@/hooks/useDashboard';

interface ProductivityChartProps {
  data: ProductivityData[];
}

const chartConfig = {
  tasksCompleted: {
    label: "Tasks Completed",
    color: "hsl(var(--chart-1))",
  },
  projectsCompleted: {
    label: "Projects Completed",
    color: "hsl(var(--chart-2))",
  },
};

const ProductivityChart: React.FC<ProductivityChartProps> = ({ data }) => {
  return (
    <Card className="glass-card neon-border-green">
      <CardHeader>
        <CardTitle className="text-white">7-Day Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="tasksCompleted" 
                fill="var(--color-tasksCompleted)"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="projectsCompleted" 
                fill="var(--color-projectsCompleted)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProductivityChart;
