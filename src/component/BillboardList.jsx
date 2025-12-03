import React from "react";
import { useWishlist } from "../context/WishlistContext.jsx";
import { Heart } from "lucide-react";

const billboards = [
  {
    id: 1,
    location: "City Center",
    size: "20x10 ft",
    price: "₹15,000/month",
    available: true,
    image: "/board1.jpg",
  },
  {
    id: 2,
    location: "Highway No. 4",
    size: "40x20 ft",
    price: "₹30,000/month",
    available: false,
    image: "/board2.jpg",
  },
  {
    id: 3,
    location: "Market Road",
    size: "15x10 ft",
    price: "₹10,000/month",
    available: true,
    image: "/board3.jpg",
  },
];

export default function BillboardList() {
  const { items, toggle } = useWishlist();
  return (
    <section id="billboards" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Available Billboards
        </h2>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
          {billboards.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={b.image}
                alt={b.location}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {b.location}
                </h3>
                <p className="text-gray-600">Size: {b.size}</p>
                <p className="text-gray-600">Price: {b.price}</p>
                <p
                  className={`mt-3 font-semibold ${
                    b.available ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {b.available ? "Available" : "Booked"}
                </p>
                <div className="mt-4 flex justify-end">
                  {(() => {
                    const inList = items.some((i) => i.id === b.id);
                    return (
                      <button
                        onClick={() => toggle({ id: b.id, location: b.location, size: b.size, price: b.price, image: b.image })}
                        className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${inList ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-gray-50 text-gray-700 border-gray-200'} hover:shadow-sm`}
                        aria-pressed={inList}
                      >
                        <Heart size={16} className={inList ? 'fill-pink-600 text-pink-600' : 'text-gray-500'} />
                        {inList ? 'Wishlisted' : 'Add to Wishlist'}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
