export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Constants,
} from "./database";

export type EventCategory = "orange" | "green" | "blue";

export type EventTag = "academic" | "athletics" | "social" | "workshops";

export interface ParkingSpot {
  id: string;
  name: string;
  distance: string;
  spotsLeft: number;
  price: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  imageUrl: string;
  coordinates: [number, number]; // [lng, lat]
  capacity: number;
  registered: number;
  tags: EventTag[];
  parking: ParkingSpot[];
}

export interface RouteStep {
  icon: "turn_right" | "straight" | "roundabout_right" | "turn_left" | "merge";
  instruction: string;
  distance: string;
}

export interface NavigationRoute {
  geoJson: GeoJSON.Feature<GeoJSON.LineString>;
  metrics: {
    distanceMiles: string;
    durationMinutes: number;
    tolls: string;
  };
  steps: RouteStep[];
}

export interface MapMarkerData {
  id: string;
  type: "building" | "event" | "parking" | "restaurant" | "bank" | "grocery";
  name: string;
  coordinates: [number, number]; // [lng, lat]
  color: string;
  eventId?: string;
}

export type MapLayerId =
  | "buildings"
  | "events"
  | "parking"
  | "restaurants"
  | "banks"
  | "grocery";

export interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
}
