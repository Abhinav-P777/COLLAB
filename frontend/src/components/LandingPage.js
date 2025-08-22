import React from "react";
import bgVideo from "../assets/Untitled video - Made with Clipchamp.mp4";
import bgImage from "../assets/Header-background (2).webp"
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    
    <section className="min-h-screen bg-white text-black flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Video */}
    <div className="absolute inset-0">
  <img
    src={bgImage}
    alt="Background"
    className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 "></div>
</div>

      {/* Navbar */}
      <nav className="absolute top-0 w-full flex justify-between items-center px-8 py-6 text-gray-500 z-10">
        <h1 className="text-2xl font-bold font-seenonim">Collabn</h1>
       
        <button className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-300 font-seenonim">
          Start Free
        </button>
      </nav>

      {/* Hero Content */}
      <div className="text-center max-w-3xl z-10">
        <span className="bg-gray-800 px-4 py-2 rounded-full text-sm text-white font-libre">
          ✦ Real-Time Collaboration
        </span>
        <h1 className="text-5xl md:text-6xl font-bold mt-6 font-seenonim">
          Collaboration that you <br /> need Indeed
        </h1>
     <p className="max-w-2xl mx-auto text-black-300 px-9 py-4 font-bebas tracking-wide rounded-lg">
  Write, edit, and collaborate seamlessly with your team in real-time.
  A distraction-free, intuitive workspace built for modern teams.
</p>


        <div className="flex justify-center gap-6 mt-8 z-10">
          <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-full border border-white bg-white/50 hover:bg-orange-100 hover:text-orange-500 font-libre  ">
            LOGIN
          </button>
          <button  onClick={() => navigate("/register")}className="px-6 py-3 rounded-full border border-white bg-orange-500/20 hover:bg-white hover:text-orange-500 font-libre z-10">
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
