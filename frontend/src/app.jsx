import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Diabetes from "./pages/Diabetes";
import Tumour from "./pages/Tumour";

export default function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diabetes" element={<Diabetes />} />
        <Route path="/tumour" element={<Tumour />} />
      </Routes>
    </div>
  );
}
