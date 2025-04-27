'use client';

import { Activity, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Sample data for attention levels over time (0-100)
const attentionData = [
  { time: '12:00', attention: 75 },
  { time: '12:05', attention: 82 },
  { time: '12:10', attention: 78 },
  { time: '12:15', attention: 65 },
  { time: '12:20', attention: 71 },
  { time: '12:25', attention: 85 },
  { time: '12:30', attention: 92 },
  { time: '12:35', attention: 87 },
  { time: '12:40', attention: 79 },
  { time: '12:45', attention: 88 },
];

// Calculate average attention
const averageAttention = Math.round(
  attentionData.reduce((sum, item) => sum + item.attention, 0) /
    attentionData.length
);

// Calculate trend (comparing first half to second half)
const halfwayPoint = Math.floor(attentionData.length / 2);
const firstHalfAvg = Math.round(
  attentionData
    .slice(0, halfwayPoint)
    .reduce((sum, item) => sum + item.attention, 0) / halfwayPoint
);
const secondHalfAvg = Math.round(
  attentionData
    .slice(halfwayPoint)
    .reduce((sum, item) => sum + item.attention, 0) /
    (attentionData.length - halfwayPoint)
);
const trendPercentage = Math.round(
  ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
);
const isTrendingUp = trendPercentage > 0;

const chartConfig = {
  attention: {
    label: 'Attention',
    color: 'hsl(215, 100%, 60%)',
    icon: Activity,
  },
} satisfies ChartConfig;

export default function AttentionChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" /> Your History
        </CardTitle>
        <CardDescription className="text-xs">
          Your focus level over the current session
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <ChartContainer config={chartConfig} className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={attentionData}
              margin={{
                left: 0,
                right: 0,
                top: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} opacity={0.2} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                minTickGap={15}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Area
                dataKey="attention"
                type="monotone"
                fill="var(--color-attention)"
                fillOpacity={0.3}
                stroke="var(--color-attention)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full items-center justify-between text-xs">
          <div className="font-medium">Avg: {averageAttention}%</div>
          <div
            className={`flex items-center gap-1 ${
              isTrendingUp ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            {isTrendingUp ? (
              <>
                Trending up by {Math.abs(trendPercentage)}%
                <TrendingUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Trending down by {Math.abs(trendPercentage)}%
                <TrendingDown className="h-3 w-3" />
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
