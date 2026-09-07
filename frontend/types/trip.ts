export interface TripData {
  id?: number;
  destination?: string;
  days?: number;
  budget?: number;
  travel_style?: string;
  itinerary?: string;
  created_at?: string;
  [key: string]: any;
}

export interface FormValues {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}
