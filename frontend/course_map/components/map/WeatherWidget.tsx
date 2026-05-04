import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from "lucide-react";
import { useMapStore } from "@/hooks/use-map-store";

export function WeatherWidget({ className = "" }: { className?: string }) {
  const { userLocation } = useMapStore();
  const [weather, setWeather] = useState({ temp: 72, desc: "Sunny", Icon: Sun, color: "text-yellow-500" });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const lat = userLocation ? userLocation[1] : 41.5839;
        const lng = userLocation ? userLocation[0] : -87.4735;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
        if (!res.ok) return;
        const data = await res.json();
        const code = data.current.weather_code;
        const temp = Math.round(data.current.temperature_2m);
        
        let desc = "Clear";
        let Icon = Sun;
        let color = "text-yellow-500";
        
        if (code >= 1 && code <= 3) { desc = "Cloudy"; Icon = Cloud; color = "text-gray-400"; }
        else if (code === 45 || code === 48) { desc = "Foggy"; Icon = CloudFog; color = "text-gray-400"; }
        else if (code >= 51 && code <= 67) { desc = "Rainy"; Icon = CloudRain; color = "text-blue-400"; }
        else if (code >= 71 && code <= 82) { desc = "Snowy"; Icon = CloudSnow; color = "text-blue-200"; }
        else if (code >= 95) { desc = "Stormy"; Icon = CloudLightning; color = "text-yellow-600"; }
        
        setWeather({ temp, desc, Icon, color });
      } catch (e) {
        // keep default
      }
    }
    fetchWeather();
  }, [userLocation]);

  return (
    <div className={`bg-surface-container-lowest px-4 py-2 rounded-full shadow-lg border border-outline-variant flex items-center gap-2 ${className}`}>
      <weather.Icon className={`w-4 h-4 ${weather.color}`} aria-hidden="true" />
      <span className="text-label-sm">{weather.temp}°F {weather.desc}</span>
    </div>
  );
}
