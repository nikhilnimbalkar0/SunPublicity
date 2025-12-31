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

  const getErrorMessage = (err) => {
    // Map Firebase error codes to user-friendly messages
    switch (err.code) {
      case "auth/user-not-found":
        return "User does not exist. Please sign up first.";
      case "auth/wrong-password":
        return "Invalid password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        // If it's a generic invalid credential error which sometimes masks user-not-found
        if (err.message && err.message.includes("invalid-credential")) {
          return "Invalid email or password.";
        }
        return err.message || "Login failed. Please try again.";
    }
  };

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
      setError(getErrorMessage(e));
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

          {error && (
            <div className={`mb-3 text-sm p-3 rounded-md border ${error.includes("sign up")
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : "bg-red-50 border-red-200 text-red-600"
              }`}>
              {error}
            </div>
          )}

          <div className="space-y-3">
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
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            New here? <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
          </p>
        </form>
      </main>
    </>
  );
}
