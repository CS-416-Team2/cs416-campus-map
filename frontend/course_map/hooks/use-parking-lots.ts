import { useEffect, useState } from "react";
import { ParkingLot } from "@/types";

export function useParkingLots() {
  const [data, setData] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParkingLots() {
      try {
        const response = await fetch("/api/parking-lots?limit=100");
        if (!response.ok) throw new Error("Failed to fetch parking lots");
        const payload = await response.json();
        setData(payload.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchParkingLots();
  }, []);

  return { data, isLoading, error };
}
