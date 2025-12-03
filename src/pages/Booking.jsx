import React, { useState } from "react";
import Navbar from "../component/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const item = location.state?.item || null;

  // Guard: if not authenticated, redirect to login keeping destination and item
  if (!isAuthenticated) {
    navigate("/login", { replace: true, state: { from: "/booking", item } });
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    startDate: "",
    durationMonths: 1,
    notes: "",
    coupon: "",
  });

  const submit = (e) => {
    e.preventDefault();
    const monthly = Number(item?.price || 0);
    const months = Number(form.durationMonths || 1);
    const baseAmount = monthly * months;
    const coupon = (form.coupon || "").trim();
    let discount = 0;
    if (coupon.toUpperCase() === "WELCOME10") discount = 0.1 * baseAmount;
    if (coupon.toUpperCase() === "FEST20") discount = 0.2 * baseAmount;
    const amount = Math.max(0, Math.round(baseAmount - discount));

    const booking = {
      id: Date.now(),
      userId: user?.id,
      item,
      contact: { name: form.name, email: form.email, phone: form.phone },
      startDate: form.startDate,
      durationMonths: months,
      notes: form.notes,
      coupon,
      amount,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const key = `bookings`;
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push(booking);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    alert("Booking submitted! We'll contact you soon.");
    navigate("/account");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl shadow p-6">
            <h1 className="text-xl font-semibold mb-4">Booking Details</h1>
            {item ? (
              <div className="space-y-2 text-sm text-gray-700">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <img src={item.image} alt={item.location} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.src="https://via.placeholder.com/800x450?text=Hoarding"}} />
                </div>
                <div><span className="font-medium">Location:</span> {item.location}</div>
                {item.size && <div><span className="font-medium">Size:</span> {String(item.size).replace("x","ft x ")}ft</div>}
                {item.price != null && <div><span className="font-medium">Price:</span> {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.price)} / month</div>}
              </div>
            ) : (
              <div className="text-gray-600">No item was selected. Please go back and choose a hoarding to book.</div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <form onSubmit={submit} className="space-y-3">
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Full Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (months)</label>
                  <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.durationMonths} onChange={(e)=>setForm({...form,durationMonths:parseInt(e.target.value||1,10)})} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="WELCOME10 or FEST20" value={form.coupon} onChange={(e)=>setForm({...form,coupon:e.target.value})} />
              </div>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} placeholder="Notes (optional)" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} />
              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded-lg">Submit Booking</button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
