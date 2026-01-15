import React from "react";
import { Link } from "react-router-dom";
import "../styles/Landing.css";
import bgVideo from "../assets/bookclubvd1.mp4";

export default function Landing() {
  return (
    <main className="landing-root">
      <video className="landing-video" src={bgVideo} autoPlay muted loop playsInline />

      <div className="landing-overlay">
        <div className="landing-content">
          <div className="landing-brand">BOOK CLUB</div>
          <h1 className="landing-quote">“There is more treasure in books than in all the pirate's loot on Treasure Island.”</h1>
          <p className="landing-by">– Walt Disney</p>

          <div className="landing-ctas">
            <Link to="/login" className="primary">Sign In</Link>
            <Link to="/register" className="view-btn">Sign Up</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
