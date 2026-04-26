"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, ZoomControl } from "react-leaflet";
import type { EarthquakeFeature } from "@/types/earthquake";
import {
  getMagnitudeColor,
  getDepthColor,
  getMagnitudeRadius,
  getMagnitudeLabel,
  formatRelativeTime,
  formatDepth,
  getAlertColor,
} from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface Props {
  features: EarthquakeFeature[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMode: "magnitude" | "depth";
}

function FlyToSelected({ features, selectedId }: { features: EarthquakeFeature[]; selectedId: string | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return;
    const f = features.find((q) => q.id === selectedId);
    if (!f) return;
    const [lng, lat] = f.geometry.coordinates;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 5), { duration: 1.2 });
    prevId.current = selectedId;
  }, [selectedId, features, map]);

  return null;
}

export default function EarthquakeMap({ features, selectedId, onSelect, colorMode }: Props) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="w-full h-full"
      zoomControl={false}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <FlyToSelected features={features} selectedId={selectedId} />

      {features.map((quake) => {
        const [lng, lat, depth] = quake.geometry.coordinates;
        const mag = quake.properties.mag;
        const isSelected = quake.id === selectedId;

        const color =
          colorMode === "depth"
            ? getDepthColor(depth)
            : getMagnitudeColor(mag);

        return (
          <CircleMarker
            key={quake.id}
            center={[lat, lng]}
            radius={getMagnitudeRadius(mag) * (isSelected ? 1.5 : 1)}
            pathOptions={{
              fillColor: color,
              fillOpacity: isSelected ? 1 : 0.7,
              color: isSelected ? "#fff" : color,
              weight: isSelected ? 2 : 0.5,
            }}
            eventHandlers={{ click: () => onSelect(quake.id) }}
          >
            <Popup className="quake-popup">
              <div className="min-w-[200px]">
                <div className="font-bold text-sm mb-1">{quake.properties.title}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-300">
                  <span className="text-gray-400">Magnitude</span>
                  <span
                    className="font-semibold"
                    style={{ color: getMagnitudeColor(mag) }}
                  >
                    {mag?.toFixed(1) ?? "—"} ({getMagnitudeLabel(mag)})
                  </span>

                  <span className="text-gray-400">Depth</span>
                  <span>{formatDepth(depth)}</span>

                  <span className="text-gray-400">Time</span>
                  <span>{formatRelativeTime(quake.properties.time)}</span>

                  {quake.properties.felt && (
                    <>
                      <span className="text-gray-400">Felt by</span>
                      <span>{quake.properties.felt.toLocaleString()} people</span>
                    </>
                  )}

                  {quake.properties.alert && (
                    <>
                      <span className="text-gray-400">Alert</span>
                      <span
                        className="font-semibold capitalize"
                        style={{ color: getAlertColor(quake.properties.alert) }}
                      >
                        {quake.properties.alert}
                      </span>
                    </>
                  )}

                  {quake.properties.tsunami === 1 && (
                    <>
                      <span className="text-gray-400">Tsunami</span>
                      <span className="text-blue-400 font-semibold">Warning</span>
                    </>
                  )}
                </div>
                <a
                  href={quake.properties.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs text-blue-400 hover:text-blue-300"
                >
                  View on USGS →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
