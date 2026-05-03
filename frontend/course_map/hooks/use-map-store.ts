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
}

export const useMapStore = create<MapState>((set) => ({
  viewState: {
    longitude: -122.1697,
    latitude: 37.4275,
    zoom: 15.5,
    pitch: 45,
    bearing: 0,
  },
  selectedEvent: null,
  userLocation: null,
  selectedDestination: null,
  activeLayers: {
    buildings: true,
    events: true,
    parking: true,
    restaurants: true,
    banks: false,
    grocery: false,
  },

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
}));
