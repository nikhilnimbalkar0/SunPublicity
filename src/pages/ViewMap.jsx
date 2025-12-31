import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Navbar from "../component/Navbar";
import { GoogleMap, Marker, InfoWindow, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { firestore } from "../firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { normalizeHoardingData } from "../utils/normalizeAvailability";

export default function ViewMap() {
  const [hoardings, setHoardings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Filter states
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [debouncedSearchLocation, setDebouncedSearchLocation] = useState(""); // Debounced value for filtering
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const navigate = useNavigate();

  // Handler to reset all filters
  const handleResetFilters = useCallback(() => {
    setPriceMin("");
    setPriceMax("");
    setSearchLocation("");
    setDebouncedSearchLocation("");
    setSelectedCategory("All Categories");
    setShowAvailableOnly(false);
  }, []);

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

  // Debounce search location input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchLocation(searchLocation);
    }, 300);

    // Cleanup function to clear timeout if searchLocation changes before 300ms
    return () => clearTimeout(timer);
  }, [searchLocation]);

  // Auto-pan and zoom to selected marker
  useEffect(() => {
    if (selected && mapRef.current) {
      const map = mapRef.current;
      const position = { lat: selected.lat, lng: selected.lng };

      // Smoothly pan to the marker and zoom to level 14
      map.panTo(position);
      map.setZoom(14);
    }
  }, [selected]);

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
          const docs = snapshot.docs
            .map((doc) => {
              // Use normalization utility to handle all data consistently
              return normalizeHoardingData(doc.data(), doc.id, categoryName);
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

  // Filter hoardings based on all active filters
  const filteredHoardings = useMemo(() => {
    return hoardings.filter((h) => {
      // Price filter
      if (priceMin !== "" && h.price < parseFloat(priceMin)) return false;
      if (priceMax !== "" && h.price > parseFloat(priceMax)) return false;

      // Location search filter (using debounced value)
      if (debouncedSearchLocation.trim() !== "") {
        const searchLower = debouncedSearchLocation.toLowerCase();
        const locationMatch = (h.locationAddress || "").toLowerCase().includes(searchLower);
        const nameMatch = (h.name || "").toLowerCase().includes(searchLower);
        if (!locationMatch && !nameMatch) return false;
      }

      // Category filter
      if (selectedCategory !== "All Categories" && h.categoryName !== selectedCategory) {
        return false;
      }

      // Availability filter
      if (showAvailableOnly && !h.available) return false;

      return true;
    });
  }, [hoardings, priceMin, priceMax, debouncedSearchLocation, selectedCategory, showAvailableOnly]);

  const markers = useMemo(
    () =>
      filteredHoardings.map((h) => ({
        id: h.id,
        position: { lat: h.lat, lng: h.lng },
        // Use Firestore field `name` as title, fallback to address if needed
        title: h.name || h.locationAddress || "Hoarding",
        data: h,
      })),
    [filteredHoardings]
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
        {/* Filter Section - Sticky on Desktop */}
        <div className="bg-white border-b md:border md:rounded-xl md:mb-4 shadow-sm md:sticky md:top-4 md:z-10">
          {/* Filter Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white md:rounded-t-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Filter Hoardings</h2>
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {filteredHoardings.length} of {hoardings.length}
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className={`w-5 h-5 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Filter Controls */}
          <div className={`${showFilters ? 'block' : 'hidden md:block'} p-4 bg-white md:rounded-b-xl`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price Range (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Location Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location / Area</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option>All Categories</option>
                  <option>Auto Promotion</option>
                  <option>Digital Board</option>
                  <option>Hording</option>
                  <option>Shop light and without light boards</option>
                  <option>Van Promotions</option>
                  <option>Wall Paintings</option>
                </select>
              </div>

              {/* Availability & Clear Filters */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="flex flex-col gap-2">
                  {/* Availability Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Available Only</span>
                  </label>

                  {/* Clear Filters Button */}
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[70vh] md:h-[78vh] rounded-none md:rounded-xl overflow-hidden border border-gray-200 relative">
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={center}
            zoom={7}
            options={options}
            onLoad={onLoad}
          >
            <MarkerClusterer>
              {(clusterer) =>
                markers.map((m) => (
                  <Marker
                    key={m.id}
                    position={m.position}
                    title={m.title}
                    onClick={() => setSelected(m.data)}
                    clusterer={clusterer}
                    icon={{
                      url: m.data?.available
                        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    }}
                  />
                ))
              }
            </MarkerClusterer>

            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="w-72 max-w-[90vw]">
                  {/* Image Section */}
                  {selected.imageUrl && (
                    <div className="relative w-full h-40 mb-3 -mt-1 -mx-1 rounded-t-lg overflow-hidden">
                      <img
                        src={selected.imageUrl}
                        alt={selected.name || selected.title || "Hoarding"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/400x300?text=No+Image";
                        }}
                      />
                      {/* Status Badge Overlay */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${selected.available
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                            }`}
                        >
                          {selected.available ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-3 leading-tight">
                    {selected.name || selected.title || selected.locationAddress || "Hoarding Details"}
                  </h3>

                  {/* Details Section */}
                  <div className="space-y-2.5 mb-4">
                    {/* Location */}
                    {(selected.locationAddress || selected.location) && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                          <p className="text-sm text-gray-900 leading-snug">
                            {selected.locationAddress || selected.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Size */}
                    {selected.size && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Size</p>
                          <p className="text-sm text-gray-900">
                            {String(selected.size).replace("x", " × ")} ft
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {selected.price !== undefined && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Price</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(selected.price)}
                            <span className="text-xs font-normal text-gray-500"> / month</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${selected.lat},${selected.lng}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Maps
                    </button>

                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      onClick={() => navigate(`/hoardings/${selected.id}`)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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

          {/* Map Legend */}
          <div className="absolute top-4 right-4 bg-white rounded-md shadow-lg p-2 z-10 border border-gray-200">
            <h4 className="text-[10px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Legend</h4>
            <div className="space-y-1">
              {/* Available */}
              <div className="flex items-center gap-1.5">
                <img
                  src="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  alt="Available"
                  className="w-4 h-4"
                />
                <span className="text-[10px] text-gray-700 whitespace-nowrap">Available</span>
              </div>
              {/* Not Available */}
              <div className="flex items-center gap-1.5">
                <img
                  src="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  alt="Not Available"
                  className="w-4 h-4"
                />
                <span className="text-[10px] text-gray-700 whitespace-nowrap">Not Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm">
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          {!loadingData && !error && markers.length === 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Hoardings Found</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                We couldn't find any hoardings matching your current filters. Try adjusting your search criteria or reset all filters to see all available hoardings.
              </p>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
