
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorData } from '@/types/SensorData';

interface DataChartsProps {
  data: SensorData[];
  selectedTimestamp: string | null;
  onPointSelect: (timestamp: string) => void;
}

const DataCharts = ({ data, selectedTimestamp, onPointSelect }: DataChartsProps) => {
  const handleChartClick = (data: any) => {
    console.log('Chart clicked:', data);
    if (data && data.activeLabel) {
      console.log('Selected timestamp:', data.activeLabel);
      onPointSelect(data.activeLabel);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              onClick={handleChartClick}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              <Line 
                type="monotone" 
                dataKey="accX" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#ef4444' }}
                name="AccX"
              />
              <Line 
                type="monotone" 
                dataKey="accY" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#22c55e' }}
                name="AccY"
              />
              <Line 
                type="monotone" 
                dataKey="accZ" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                name="AccZ"
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              onClick={handleChartClick}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              <Line 
                type="monotone" 
                dataKey="gyroX" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#f97316' }}
                name="GyroX"
              />
              <Line 
                type="monotone" 
                dataKey="gyroY" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
                name="GyroY"
              />
              <Line 
                type="monotone" 
                dataKey="gyroZ" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#06b6d4' }}
                name="GyroZ"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCharts;
