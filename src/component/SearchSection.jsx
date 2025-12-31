import { useEffect, useState } from "react";
import { Globe2, Monitor, Landmark, Bus, Building2, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase";

export default function SearchSection() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoardings, setHoardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firestoreCategories, setFirestoreCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Static categories (always visible)
  const staticCategories = [
    {
      name: "Auto Promotion",
      firestoreName: "Auto Promotion",
      icon: <Monitor size={36} />,
      route: "/auto-promotion"
    },
    {
      name: "Digital Board",
      firestoreName: "Digital Board",
      icon: <Building2 size={36} />,
      route: "/digital-board"
    },
    {
      name: "Hording",
      firestoreName: "Hording",
      icon: <Landmark size={36} />,
      route: "/hording"
    },
    {
      name: "Shop Light Boards",
      firestoreName: "Shop light and without light boards",
      icon: <Bus size={36} />,
      route: "/shop-boards"
    },
    {
      name: "Van Promotions",
      firestoreName: "Van Promotions",
      icon: <Globe2 size={36} />,
      route: "/van-promotions"
    },
    {
      name: "Wall Paintings",
      firestoreName: "Wall Paintings",
      icon: <Plane size={36} />,
      route: "/wall-paintings"
    },
  ];

  // Icon mapping for Firestore categories
  const getIconComponent = (iconName) => {
    const iconMap = {
      "Monitor": <Monitor size={36} />,
      "Building2": <Building2 size={36} />,
      "Landmark": <Landmark size={36} />,
      "Bus": <Bus size={36} />,
      "Globe2": <Globe2 size={36} />,
      "Plane": <Plane size={36} />,
    };
    return iconMap[iconName] || <Monitor size={36} />;
  };

  // Generate route from category name
  const generateRoute = (categoryName) => {
    return `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Fetch dynamic categories from Firestore
  useEffect(() => {
    setCategoriesLoading(true);

    const categoriesRef = collection(firestore, "categories");

    const unsubscribe = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const fetchedCategories = snapshot.docs
          .map((docSnap) => ({
            name: docSnap.data().name,
            firestoreName: docSnap.id,
            icon: getIconComponent(docSnap.data().icon),
            route: generateRoute(docSnap.data().name),
            order: docSnap.data().order || 999,
            active: docSnap.data().active
          }))
          .filter(cat => cat.active === true);

        setFirestoreCategories(fetchedCategories);
        setCategoriesLoading(false);
        console.log(`✅ Loaded ${fetchedCategories.length} dynamic categories from Firestore`);
      },
      (error) => {
        console.error("❌ Error fetching Firestore categories:", error);
        setCategoriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Merge static + dynamic categories (avoid duplicates)
  const categories = [
    ...staticCategories,
    ...firestoreCategories.filter(
      (fCat) => !staticCategories.some((sCat) => sCat.firestoreName === fCat.firestoreName)
    )
  ];

  // Fetch hoardings for a specific category ONLY when clicked
  const handleCategoryClick = async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);
      setHoardings([]); // Clear previous data

      // Fetch ONLY from the selected category
      const categoryDocRef = doc(firestore, "categories", category.firestoreName);
      const hoardingsColRef = collection(categoryDocRef, "hoardings");
      const snapshot = await getDocs(hoardingsColRef);

      const fetchedHoardings = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        available: docSnap.data().available === true || docSnap.data().availability === true,
      }));

      setHoardings(fetchedHoardings);
      console.log(`Loaded ${fetchedHoardings.length} hoardings from ${category.name}`);
    } catch (error) {
      console.error("Error fetching hoardings:", error);
      setHoardings([]);
    } finally {
      setLoading(false);
    }
  };

  const availableCount = hoardings.filter(h => h.available).length;

  return (
    <section id="search" className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
          Search Outdoor Media By Category
        </h2>

        <p className="text-center text-gray-600 mb-12">
          Select a category below to view available hoardings
        </p>

        {/* Category Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-12">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className={`group relative flex flex-col items-center justify-center text-center space-y-3 rounded-2xl p-6 backdrop-blur transition-all duration-500 ease-out cursor-pointer ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } ${selectedCategory?.name === category.name
                  ? 'bg-blue-600 text-white shadow-xl scale-105'
                  : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105'
                }`}
              style={{ transitionDelay: `${index * 75}ms` }}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(category);
                }
              }}
            >
              <div className={`p-4 rounded-full transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${selectedCategory?.name === category.name
                ? 'bg-white/20'
                : 'bg-blue-50'
                }`}>
                <div className={selectedCategory?.name === category.name ? 'text-white' : 'text-blue-600'}>
                  {category.icon}
                </div>
              </div>
              <p className={`text-sm md:text-base font-semibold transition-colors duration-300 ${selectedCategory?.name === category.name ? 'text-white' : 'text-gray-900'
                }`}>
                {category.name}
              </p>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-500 py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading hoardings...</p>
          </div>
        )}

        {/* No Category Selected */}
        {!loading && !selectedCategory && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Please select a category to view hoardings
            </h3>
            <p className="text-gray-600">
              Click on any category icon above to browse available hoardings
            </p>
          </div>
        )}

        {/* Selected Category Hoardings */}
        {!loading && selectedCategory && (
          <div>
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-4 rounded-full">
                  <div className="text-blue-600">
                    {selectedCategory.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Browse available hoardings in this category
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{availableCount}</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{hoardings.length}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>

            {/* Hoardings Grid */}
            {hoardings.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white rounded-xl">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-lg font-semibold">No hoardings found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hoardings.map((hoarding) => (
                  <div
                    key={hoarding.id}
                    className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image with Availability Badge */}
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      <img
                        src={hoarding.image || "https://placehold.co/800x450/e5e7eb/6b7280?text=No+Image"}
                        alt={hoarding.location || hoarding.title}
                        className="w-full h-full object-cover transform transition-transform duration-300 ease-out group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/800x450/e5e7eb/6b7280?text=No+Image";
                        }}
                      />
                      <span
                        className={`absolute top-3 right-3 text-xs font-medium px-3 py-1.5 rounded-full shadow-md ${hoarding.available
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                          }`}
                      >
                        {hoarding.available ? "Available" : "Not Available"}
                      </span>
                    </div>

                    {/* Hoarding Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
                          {hoarding.title || hoarding.location || "Hoarding"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {hoarding.location || "India, Maharashtra"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Size</div>
                          <div className="font-semibold text-gray-900">
                            {hoarding.size ? `${hoarding.size.replace("x", "ft x ")}ft` : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Price</div>
                          <div className="font-semibold text-gray-900">
                            {hoarding.price ? (
                              <>
                                {new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  maximumFractionDigits: 0
                                }).format(hoarding.price)}
                                <span className="text-xs font-normal text-gray-500">/month</span>
                              </>
                            ) : "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => navigate(selectedCategory.route)}
                          className="flex-1 text-center text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          disabled={!hoarding.available}
                          onClick={() => navigate('/booking', {
                            state: {
                              item: {
                                id: hoarding.id,
                                location: hoarding.location || hoarding.title,
                                size: hoarding.size,
                                price: hoarding.price,
                                image: hoarding.image
                              }
                            }
                          })}
                          className={`flex-1 text-sm px-4 py-2 rounded-lg font-bold transition-colors shadow-sm ${hoarding.available
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          {hoarding.available ? "Book Now" : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
