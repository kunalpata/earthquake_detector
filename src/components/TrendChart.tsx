"use client";

import type { DailyCount } from "@/types/earthquake";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getMagnitudeColor } from "@/lib/utils";

interface Props {
  data: DailyCount[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DailyCount;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <div className="font-semibold text-white mb-1">{label}</div>
      <div className="text-gray-300">{d.count} earthquakes</div>
      <div style={{ color: getMagnitudeColor(d.maxMag) }}>
        Max M {d.maxMag.toFixed(1)}
      </div>
    </div>
  );
}

export default function TrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell
              key={entry.date}
              fill={getMagnitudeColor(entry.maxMag)}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
