"use client";

interface Props {
  colorMode: "magnitude" | "depth";
}

interface ScaleEntry {
  label: string;
  color: string;
  sub?: string;
}

const MAG_SCALE: ScaleEntry[] = [
  { label: "< 1", color: "#22d3ee" },
  { label: "1–2", color: "#4ade80" },
  { label: "2–3", color: "#a3e635" },
  { label: "3–4", color: "#facc15" },
  { label: "4–5", color: "#fb923c" },
  { label: "5–6", color: "#f87171" },
  { label: "6–7", color: "#e11d48" },
  { label: "7+", color: "#7c3aed" },
];

const DEPTH_SCALE: ScaleEntry[] = [
  { label: "< 20 km", color: "#ef4444", sub: "Very shallow" },
  { label: "20–70 km", color: "#f97316", sub: "Shallow" },
  { label: "70–150 km", color: "#eab308", sub: "Intermediate" },
  { label: "150–300 km", color: "#22c55e", sub: "Deep" },
  { label: "300–500 km", color: "#3b82f6", sub: "Very deep" },
  { label: "500+ km", color: "#8b5cf6", sub: "Ultra deep" },
];

export default function MapLegend({ colorMode }: Props) {
  const scale = colorMode === "magnitude" ? MAG_SCALE : DEPTH_SCALE;
  const title = colorMode === "magnitude" ? "Magnitude" : "Depth";

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-xl p-3 min-w-[140px]">
      <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="space-y-1.5">
        {scale.map(({ label, color, sub }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <div>
              <div className="text-xs text-gray-300">{label}</div>
              {sub && <div className="text-[10px] text-gray-500">{sub}</div>}
            </div>
          </div>
        ))}
      </div>
      {colorMode === "magnitude" && (
        <div className="mt-2 pt-2 border-t border-gray-800 space-y-1">
          <div className="text-[10px] text-gray-500">Circle size = magnitude</div>
        </div>
      )}
    </div>
  );
}
