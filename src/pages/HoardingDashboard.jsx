import React, { useState, useEffect } from "react";
import HoardingCard from "../component/HoardingCard";
import StreetViewModal from "../component/StreetViewModal";

export default function HoardingDashboard() {
  const [selectedHoarding, setSelectedHoarding] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🧠 Load Google Maps script once
  useEffect(() => {
    if (!window.google) {
      const existing = document.querySelector('script[data-gmaps-loader="true"]');
      if (!existing) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.setAttribute("data-gmaps-loader", "true");
        document.body.appendChild(script);
      }
    }
  }, []);

  const hoardings = [
    {
      id: 1,
      title: "Highway Display - Kolhapur",
      locationName: "NH4 Kolhapur Exit",
      lat: 16.705,
      lng: 74.2433,
      size: "20x10 ft",
      price: 25000,
      available: true,
      expiryDate: "2025-12-31",
    },
    {
      id: 2,
      title: "City Center LED Board",
      locationName: "Near DYP Mall, Kolhapur",
      lat: 16.7065,
      lng: 74.2439,
      size: "15x8 ft",
      price: 18000,
      available: false,
      expiryDate: "2025-11-15",
    },
  ];

  const handleHoardingClick = (hoarding) => {
    setSelectedHoarding(hoarding);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">🪧 Hoarding Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hoardings.map((h) => (
          <HoardingCard key={h.id} hoarding={h} onClick={handleHoardingClick} />
        ))}
      </div>

      {/* Street View Modal */}
      <StreetViewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={
          selectedHoarding
            ? { lat: selectedHoarding.lat, lng: selectedHoarding.lng }
            : null
        }
      />
    </div>
  );
}
