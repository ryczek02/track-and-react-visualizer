
import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SensorData } from '@/types/SensorData';
import { toast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onDataLoad: (data: SensorData[]) => void;
}

const CSVUploader = ({ onDataLoad }: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCSV = (text: string): SensorData[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data: SensorData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length && values[0]) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        data.push({
          timestamp: row.timestamp,
          lat: parseFloat(row.lat) || 0,
          lon: parseFloat(row.lon) || 0,
          alt: parseFloat(row.alt) || 0,
          sats: parseInt(row.sats) || 0,
          accX: parseFloat(row.accX) || 0,
          accY: parseFloat(row.accY) || 0,
          accZ: parseFloat(row.accZ) || 0,
          gyroX: parseFloat(row.gyroX) || 0,
          gyroY: parseFloat(row.gyroY) || 0,
          gyroZ: parseFloat(row.gyroZ) || 0,
          pitch: parseFloat(row.pitch) || 0,
          roll: parseFloat(row.roll) || 0,
        });
      }
    }
    
    return data;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    
    try {
      const text = await file.text();
      console.log('Raw CSV text:', text);
      
      const parsedData = parseCSV(text);
      console.log('Processed data:', parsedData);
      
      onDataLoad(parsedData);
      
      toast({
        title: "CSV loaded successfully!",
        description: `Processed ${parsedData.length} data points`,
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: "Please check your CSV format",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      processFile(csvFile);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file",
      });
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    onDataLoad([]);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600">Processing CSV file...</p>
            </div>
          ) : fileName ? (
            <div className="space-y-4">
              <FileText className="w-12 h-12 text-green-500 mx-auto" />
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-700 font-medium">{fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                File loaded successfully! Charts and map are now available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload your CSV file
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button asChild>
                    <span className="cursor-pointer">Choose File</span>
                  </Button>
                </label>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Expected format: timestamp,lat,lon,alt,sats,accX,accY,accZ,gyroX,gyroY,gyroZ,pitch,roll</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUploader;
