export interface ShuttleRunPoint {
  Point: number;
  Time: string;
  Duration: string;
  'Speed(mph)': number;
  'Distance(mile)': number;
  'Altitude(feet)': number;
  'Latitude(WGS84)': number;
  'Longitude(WGS84)': number;
  'Latitude(BD09)': number;
  'Longitude(BD09)': number;
}

export interface ShuttleRun {
  name: string;
  key: string;
  points: Array<ShuttleRunPoint>;
}
