import { useEffect, useState } from "react";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { useParams, Link } from "react-router-dom";
import Navbar from "../component/Navbar";
import { firestore } from "../firebase";
import { doc, getDoc, collection } from "firebase/firestore";

const CATEGORY_MAP = {
  "auto-promotion": "Auto Promotion",
  "digital-board": "Digital Board",
  "hording": "Hording",
  "shop-boards": "Shop light and without light boards",
  "van-promotions": "Van Promotions",
  "wall-paintings": "Wall Paintings",
  // Legacy routes
  mall: "Shopping Mall Board",
  event: "Event Promotion",
  led: "City Center LED",
  corporate: "Corporate Ad Space",
};

export default function AdItemDetails() {
  const { category, id } = useParams();
  const key = CATEGORY_MAP[category];
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !key) {
      setLoading(false);
      setError("Invalid category or ID");
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        setItem(null); // Clear previous data

        // Fetch from category sub-collection: categories/{categoryName}/hoardings/{id}
        const categoryDocRef = doc(firestore, "categories", key);
        const hoardingsColRef = collection(categoryDocRef, "hoardings");
        const hoardingDocRef = doc(hoardingsColRef, id);

        const snapshot = await getDoc(hoardingDocRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          // Handle Firestore Timestamp for expiryDate
          let processedData = { id, ...data };
          if (data.expiryDate && typeof data.expiryDate?.toDate === 'function') {
            processedData.expiryDate = data.expiryDate.toDate().toISOString();
          }

          setItem(processedData);
          setError(null);
        } else {
          setItem(null);
          setError("Item not found.");
        }
      } catch (err) {
        console.error("Error fetching hoarding details:", err);
        setError(err.message || "Failed to load item.");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, key]);

  if (!key) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6 md:p-10">
          <p className="text-gray-600">Unknown category.</p>
          <Link to={`/${category}`} className="text-blue-600 font-semibold">← Back</Link>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6 md:p-10">
          <p className="text-gray-600">Loading hoarding...</p>
        </main>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx_auto p-6 md:p-10">
          <p className="text-gray-600">{error || "Item not found."}</p>
          <Link to={`/${category}`} className="text-blue-600 font-semibold">← Back to {key}</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <Link to={`/${category}`} className="text-blue-600 font-semibold inline-flex items-center gap-2 mb-6 hover:text-blue-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {key}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-gray-100 aspect-square md:aspect-auto">
              <img
                src={getCloudinaryUrl(item.image)}
                alt={item.location}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x800?text=Hoarding";
                }}
              />
              <span
                className={`absolute top-4 right-4 text-sm font-semibold px-4 py-2 rounded-full shadow-lg ${item.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
              >
                {item.available ? "Available" : "Not Available"}
              </span>
            </div>

            {/* Details Section */}
            <div className="p-8 flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{item.location}</h1>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Size</div>
                    <div className="text-2xl font-bold text-gray-900">{String(item.size).replace("x", " × ")}</div>
                    <div className="text-sm text-gray-600">feet</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Price</div>
                    <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.price)}</div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                </div>

                {item.expiryDate && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-sm text-blue-600 font-semibold mb-1">Contract Expiry</div>
                    <div className="text-lg font-bold text-blue-900">{new Date(item.expiryDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  <h3 className="font-semibold text-gray-900 text-lg">Location Details</h3>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-700">{item.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Navigate to booking page with item details
                    window.location.href = `/booking?item=${encodeURIComponent(JSON.stringify({ id: item.id, location: item.location, size: item.size, price: item.price, image: item.image }))}`;
                  }}
                  className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors shadow-md hover:shadow-lg text-lg"
                >
                  Book Now
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors text-center"
                  >
                    View on Map
                  </a>
                  <button
                    className="py-3 px-4 bg-white border-2 border-pink-300 hover:border-pink-400 text-pink-600 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
