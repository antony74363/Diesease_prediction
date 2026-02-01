import React, { useState, useRef } from "react";
import Spinner from "../components/Spinner";
import ConfidenceBar from "../components/ConfidenceBar";

const API_URL = "http://localhost:5000/predict-tumour";

export default function Tumour() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const dropRef = useRef();

  function handleFileInput(f) {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(f.type)) {
      alert("Only JPG/PNG allowed");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("image", file, file.name);

    try {
      const resp = await fetch(API_URL, { method: "POST", body: fd });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ error: data.error || "Server error" });
      } else {
        setResult(data);
      }
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Drag-and-drop handlers
  function handleDragOver(e) { e.preventDefault(); e.stopPropagation(); dropRef.current.classList.add("dragover"); }
  function handleDragLeave(e) { e.preventDefault(); e.stopPropagation(); dropRef.current.classList.remove("dragover"); }
  function handleDrop(e) {
    e.preventDefault(); e.stopPropagation();
    dropRef.current.classList.remove("dragover");
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      handleFileInput(dt.files[0]);
    }
  }

  return (
    <div className="container">
      <h2>Brain Tumour Detection</h2>

      <div
        className="upload-card"
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag & drop an MRI image here (JPG / PNG), or click to choose.</p>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => handleFileInput(e.target.files[0])}
        />
        {preview && (
          <div className="preview">
            <img src={preview} alt="preview" />
          </div>
        )}
      </div>

      <div style={{display:"flex", gap:12, marginTop:12}}>
        <button onClick={handleSubmit} className="primary" disabled={loading}>Analyze Image</button>
        {loading && <Spinner />}
      </div>

      <section className="result-card">
        {result ? result.error ? (
          <div className="err">Error: {result.error}</div>
        ) : (
          <div>
            <h3>Prediction: {result.prediction}</h3>
            <ConfidenceBar confidence={result.confidence ?? 0} />
          </div>
        ) : <div className="muted">Upload an MRI and click Analyze Image.</div>}
      </section>
    </div>
  );
}
