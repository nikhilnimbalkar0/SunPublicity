import React, { useState } from "react";
import { firestore } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ContactSection({
  office = "Rajiv Gandhi Nagar, Goa",
  phone = "+91 9545454454",
  email = "sunadvertise@gmail.com",
  onSubmit,
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(form);
    }

    try {
      await addDoc(collection(firestore, "contactMessages"), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      // Silently handle error - form still resets
    }
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section
      id="contact"
      className="relative w-full min-h-[60vh] md:min-h-[80vh] lg:min-h-screen bg-gray-900 text-white flex items-center py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Left side - Info */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-300 mb-6">
            Need to advertise your brand or rent a billboard?
            We’re here to help you find the best spot for maximum visibility.
          </p>

          <ul className="space-y-4">
            <li>
              📍 <strong>Office:</strong> {office}
            </li>
            <li>
              📞 <strong>Phone:</strong> {phone}
            </li>
            <li>
              ✉️ <strong>Email:</strong> {email}
            </li>
          </ul>
        </div>

        {/* Right side - Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-semibold mb-6">Send Us a Message</h3>

          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              placeholder="Your Message"
              rows="5"
              name="message"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full transition w-full"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
