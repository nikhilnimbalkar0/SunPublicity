import { useEffect, useState } from "react";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { useParams, Link } from "react-router-dom";
import Navbar from "../component/Navbar";
import { firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MapPin, Ruler, IndianRupee, Circle } from "lucide-react";

const HIGHWAY_CATEGORY = "Highway Display";

export default function HighwayDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestore, "hoardings", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const value = snapshot.data();
          if (value.category && value.category !== HIGHWAY_CATEGORY) {
            setError("Highway hoarding not found.");
            setItem(null);
          } else {
            setItem({ id, ...value });
            setError(null);
          }
        } else {
          setItem(null);
          setError("Highway hoarding not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load highway hoarding.");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6 md:p-10">
          <p className="text-gray-600">Loading highway hoarding...</p>
        </main>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6 md:p-10">
          <p className="text-gray-600">{error || "Highway hoarding not found."}</p>
          <Link to="/highway" className="text-blue-600 font-semibold">← Back to Highway</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <Link to="/highway" className="text-blue-600 font-semibold inline-block mb-4">← Back to Highway</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video bg-gray-100">
            <img
              src={getCloudinaryUrl(item.image)}
              alt={item.location}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/1200x675?text=Highway+Display";
              }}
            />
          </div>
          <div className="p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MapPin size={20} className="text-gray-500" /> {item.location}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Ruler size={18} className="text-gray-500" />
                <div>
                  <div className="text-xs uppercase text-gray-500">Size</div>
                  <div className="font-semibold">{item.size.replace("x", "ft x ")}ft</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <IndianRupee size={18} className="text-gray-500" />
                <div>
                  <div className="text-xs uppercase text-gray-500">Price</div>
                  <div className="font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.price)} / month</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  <Circle size={10} fill={item.available ? "#15803d" : "#b91c1c"} className={item.available ? "text-green-700" : "text-red-700"} />
                  {item.available ? "Available" : "Not Available"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
