import React from "react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full min-h-[60vh] md:min-h-[80vh] lg:min-h-screen flex items-center md:items-end justify-center overflow-hidden pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8"
    >
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/Sun.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ filter: "brightness(1.2) contrast(1.15) saturate(1.1)" }}
      ></video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

      <div className="relative z-10 text-center">
        <a
          href="#search"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg transition"
        >
          Search Media
        </a>
      </div>
    </section>
  );
}
