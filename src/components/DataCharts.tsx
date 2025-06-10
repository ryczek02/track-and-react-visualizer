
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorData } from '@/types/SensorData';

interface DataChartsProps {
  data: SensorData[];
  selectedTimestamp: string | null;
  onPointSelect: (timestamp: string) => void;
}

const DataCharts = ({ data, selectedTimestamp, onPointSelect }: DataChartsProps) => {
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);

  const handleChartClick = (event: any) => {
    if (event && event.activeLabel) {
      onPointSelect(event.activeLabel);
    }
  };

  const handleBrushChange = (domain: { startIndex?: number; endIndex?: number }) => {
    if (domain.startIndex !== undefined && domain.endIndex !== undefined) {
      setBrushDomain([domain.startIndex, domain.endIndex]);
    } else {
      setBrushDomain(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Check if a point is in the current zoom range
  const isPointInZoom = (index: number) => {
    if (!brushDomain) return true;
    return index >= brushDomain[0] && index <= brushDomain[1];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Accelerometer Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"></div>
            Accelerometer Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              onClick={handleChartClick}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Time: ${formatTimestamp(value)}`}
                formatter={(value: number, name: string) => [value.toFixed(2), name]}
              />
              {selectedTimestamp && (
                <ReferenceLine 
                  x={selectedTimestamp} 
                  stroke="purple" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              <Line 
                type="monotone" 
                dataKey="accX" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={(props: any) => {
                  const isInZoom = isPointInZoom(props.payload?.index || 0);
                  return isInZoom ? { ...props, fill: "#ef4444", r: 3 } : false;
                }}
                name="AccX"
              />
              <Line 
                type="monotone" 
                dataKey="accY" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={(props: any) => {
                  const isInZoom = isPointInZoom(props.payload?.index || 0);
                  return isInZoom ? { ...props, fill: "#22c55e", r: 3 } : false;
                }}
                name="AccY"
              />
              <Line 
                type="monotone" 
                dataKey="accZ" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={(props: any) => {
                  const isInZoom = isPointInZoom(props.payload?.index || 0);
                  return isInZoom ? { ...props, fill: "#3b82f6", r: 3 } : false;
                }}
                name="AccZ"
              />
              <Brush 
                dataKey="timestamp" 
                height={30}
                stroke="#8884d8"
                tickFormatter={formatTimestamp}
                onChange={handleBrushChange}
                startIndex={brushDomain?.[0]}
                endIndex={brushDomain?.[1]}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gyroscope Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"></div>
            Gyroscope Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              onClick={handleChartClick}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Time: ${formatTimestamp(value)}`}
                formatter={(value: number, name: string) => [value.toFixed(2), name]}
              />
              {selectedTimestamp && (
                <ReferenceLine 
                  x={selectedTimestamp} 
                  stroke="purple" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              <Line 
                type="monotone" 
                dataKey="gyroX" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={(props: any) => {
                  const isInZoom = isPointInZoom(props.payload?.index || 0);
                  return isInZoom ? { ...props, fill: "#f97316", r: 3 } : false;
                }}
                name="GyroX"
              />
              <Line 
                type="monotone" 
                dataKey="gyroY" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={(props: any) => {
                  const isInZoom = isPointInZoom(props.payload?.index || 0);
                  return isInZoom ? { ...props, fill: "#8b5cf6", r: 3 } : false;
                }}
                name="GyroY"
              />
              <Line 
                type="monotone" 
                dataKey="gyroZ" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={(props: any) => {
                  const isInZoom = isPointInZoom(props.payload?.index || 0);
                  return isInZoom ? { ...props, fill: "#06b6d4", r: 3 } : false;
                }}
                name="GyroZ"
              />
              <Brush 
                dataKey="timestamp" 
                height={30}
                stroke="#8884d8"
                tickFormatter={formatTimestamp}
                onChange={handleBrushChange}
                startIndex={brushDomain?.[0]}
                endIndex={brushDomain?.[1]}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCharts;
