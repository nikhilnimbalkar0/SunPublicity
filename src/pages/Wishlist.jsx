import React from "react";
import Navbar from "../component/Navbar";
import { useWishlist } from "../context/WishlistContext.jsx";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { items, remove } = useWishlist();

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-gray-600">
            Your wishlist is empty. Browse categories and add hoardings you like.
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={b.image}
                    alt={b.location}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x450?text=Billboard";
                    }}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{b.location}</h3>
                  {b.size && <div className="text-sm text-gray-600">Size: {String(b.size).replace("x", "ft x ")}ft</div>}
                  {b.price != null && (
                    <div className="text-sm font-semibold">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(b.price)} / month
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Link to={b.href ?? `/billboard/${b.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      View Details →
                    </Link>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900"
                    >
                      View on Map
                    </a>
                    <button
                      onClick={() => remove(b.id)}
                      className="text-sm px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
