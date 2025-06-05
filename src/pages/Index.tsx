
import { useState } from 'react';
import CSVUploader from '@/components/CSVUploader';
import DataCharts from '@/components/DataCharts';
import GPSMap from '@/components/GPSMap';
import { SensorData } from '@/types/SensorData';

const Index = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);

  const handleDataLoad = (newData: SensorData[]) => {
    setData(newData);
    setSelectedTimestamp(null);
  };

  const handlePointSelect = (timestamp: string) => {
    setSelectedTimestamp(timestamp);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GPS & Sensor Data Visualizer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your CSV file to visualize GPS tracks and sensor data
          </p>
        </header>

        <CSVUploader onDataLoad={handleDataLoad} />

        {data.length > 0 && (
          <>
            <DataCharts 
              data={data} 
              selectedTimestamp={selectedTimestamp}
              onPointSelect={handlePointSelect}
            />
            <GPSMap 
              data={data} 
              selectedTimestamp={selectedTimestamp}
              onPointSelect={handlePointSelect}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
