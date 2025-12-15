import Navbar from "../component/Navbar";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Building2, Landmark, Bus, Globe2, Plane } from "lucide-react";
import { SIZES, CATEGORIES } from "../data/adsData";
import { firestore } from "../firebase";
import { collection, getDocs, doc } from "firebase/firestore";

const iconMap = {
  "Downtown Billboard": Monitor,
  "Highway Display": Building2,
  "Shopping Mall Board": Landmark,
  "Event Promotion": Bus,
  "City Center LED": Globe2,
  "Corporate Ad Space": Plane,
};

const CATEGORY_OPTIONS = ["All Categories", ...CATEGORIES];

export default function AdDashboard() {
  const [active, setActive] = useState(CATEGORY_OPTIONS[0]);
  const [query, setQuery] = useState("");
  const [size, setSize] = useState("All");
  const [price, setPrice] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from all category sub-collections
        const CATEGORIES = [
          "Auto Promotion",
          "Digital Board",
          "Hording",
          "Shop light and without light boards",
          "Van Promotions",
          "Wall Paintings"
        ];

        const allHoardings = [];

        for (const categoryName of CATEGORIES) {
          const categoryDocRef = doc(firestore, "categories", categoryName);
          const colRef = collection(categoryDocRef, "hoardings");
          const snapshot = await getDocs(colRef);
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allHoardings.push(...list);
        }

        setAllItems(allHoardings);
      } catch (err) {
        setError(err.message || "Failed to load ad spaces");
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const items = useMemo(() => {
    if (active === "All Categories") return allItems;
    return allItems.filter((item) => item.category === active);
  }, [allItems, active]);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      const matchesQuery = b.location.toLowerCase().includes(query.toLowerCase());
      const matchesSize = size === "All" ? true : b.size === size;
      const matchesAvailability = availableOnly ? b.available : true;
      const matchesPrice = (() => {
        if (price === "All") return true;
        if (price === "<10000") return b.price < 10000;
        if (price === "10000-20000") return b.price >= 10000 && b.price <= 20000;
        if (price === ">20000") return b.price > 20000;
        return true;
      })();
      return matchesQuery && matchesSize && matchesPrice && matchesAvailability;
    });
  }, [items, query, size, price, availableOnly]);

  const availableCount = useMemo(() => items.filter((d) => d.available).length, [items]);

  const onTabClick = (cat) => {
    setActive(cat);
    setQuery("");
    setSize("All");
    setPrice("All");
    setAvailableOnly(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Advertisement Dashboard</h1>
          <div className="text-sm md:text-base text-gray-600">
            <span className="font-semibold">{availableCount}</span> Available in {active}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORY_OPTIONS.map((cat) => {
            const Icon = cat === "All Categories" ? Monitor : iconMap[cat] || Monitor;
            const isActive = cat === active;
            return (
              <button
                key={cat}
                onClick={() => onTabClick(cat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm ${isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                  }`}
              >
                <Icon size={16} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <section className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Search by Location</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type location name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Price Range</label>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All">All</option>
                <option value="<10000">{"< ₹10,000"}</option>
                <option value="10000-20000">₹10,000 - ₹20,000</option>
                <option value=">20000">{"> ₹20,000"}</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                <span className="text-sm font-semibold">Available Only</span>
              </label>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center text-gray-500 py-10">Loading ad spaces...</div>
          )}
          {!loading && error && (
            <div className="col-span-full text-center text-red-500 py-10">{error}</div>
          )}
          {!loading && !error && filtered.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.10)" }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={b.image}
                  alt={b.location}
                  className="w-full h-full object-cover transform transition-transform duration-300 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x450?text=Ad+Space";
                  }}
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{b.location}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${b.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                  >
                    {b.available ? "Available" : "Not Available"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Location: {b.location}</div>
                <div className="text-sm text-gray-600">Size: {b.size.replace("x", "ft x ")}ft</div>
                <div className="text-sm font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(b.price)} / month</div>
                {b.expiryDate && (
                  <div className="text-sm text-gray-600">
                    Expiry: {new Date(b.expiryDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {!loading && !error && filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">No ad spaces found.</div>
          )}
        </section>
      </main>
    </>
  );
}
