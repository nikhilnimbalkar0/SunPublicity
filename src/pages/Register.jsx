import React, { useState } from "react";
import Navbar from "../component/Navbar";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      const from = location.state?.from || "/";
      const item = location.state?.item;
      navigate(from, item ? { state: { item } } : undefined);
    } catch (e) {
      console.error("Registration Error:", e);
      if (e.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please login instead.");
      } else if (e.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(e.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4">Register</h1>

          {error && (
            <div className="mb-3 text-sm p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-70"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
          </p>
        </form>
      </main>
    </>
  );
}
