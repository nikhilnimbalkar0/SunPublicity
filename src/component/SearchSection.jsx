import React, { useEffect, useState } from "react";
import { Globe2, Monitor, Landmark, Bus, Building2, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchSection() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <section id="search"
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white"
      style={{
        backgroundImage: "url('/billboard-bg.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10">
        <h1 className={`text-3xl md:text-4xl font-bold text-center mb-8 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          Search Outdoor Media By Location & Format
        </h1>

        {/* Media Type Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 mt-16 text-center">
          {[
            { icon: <Monitor size={36} />, label: "Auto Promotion", route: "/auto-promotion" },
            { icon: <Building2 size={36} />, label: "Digital Board", route: "/digital-board" },
            { icon: <Landmark size={36} />, label: "Hording", route: "/hording" },
            { icon: <Bus size={36} />, label: "Shop Light Boards", route: "/shop-boards" },
            { icon: <Globe2 size={36} />, label: "Van Promotions", route: "/van-promotions" },
            { icon: <Plane size={36} />, label: "Wall Paintings", route: "/wall-paintings" },
          ].map((item, index) => (
            <div
              key={index}
              className={`group relative flex flex-col items-center justify-center text-center space-y-2 rounded-2xl bg-white/10 border border-white/20 p-5 backdrop-blur transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-105 hover:shadow-xl cursor-pointer`}
              style={{ transitionDelay: `${index * 75}ms` }}
              onClick={() => navigate(item.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(item.route);
                }
              }}
            >
              <div className="bg-blue-600 p-5 rounded-full transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg shadow-blue-500/30">{item.icon}</div>
              <p className="text-sm md:text-base font-semibold transition-colors duration-300 group-hover:text-white/90">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
