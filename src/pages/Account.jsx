import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../component/Navbar";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true, state: { from: "/account" } });
  }, [isAuthenticated, navigate]);

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(`profile_${user?.id}`);
      return raw ? JSON.parse(raw) : { phone: "", address: "" };
    } catch {
      return { phone: "", address: "" };
    }
  });

  const bookings = useMemo(() => {
    try {
      const raw = localStorage.getItem("bookings");
      const list = raw ? JSON.parse(raw) : [];
      return (user ? list.filter((b) => b.userId === user.id) : list).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  }, [user]);

  const totalPaid = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const saveProfile = () => {
    try {
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profile));
      alert("Profile updated");
    } catch {}
  };

  const recentBookings = bookings.slice(0, 5);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">User Information</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Name</div>
                  <div className="font-medium">{user?.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Contact & Address</h2>
              <div className="space-y-3">
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Phone number" value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} />
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Booking address" value={profile.address} onChange={(e)=>setProfile({...profile, address: e.target.value})}></textarea>
                <div className="flex gap-3">
                  <button onClick={saveProfile} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
                  <button onClick={() => logout()} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Logout</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
              {recentBookings.length === 0 ? (
                <div className="text-gray-600">No bookings yet.</div>
              ) : (
                <ul className="divide-y">
                  {recentBookings.map((b) => (
                    <li key={b.id} className="py-3 flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">{b.item?.location || b.item?.name}</div>
                        <div className="text-gray-500">{new Date(b.createdAt).toLocaleString()} • {b.durationMonths} mo</div>
                      </div>
                      <div className="text-sm font-semibold">₹{(b.amount || 0).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">All Bookings</h2>
              {bookings.length === 0 ? (
                <div className="text-gray-600">No bookings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Location</th>
                        <th className="py-2 pr-4">Duration</th>
                        <th className="py-2 pr-4">Coupon</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="py-2 pr-4">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 pr-4">{b.item?.location || b.item?.name}</td>
                          <td className="py-2 pr-4">{b.durationMonths} months</td>
                          <td className="py-2 pr-4">{b.coupon || '-'}</td>
                          <td className="py-2 pr-4">₹{(b.amount || 0).toLocaleString()}</td>
                          <td className="py-2 pr-4">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Payments Summary</h2>
              <div className="text-sm text-gray-600">Total Booking Amount</div>
              <div className="text-2xl font-extrabold">₹{totalPaid.toLocaleString()}</div>
              <div className="mt-4 text-xs text-gray-500">Payments are collected offline/after confirmation in this demo.</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Discount Coupons</h2>
              <ul className="text-sm list-disc list-inside text-gray-700">
                <li><span className="font-medium">WELCOME10</span> — 10% off</li>
                <li><span className="font-medium">FEST20</span> — 20% off</li>
              </ul>
              <div className="mt-3 text-xs text-gray-500">Apply a coupon on the Booking page to see the discount.</div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
