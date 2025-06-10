
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [mapStats, setMapStats] = useState({ totalPoints: 0, validGPS: 0, distance: 0 });

  const calculateDistance = (coordinates: [number, number][]) => {
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const [lat1, lon1] = coordinates[i - 1];
      const [lat2, lon2] = coordinates[i];
      
      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDistance += R * c;
    }
    return totalDistance;
  };

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
    
    if (validData.length === 0) {
      setMapStats({ totalPoints: data.length, validGPS: 0, distance: 0 });
      return;
    }

    // Create GPS track polyline
    const coordinates = validData.map(point => [point.lat, point.lon] as [number, number]);
    const distance = calculateDistance(coordinates);
    
    setMapStats({ 
      totalPoints: data.length, 
      validGPS: validData.length, 
      distance: Math.round(distance * 100) / 100 
    });

    polyline.current = L.polyline(coordinates, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8
    }).addTo(map.current!);

    // Add clickable markers for each point
    validData.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 4,
        fillColor: '#10b981',
        color: '#059669',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map.current!);

      const magnitude = Math.sqrt(point.accX ** 2 + point.accY ** 2 + point.accZ ** 2);
      const gyroMagnitude = Math.sqrt(point.gyroX ** 2 + point.gyroY ** 2 + point.gyroZ ** 2);

      marker.bindPopup(`
        <div class="space-y-2 min-w-64">
          <div class="font-semibold text-center border-b pb-2">${new Date(point.timestamp).toLocaleString()}</div>
          
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Position:</strong></div>
            <div>${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</div>
            
            <div><strong>Altitude:</strong></div>
            <div>${point.alt.toFixed(1)}m</div>
            
            <div><strong>Satellites:</strong></div>
            <div>${point.sats}</div>
            
            <div><strong>Pitch/Roll:</strong></div>
            <div>${point.pitch.toFixed(1)}° / ${point.roll.toFixed(1)}°</div>
          </div>
          
          <div class="space-y-1 text-sm">
            <div class="font-medium">Accelerometer (m/s²):</div>
            <div class="pl-2">X: ${point.accX.toFixed(2)}, Y: ${point.accY.toFixed(2)}, Z: ${point.accZ.toFixed(2)}</div>
            <div class="pl-2">Magnitude: ${magnitude.toFixed(2)}</div>
            
            <div class="font-medium">Gyroscope (°/s):</div>
            <div class="pl-2">X: ${point.gyroX.toFixed(2)}, Y: ${point.gyroY.toFixed(2)}, Z: ${point.gyroZ.toFixed(2)}</div>
            <div class="pl-2">Magnitude: ${gyroMagnitude.toFixed(2)}</div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        console.log('Map marker clicked:', point.timestamp);
        onPointSelect(point.timestamp);
      });

      markers.current[point.timestamp] = marker;
    });

    // Fit map to show all points
    if (polyline.current) {
      map.current.fitBounds(polyline.current.getBounds(), { padding: [20, 20] });
    }

  }, [data, onPointSelect]);

  // Update selected point visualization
  useEffect(() => {
    console.log('Selected timestamp changed:', selectedTimestamp);
    
    if (selectedMarker.current) {
      selectedMarker.current.remove();
      selectedMarker.current = null;
    }

    if (selectedTimestamp && map.current) {
      const point = data.find(p => p.timestamp === selectedTimestamp);
      console.log('Found point for timestamp:', point);
      
      if (point && point.lat !== 0 && point.lon !== 0) {
        selectedMarker.current = L.circleMarker([point.lat, point.lon], {
          radius: 8,
          fillColor: '#8b5cf6',
          color: '#7c3aed',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map.current);

        // Pan to selected point
        map.current.panTo([point.lat, point.lon]);
        console.log('Added selected marker at:', point.lat, point.lon);
      }
    }
  }, [selectedTimestamp, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          GPS Track Map
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Total Points:</span> {mapStats.totalPoints}
          </div>
          <div>
            <span className="font-medium">Valid GPS:</span> {mapStats.validGPS}
          </div>
          <div>
            <span className="font-medium">Distance:</span> {mapStats.distance} km
          </div>
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
          <p>• Click on chart points to select corresponding map locations</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSMap;
