"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type EarthquakeMapComponent from "./EarthquakeMap";

// Leaflet requires browser APIs — SSR must be disabled
const EarthquakeMap = dynamic(() => import("./EarthquakeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

export default EarthquakeMap;
export type { ComponentProps };
