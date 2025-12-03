import React from "react";

const HoardingCard = ({ hoarding, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition cursor-pointer"
      onClick={() => onClick(hoarding)}
    >
      <h2 className="text-lg font-semibold">{hoarding.title}</h2>
      <p className="text-gray-600">📍 {hoarding.locationName}</p>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-700">Size: {hoarding.size}</p>
        <p className="text-sm text-gray-700">Price: ₹{hoarding.price}</p>
        {hoarding.expiryDate && (
          <p className="text-sm text-gray-700">Expiry: {hoarding.expiryDate}</p>
        )}
        {typeof hoarding.available === 'boolean' && (
          <p className={`text-sm font-medium ${hoarding.available ? 'text-green-600' : 'text-red-600'}`}>
            {hoarding.available ? 'Available' : 'Not Available'}
          </p>
        )}
      </div>
      <div className="mt-3">
        <a
          href={
            typeof hoarding.lat === "number" && typeof hoarding.lng === "number"
              ? `https://www.google.com/maps?q=${hoarding.lat},${hoarding.lng}&z=15`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`India, Maharashtra, ${hoarding.locationName || ""}`)}`
          }
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-block"
        >
          View on Map
        </a>
      </div>
    </div>
  );
};

export default HoardingCard;
