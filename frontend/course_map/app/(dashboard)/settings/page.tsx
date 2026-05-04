"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, CheckCircle, AlertCircle, Navigation } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
          if (!token) throw new Error("Mapbox token missing");

          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`
          );
          const data = await res.json();
          
          if (data.features && data.features.length > 0) {
            setAddress(data.features[0].place_name);
            setStatus("idle");
          } else {
            throw new Error("Could not determine address");
          }
        } catch (error) {
          setAddress(`${latitude}, ${longitude}`); // Fallback to raw coords
          setStatus("idle");
        }
      },
      (error) => {
        setStatus("error");
        setErrorMessage("Could not get your location. Please check permissions.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    if (!user) {
      setStatus("error");
      setErrorMessage("You must be logged in to save an address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/settings/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_address: address.trim(),
          input_type: "Home",
          user_id: user.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to save address");
      }

      setStatus("success");
      setAddress("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An error occurred");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-display-sm text-primary mb-2">Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your account preferences and saved locations.</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-headline-sm text-on-surface">Saved Addresses</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  placeholder="123 Main St, Hammond, IN 46323"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={status === "loading"}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-secondary border-secondary/30 hover:bg-secondary/10"
                  onClick={handleCurrentLocation}
                  disabled={status === "loading"}
                  title="Use current location"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-label-sm text-on-surface-variant">
                We'll use this as the default starting point for your routes.
              </p>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-error text-label-md bg-error/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <p>{errorMessage}</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4" />
                <p>Address saved successfully!</p>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={status === "loading" || !address.trim()}>
                {status === "loading" ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
