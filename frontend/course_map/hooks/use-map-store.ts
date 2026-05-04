import { create } from "zustand";
import type { MapLayerId, CampusEvent } from "@/types";

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface MapState {
  viewState: ViewState;
  selectedEvent: CampusEvent | null;
  userLocation: [number, number] | null;
  selectedDestination: [number, number] | null;
  activeLayers: Record<MapLayerId, boolean>;

  setViewState: (viewState: Partial<ViewState>) => void;
  setSelectedEvent: (event: CampusEvent | null) => void;
  setUserLocation: (coords: [number, number] | null) => void;
  setSelectedDestination: (coords: [number, number] | null) => void;
  toggleLayer: (layerId: MapLayerId) => void;
  resetNavigation: () => void;
  transportMode: "driving" | "walking";
  setTransportMode: (mode: "driving" | "walking") => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewState: {
    longitude: -87.47357432996594,
    latitude: 41.58392629103461,
    zoom: 16.1,
    pitch: 0,
    bearing: 0,
  },
  selectedEvent: null,
  userLocation: null,
  selectedDestination: null,
  activeLayers: {
    buildings: false,
    events: true,
    parking: true,
    restaurants: true,
    banks: false,
    grocery: false,
  },
  transportMode: "driving",

  setViewState: (newViewState) =>
    set((state) => ({ viewState: { ...state.viewState, ...newViewState } })),

  setSelectedEvent: (event) => set({ selectedEvent: event }),

  setUserLocation: (coords) => set({ userLocation: coords }),

  setSelectedDestination: (coords) => set({ selectedDestination: coords }),

  toggleLayer: (layerId) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layerId]: !state.activeLayers[layerId],
      },
    })),

  resetNavigation: () =>
    set({ selectedDestination: null, userLocation: null, selectedEvent: null }),

  setTransportMode: (mode) => set({ transportMode: mode }),
}));
