import React, { useState } from "react";
import Navbar from "../component/Navbar";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      const from = location.state?.from || "/";
      const item = location.state?.item;
      navigate(from, item ? { state: { item } } : undefined);
    } catch (e) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          <div className="space-y-3">
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg">
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-sm text-gray-600 mt-4">
            New here? <Link to="/register" className="text-blue-600">Register</Link>
          </p>
        </form>
      </main>
    </>
  );
}
