
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SensorData } from '@/types/SensorData';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GPSMapProps {
  data: SensorData[];
  selectedTimestamp: string | null;
  onPointSelect: (timestamp: string) => void;
}

const GPSMap = ({ data, selectedTimestamp, onPointSelect }: GPSMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const polyline = useRef<L.Polyline | null>(null);
  const markers = useRef<{ [key: string]: L.CircleMarker }>({});
  const selectedMarker = useRef<L.CircleMarker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    if (!mapContainer.current || data.length === 0) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([0, 0], 2);
      
      // Add default tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);
    }

    // Clear existing markers and polyline
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};
    if (polyline.current) {
      polyline.current.remove();
    }
    if (selectedMarker.current) {
      selectedMarker.current.remove();
      selectedMarker.current = null;
    }

    // Filter valid GPS coordinates
    const validData = data.filter(point => point.lat !== 0 && point.lon !== 0);
    
    if (validData.length === 0) return;

    // Create GPS track polyline
    const coordinates = validData.map(point => [point.lat, point.lon] as [number, number]);
    polyline.current = L.polyline(coordinates, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8
    }).addTo(map.current!);

    // Add clickable markers for each point
    validData.forEach((point, index) => {
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 4,
        fillColor: '#10b981',
        color: '#059669',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map.current!);

      marker.bindPopup(`
        <div class="space-y-2">
          <div><strong>Time:</strong> ${new Date(point.timestamp).toLocaleString()}</div>
          <div><strong>Position:</strong> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
          <div><strong>Altitude:</strong> ${point.alt.toFixed(1)}m</div>
          <div><strong>Satellites:</strong> ${point.sats}</div>
          <div><strong>Accelerometer:</strong> X: ${point.accX.toFixed(2)}, Y: ${point.accY.toFixed(2)}, Z: ${point.accZ.toFixed(2)}</div>
          <div><strong>Gyroscope:</strong> X: ${point.gyroX.toFixed(2)}, Y: ${point.gyroY.toFixed(2)}, Z: ${point.gyroZ.toFixed(2)}</div>
        </div>
      `);

      marker.on('click', () => {
        onPointSelect(point.timestamp);
      });

      markers.current[point.timestamp] = marker;
    });

    // Fit map to show all points
    map.current.fitBounds(polyline.current.getBounds(), { padding: [20, 20] });

  }, [data]);

  // Update selected point visualization
  useEffect(() => {
    if (selectedMarker.current) {
      selectedMarker.current.remove();
      selectedMarker.current = null;
    }

    if (selectedTimestamp && markers.current[selectedTimestamp]) {
      const point = data.find(p => p.timestamp === selectedTimestamp);
      if (point && point.lat !== 0 && point.lon !== 0) {
        selectedMarker.current = L.circleMarker([point.lat, point.lon], {
          radius: 8,
          fillColor: '#8b5cf6',
          color: '#7c3aed',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map.current!);
      }
    }
  }, [selectedTimestamp, data]);

  const handleMapboxTokenChange = (token: string) => {
    setMapboxToken(token);
    if (map.current && token.trim()) {
      // Remove existing tile layers
      map.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.current!.removeLayer(layer);
        }
      });

      // Add Mapbox satellite layer
      L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${token}`, {
        attribution: '© Mapbox',
        tileSize: 512,
        zoomOffset: -1
      }).addTo(map.current);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          GPS Track Map
        </CardTitle>
        <div className="space-y-2">
          <Label htmlFor="mapbox-token" className="text-sm text-gray-600">
            Optional: Enter Mapbox token for satellite imagery
          </Label>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsay..."
            value={mapboxToken}
            onChange={(e) => handleMapboxTokenChange(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-gray-500">
            Get your free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg border border-gray-200"
        />
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>• <span className="text-blue-500 font-medium">Blue line</span>: GPS track</p>
          <p>• <span className="text-green-500 font-medium">Green dots</span>: Data points (click to select)</p>
          <p>• <span className="text-purple-500 font-medium">Purple dot</span>: Selected timestamp</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSMap;
