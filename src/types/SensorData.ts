
export interface SensorData {
  timestamp: string;
  lat: number;
  lon: number;
  alt: number;
  sats: number;
  accX: number;
  accY: number;
  accZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  pitch: number;
  roll: number;
}
