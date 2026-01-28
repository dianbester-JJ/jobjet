import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { southAfricanTowns, Town } from "@/data/southAfricanTowns";

interface ServiceRadiusMapProps {
  selectedTown: Town | null;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

// Major cities for reference on the map
const majorCities: Town[] = [
  { name: "Johannesburg", province: "Gauteng", lat: -26.2041, lng: 28.0473 },
  { name: "Cape Town", province: "Western Cape", lat: -33.9249, lng: 18.4241 },
  { name: "Durban", province: "KwaZulu-Natal", lat: -29.8587, lng: 31.0218 },
  { name: "Pretoria", province: "Gauteng", lat: -25.7479, lng: 28.2293 },
  { name: "Port Elizabeth", province: "Eastern Cape", lat: -33.9608, lng: 25.6022 },
  { name: "Bloemfontein", province: "Free State", lat: -29.0852, lng: 26.1596 },
  { name: "Polokwane", province: "Limpopo", lat: -23.9042, lng: 29.4686 },
  { name: "Nelspruit", province: "Mpumalanga", lat: -25.4753, lng: 30.9694 },
  { name: "Kimberley", province: "Northern Cape", lat: -28.7386, lng: 24.7631 },
  { name: "Mahikeng", province: "North West", lat: -25.8653, lng: 25.6436 },
  { name: "East London", province: "Eastern Cape", lat: -33.0292, lng: 27.8546 },
  { name: "Pietermaritzburg", province: "KwaZulu-Natal", lat: -29.6006, lng: 30.3794 },
];

// Map boundaries for South Africa
const MAP_BOUNDS = {
  minLat: -35.0,
  maxLat: -22.0,
  minLng: 16.0,
  maxLng: 33.0,
};

const MAP_WIDTH = 400;
const MAP_HEIGHT = 300;

// Convert lat/lng to map coordinates
const toMapCoords = (lat: number, lng: number) => {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_WIDTH;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_HEIGHT;
  return { x, y };
};

// Convert km to pixels (approximate - based on map scale)
const kmToPixels = (km: number) => {
  // South Africa is approximately 1,700km wide
  // Map width is 400px, so 1 km ≈ 0.235 pixels
  const scale = MAP_WIDTH / 1700;
  return km * scale;
};

const ServiceRadiusMap = ({
  selectedTown,
  radius,
  onRadiusChange,
}: ServiceRadiusMapProps) => {
  const selectedCoords = useMemo(() => {
    if (!selectedTown) return null;
    return toMapCoords(selectedTown.lat, selectedTown.lng);
  }, [selectedTown]);

  const radiusPixels = kmToPixels(radius);

  // Get nearby towns for the zoomed view
  const nearbyTowns = useMemo(() => {
    if (!selectedTown) return [];
    
    return southAfricanTowns
      .filter((town) => {
        if (town.name === selectedTown.name && town.province === selectedTown.province) return false;
        const distance = Math.sqrt(
          Math.pow(town.lat - selectedTown.lat, 2) + Math.pow(town.lng - selectedTown.lng, 2)
        );
        // Only show towns within roughly 3 degrees (about 300km)
        return distance < 3;
      })
      .slice(0, 12);
  }, [selectedTown]);

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
      
      <div className="relative overflow-hidden rounded-lg border border-border bg-muted/30">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="h-auto w-full"
          style={{ minHeight: "250px" }}
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--muted))" />
              <stop offset="100%" stopColor="hsl(var(--background))" />
            </linearGradient>
            <radialGradient id="radiusGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#mapGradient)" />
          
          {/* Simplified South Africa outline */}
          <path
            d="M 60 180 Q 70 200, 90 220 Q 120 250, 160 260 Q 200 265, 240 255 Q 280 245, 310 220 Q 330 200, 340 170 Q 350 140, 340 110 Q 330 80, 300 60 Q 270 45, 230 40 Q 190 35, 150 45 Q 110 55, 80 80 Q 60 100, 55 130 Q 50 160, 60 180 Z"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          
          {/* Major cities as reference points */}
          {majorCities.map((city) => {
            const coords = toMapCoords(city.lat, city.lng);
            const isSelected = selectedTown?.name === city.name;
            return (
              <g key={city.name}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  opacity={isSelected ? 1 : 0.5}
                />
                <text
                  x={coords.x}
                  y={coords.y - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px] font-medium"
                  opacity={0.7}
                >
                  {city.name}
                </text>
              </g>
            );
          })}
          
          {/* Service radius circle */}
          {selectedCoords && (
            <>
              <circle
                cx={selectedCoords.x}
                cy={selectedCoords.y}
                r={radiusPixels}
                fill="url(#radiusGradient)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              
              {/* Center point */}
              <circle
                cx={selectedCoords.x}
                cy={selectedCoords.y}
                r={6}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="2"
              />
              
              {/* Selected town label */}
              <text
                x={selectedCoords.x}
                y={selectedCoords.y - 14}
                textAnchor="middle"
                className="fill-primary text-[10px] font-semibold"
              >
                {selectedTown?.name}
              </text>
              
              {/* Nearby towns within view */}
              {nearbyTowns.map((town) => {
                const coords = toMapCoords(town.lat, town.lng);
                const distance = Math.sqrt(
                  Math.pow(coords.x - selectedCoords.x, 2) + 
                  Math.pow(coords.y - selectedCoords.y, 2)
                );
                const isWithinRadius = distance <= radiusPixels;
                
                return (
                  <g key={`${town.name}-${town.province}`}>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={3}
                      fill={isWithinRadius ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      opacity={isWithinRadius ? 0.8 : 0.4}
                    />
                    <text
                      x={coords.x}
                      y={coords.y + 12}
                      textAnchor="middle"
                      className="text-[7px]"
                      fill={isWithinRadius ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      opacity={isWithinRadius ? 1 : 0.6}
                    >
                      {town.name}
                    </text>
                  </g>
                );
              })}
            </>
          )}
          
          {/* No selection message */}
          {!selectedTown && (
            <text
              x={MAP_WIDTH / 2}
              y={MAP_HEIGHT / 2}
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              Select a location to see service area
            </text>
          )}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Your area</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full border-2 border-dashed border-primary bg-primary/20" />
            <span className="text-muted-foreground">{radius}km radius</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRadiusMap;
