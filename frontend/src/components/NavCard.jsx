import React from "react";
import { useNavigate } from "react-router-dom";

export default function NavCard({ title, description, to }) {
  const nav = useNavigate();
  return (
    <div className="nav-card" onClick={() => nav(to)}>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="card-btn">Open</button>
    </div>
  );
}
