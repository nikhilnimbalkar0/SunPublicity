import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Navbar from "../component/Navbar";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { firestore } from "../firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ViewMap() {
  const [hoardings, setHoardings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const navigate = useNavigate();

  const maharashtraBounds = useMemo(
    () => ({ north: 22.1, south: 15.6, west: 72.6, east: 80.9 }),
    []
  );

  const center = useMemo(() => ({ lat: 19.7515, lng: 75.7139 }), []);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const options = useMemo(
    () => ({
      mapTypeId: "hybrid",
      gestureHandling: "greedy",
      zoomControl: true,
      rotateControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      restriction: { latLngBounds: maharashtraBounds, strictBounds: true },
      minZoom: 5,
      maxZoom: 20,
      ...(import.meta.env.VITE_GOOGLE_MAPS_MAP_ID
        ? { mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID }
        : {}),
    }),
    [maharashtraBounds]
  );

  const mapRef = useRef(null);
  const onLoad = useCallback((m) => {
    mapRef.current = m;
    try {
      m.setCenter(center);
      m.setZoom(7);
      m.setTilt(60);
      m.setHeading(20);
    } catch (_) { }
  }, [center]);

  useEffect(() => {
    setLoadingData(true);

    // All category names in Firebase
    const CATEGORIES = [
      "Auto Promotion",
      "Digital Board",
      "Hording",
      "Shop light and without light boards",
      "Van Promotions",
      "Wall Paintings"
    ];

    // Array to store all unsubscribe functions
    const unsubscribers = [];

    // Subscribe to each category's hoardings subcollection
    CATEGORIES.forEach((categoryName) => {
      const categoryDocRef = doc(firestore, "categories", categoryName);
      const colRef = collection(categoryDocRef, "hoardings");

      const unsub = onSnapshot(
        colRef,
        (snapshot) => {
          console.log(`[ViewMap] Received update for category: ${categoryName}, docs count: ${snapshot.docs.length}`);

          const docs = snapshot.docs
            .map((doc) => {
              const data = doc.data();

              // Debug: Log the raw data to see field names
              console.log(`[ViewMap] Document ${doc.id} data:`, {
                latitude: data.latitude,
                longitude: data.longitude,
                available: data.available,
                Available: data.Available,
                availability: data.availability,
                category: data.category,
                location: data.location
              });

              // Fields: latitude (string), longitude (string), available, imageUrl, location, category, price
              const lat = parseFloat(data.latitude);
              const lng = parseFloat(data.longitude);

              if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

              // Check multiple possible field names for availability
              let isAvailable = false;
              if (data.available !== undefined) {
                isAvailable = data.available === true || data.available === "true";
              } else if (data.Available !== undefined) {
                isAvailable = data.Available === true || data.Available === "true";
              } else if (data.availability !== undefined) {
                isAvailable = data.availability === true || data.availability === "true";
              }

              const hoarding = {
                id: doc.id,
                name: data.category || categoryName,
                categoryName: categoryName, // Store which category this came from
                lat,
                lng,
                price: data.price || "",
                imageUrl: data.imageUrl || "",
                locationAddress: data.location || "",
                available: isAvailable,
              };

              console.log(`[ViewMap] Processed hoarding ${doc.id}:`, {
                name: hoarding.name,
                available: hoarding.available,
                location: hoarding.locationAddress
              });

              return hoarding;
            })
            .filter(Boolean);

          // Use setState callback to access latest state and avoid stale closures
          setHoardings((prevHoardings) => {
            // Remove old entries from this category
            const filtered = prevHoardings.filter(h => h.categoryName !== categoryName);
            // Add new entries from this category
            return [...filtered, ...docs];
          });

          setError(null);
          setLoadingData(false);
        },
        (err) => {
          console.error(`[ViewMap] Firestore error for category ${categoryName}`, err);
          // Don't set error for individual category failures
          setLoadingData(false);
        }
      );

      unsubscribers.push(unsub);
    });

    // Cleanup function to unsubscribe from all listeners
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const markers = useMemo(
    () =>
      hoardings.map((h) => ({
        id: h.id,
        position: { lat: h.lat, lng: h.lng },
        // Use Firestore field `name` as title, fallback to address if needed
        title: h.name || h.locationAddress || "Hoarding",
        data: h,
      })),
    [hoardings]
  );

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto p-6 flex justify-center items-center h-screen">
          <div className="text-xl font-semibold text-gray-600">Loading Map...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-0 md:p-6">
        <div className="h-[70vh] md:h-[78vh] rounded-none md:rounded-xl overflow-hidden border border-gray-200 relative">
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={center}
            zoom={7}
            options={options}
            onLoad={onLoad}
          >
            {markers.map((m) => (
              <Marker
                key={m.id}
                position={m.position}
                title={m.title}
                onClick={() => setSelected(m.data)}
                icon={{
                  url: m.data?.available
                    ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
              />
            ))}

            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="max-w-xs p-1">
                  <h3 className="font-bold mb-2 text-sm text-gray-800">
                    {selected.name || selected.title || selected.locationAddress || "Hoarding Details"}
                  </h3>

                  {selected.imageUrl && (
                    <img
                      src={selected.imageUrl}
                      alt={selected.name || selected.title || "Hoarding"}
                      className="w-full h-32 object-cover rounded-md mb-2 border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/400x200?text=No+Image";
                      }}
                    />
                  )}

                  <div className="text-xs space-y-1.5 text-gray-700 mb-2">
                    {(selected.locationAddress || selected.location) && (
                      <p>
                        <span className="font-semibold">Location: </span>
                        {selected.locationAddress || selected.location}
                      </p>
                    )}

                    {selected.size && (
                      <p>
                        <span className="font-semibold">Size: </span>
                        {String(selected.size).replace("x", "ft x ")}ft
                      </p>
                    )}

                    {selected.price !== undefined && (
                      <p>
                        <span className="font-semibold">Price: </span>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(selected.price)}
                        <span className="text-gray-500"> / month</span>
                      </p>
                    )}

                    <div className="pt-1">
                      <span className="font-semibold">Status: </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${selected.available
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                      >
                        {selected.available ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      className="flex-1 px-2 py-1 text-[11px] font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${selected.lat},${selected.lng}`;
                        window.open(url, "_blank");
                      }}
                    >
                      Open in Google Maps
                    </button>

                    <button
                      type="button"
                      className="flex-1 px-2 py-1 text-[11px] font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => navigate(`/hoardings/${selected.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {loadingData && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10 text-sm font-medium text-gray-700">
              Loading Hoardings...
            </div>
          )}
        </div>

        <div className="mt-4 text-sm">
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          {!loadingData && !error && markers.length === 0 && (
            <div className="text-gray-600 text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
              No hoardings found with valid coordinates.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
