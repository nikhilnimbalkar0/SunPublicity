import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useWishlist();
  const { isAuthenticated } = useAuth();

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goHomeAndMaybeScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      // Wait a tick for Home to mount, then scroll
      setTimeout(() => {
        if (id) scrollToId(id);
      }, 250);
    } else {
      if (id) scrollToId(id);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-yellow-600">SunPublicity</h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium items-center">
          <li>
            <button onClick={() => goHomeAndMaybeScroll()} className="hover:text-yellow-600">Home</button>
          </li>
          <li>
            <button onClick={() => goHomeAndMaybeScroll("gallery")} className="hover:text-yellow-600">Gallery</button>
          </li>
          <li>
            <button onClick={() => goHomeAndMaybeScroll("contact")} className="hover:text-yellow-600">Contact</button>
          </li>
          <li>
            {isAuthenticated ? (
              <button onClick={() => { navigate('/account'); setIsOpen(false); }} className="hover:text-yellow-600">Account</button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => { navigate('/login'); setIsOpen(false); }} className="hover:text-yellow-600">Login</button>
                <button onClick={() => { navigate('/register'); setIsOpen(false); }} className="hover:text-yellow-600">Register</button>
              </div>
            )}
          </li>
          <li>
            <button onClick={() => { navigate('/wishlist'); setIsOpen(false); }} className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">
              <Heart size={18} className="text-pink-600" />
              <span className="text-sm">Wishlist</span>
              <span className="ml-1 inline-flex items-center justify-center text-xs bg-pink-600 text-white rounded-full px-2 py-0.5 min-w-[1.25rem]">{count}</span>
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-inner">
          <ul className="flex flex-col space-y-3 px-6 py-4 text-gray-700 font-medium">
            <li><button onClick={() => goHomeAndMaybeScroll()}>Home</button></li>
            <li><button onClick={() => goHomeAndMaybeScroll("gallery")}>Gallery</button></li>
            <li><button onClick={() => goHomeAndMaybeScroll("contact")}>Contact</button></li>
            <li>
              {isAuthenticated ? (
                <button onClick={() => { navigate('/account'); setIsOpen(false); }}>Account</button>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => { navigate('/login'); setIsOpen(false); }}>Login</button>
                  <button onClick={() => { navigate('/register'); setIsOpen(false); }}>Register</button>
                </div>
              )}
            </li>
            <li>
              <button onClick={() => { navigate('/wishlist'); setIsOpen(false); }} className="inline-flex items-center gap-2">
                <Heart size={18} className="text-pink-600" />
                <span>Wishlist</span>
                <span className="ml-1 inline-flex items-center justify-center text-xs bg-pink-600 text-white rounded-full px-2 py-0.5 min-w-[1.25rem]">{count}</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
