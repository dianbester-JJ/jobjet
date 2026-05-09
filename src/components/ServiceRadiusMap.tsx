import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Town } from "@/data/southAfricanTowns";

// Fix default marker icons (Vite/Leaflet)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface ServiceRadiusMapProps {
  selectedTown: Town | null;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

const Recenter = ({ town, radius }: { town: Town; radius: number }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLng(town.lat, town.lng).toBounds(radius * 2000);
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [town, radius, map]);
  return null;
};

const ServiceRadiusMap = ({ selectedTown, radius, onRadiusChange }: ServiceRadiusMapProps) => {
  const center: [number, number] = selectedTown
    ? [selectedTown.lat, selectedTown.lng]
    : [-29.0, 24.0]; // South Africa center

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Service Radius: {radius} km</Label>
      </div>

      <Slider
        value={[radius]}
        onValueChange={(values) => onRadiusChange(values[0])}
        min={5}
        max={100}
        step={5}
        className="w-full"
      />

      <div className="overflow-hidden rounded-lg border border-border" style={{ height: 320 }}>
        <MapContainer
          center={center}
          zoom={selectedTown ? 10 : 5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {selectedTown && (
            <>
              <Marker position={[selectedTown.lat, selectedTown.lng]} />
              <Circle
                center={[selectedTown.lat, selectedTown.lng]}
                radius={radius * 1000}
                pathOptions={{
                  color: "hsl(195, 70%, 35%)",
                  fillColor: "hsl(195, 70%, 35%)",
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
              <Recenter town={selectedTown} radius={radius} />
            </>
          )}
        </MapContainer>
      </div>

      {!selectedTown && (
        <p className="text-xs text-muted-foreground">Select a location to see your service area.</p>
      )}
    </div>
  );
};

export default ServiceRadiusMap;
