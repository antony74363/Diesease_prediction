import React from "react";
import NavCard from "../components/NavCard";

export default function Home() {
  return (
    <div className="container">
      <header className="hero">
        <h1>AI Health Prediction System</h1>
        <p className="lead">Predict diabetes and detect brain tumours using pre-trained AI models — for educational purposes only.</p>
      </header>

      <main className="grid">
        <NavCard
          title="Diabetes Prediction"
          description="Enter patient parameters and get a prediction (Diabetic / Not Diabetic)."
          to="/diabetes"
        />
        <NavCard
          title="Brain Tumour Detection"
          description="Upload an MRI image (JPG / PNG) and run a CNN-based tumour detector."
          to="/tumour"
        />
      </main>

      <footer className="footer">
        <small>Disclaimer: This system is for educational purposes only.</small>
      </footer>
    </div>
  );
}
