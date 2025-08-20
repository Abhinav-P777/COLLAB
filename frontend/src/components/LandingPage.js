import React from "react";
import bgVideo from "../assets/Untitled video - Made with Clipchamp.mp4"; 
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    
    <section className="min-h-screen bg-black text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 w-full flex justify-between items-center px-8 py-6 text-gray-300 z-10">
        <h1 className="text-2xl font-bold font-seenonim">Collabn</h1>
       
        <button className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 font-seenonim">
          Start Free
        </button>
      </nav>

      {/* Hero Content */}
      <div className="text-center max-w-3xl z-10">
        <span className="bg-gray-800 px-4 py-2 rounded-full text-sm font-libre">
          ✦ Real-Time Collaboration
        </span>
        <h1 className="text-5xl md:text-6xl font-bold mt-6 font-seenonim">
          Collaboration that you <br /> need Indeed
        </h1>
        <p className="text-gray-300 mt-6 font-bebas tracking-wide">
          Write, edit, and collaborate seamlessly with your team in real-time.
          A distraction-free, intuitive workspace built for modern teams.
        </p>
        <div className="flex justify-center gap-6 mt-8">
          <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 font-sans ">
            LOGIN
          </button>
          <button onClick={() => navigate("/register")}className="px-6 py-3 rounded-full border border-white hover:bg-gray-900 font-sans">
            REGISTER
          </button>
        </div>
      </div>

      {/* Scroll prompt */}
      <div className="absolute bottom-10 text-gray-400 animate-bounce z-10 font-libre">
        ↓ Scroll down to see features
      </div>
    </section>
  );
}
