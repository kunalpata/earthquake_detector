"use client";

import type { EarthquakeStats } from "@/types/earthquake";
import { getMagnitudeColor } from "@/lib/utils";
import { Activity, AlertTriangle, Waves, TrendingUp, MapPin, Zap } from "lucide-react";

interface Props {
  stats: EarthquakeStats;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 flex items-start gap-3">
      <div className="mt-0.5 shrink-0" style={{ color: color ?? "#94a3b8" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide truncate">{label}</div>
        <div className="text-xl font-bold text-white mt-0.5" style={{ color }}>
          {value}
        </div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function StatsPanel({ stats }: Props) {
  const maxMagColor = getMagnitudeColor(stats.maxMagnitude);

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <StatCard
        icon={<Activity size={18} />}
        label="Total Events"
        value={stats.total.toLocaleString()}
        sub="in selected range"
        color="#60a5fa"
      />
      <StatCard
        icon={<Zap size={18} />}
        label="Max Magnitude"
        value={stats.maxMagnitude > 0 ? `M ${stats.maxMagnitude.toFixed(1)}` : "—"}
        sub={stats.maxMagnitude > 0 ? getMagLabel(stats.maxMagnitude) : undefined}
        color={stats.maxMagnitude > 0 ? maxMagColor : undefined}
      />
      <StatCard
        icon={<TrendingUp size={18} />}
        label="Avg Magnitude"
        value={stats.total > 0 ? `M ${stats.avgMagnitude.toFixed(2)}` : "—"}
        color="#a78bfa"
      />
      <StatCard
        icon={<MapPin size={18} />}
        label="Avg Depth"
        value={stats.total > 0 ? `${stats.avgDepth.toFixed(1)} km` : "—"}
        sub={stats.total > 0 ? getDepthLabel(stats.avgDepth) : undefined}
        color="#34d399"
      />
      <StatCard
        icon={<AlertTriangle size={18} />}
        label="Significant (M5+)"
        value={stats.significantCount.toLocaleString()}
        color={stats.significantCount > 0 ? "#f97316" : undefined}
      />
      <StatCard
        icon={<Waves size={18} />}
        label="Tsunami Alerts"
        value={stats.tsunamiCount.toLocaleString()}
        color={stats.tsunamiCount > 0 ? "#38bdf8" : undefined}
      />
    </div>
  );
}

function getMagLabel(mag: number): string {
  if (mag < 2) return "Micro";
  if (mag < 4) return "Minor";
  if (mag < 5) return "Light";
  if (mag < 6) return "Moderate";
  if (mag < 7) return "Strong";
  if (mag < 8) return "Major";
  return "Great";
}

function getDepthLabel(depth: number): string {
  if (depth < 70) return "Shallow crust";
  if (depth < 300) return "Intermediate";
  return "Deep focus";
}
