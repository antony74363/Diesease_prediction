import React, { useState } from "react";
import Spinner from "../components/Spinner";
import ConfidenceBar from "../components/ConfidenceBar";

const API_URL = "http://localhost:5000/predict-diabetes"; // backend URL

function validate(inputs) {
  const errors = {};
  if (!["male","female","m","f"].includes((inputs.gender||"").toLowerCase())) {
    errors.gender = "Enter 'male' or 'female'.";
  }
  if (!(Number(inputs.age) > 0 && Number(inputs.age) < 120)) {
    errors.age = "Age must be 1-119.";
  }
  if (!(Number(inputs.bmi) > 0 && Number(inputs.bmi) < 100)) {
    errors.bmi = "BMI seems out of realistic range.";
  }
  if (!(Number(inputs.hba1c) >= 0 && Number(inputs.hba1c) < 30)) {
    errors.hba1c = "HbA1c must be numeric and realistic.";
  }
  if (!(Number(inputs.glucose) >= 0 && Number(inputs.glucose) < 2000)) {
    errors.glucose = "Glucose value seems invalid.";
  }
  return errors;
}

export default function Diabetes() {
  const [form, setForm] = useState({
    gender: "male",
    age: 30,
    hypertension: false,
    heart_disease: false,
    smoking_history: "never",
    bmi: 24.5,
    hba1c: 5.6,
    glucose: 110
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ error: data.error || "Unknown server error." });
      } else {
        setResult(data);
      }
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Diabetes Prediction</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label>Gender
          <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label>Age
          <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
          {errors.age && <small className="err">{errors.age}</small>}
        </label>

        <label>Hypertension
          <select value={form.hypertension ? "yes": "no"} onChange={e => setForm({...form, hypertension: e.target.value === "yes"})}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>

        <label>Heart Disease
          <select value={form.heart_disease ? "yes": "no"} onChange={e => setForm({...form, heart_disease: e.target.value === "yes"})}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>

        <label>Smoking History
          <select value={form.smoking_history} onChange={e => setForm({...form, smoking_history: e.target.value})}>
            <option value="never">Never</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <label>BMI
          <input type="number" step="0.1" value={form.bmi} onChange={e => setForm({...form, bmi: e.target.value})} />
          {errors.bmi && <small className="err">{errors.bmi}</small>}
        </label>

        <label>HbA1c Level
          <input type="number" step="0.1" value={form.hba1c} onChange={e => setForm({...form, hba1c: e.target.value})} />
          {errors.hba1c && <small className="err">{errors.hba1c}</small>}
        </label>

        <label>Blood Glucose Level
          <input type="number" step="0.1" value={form.glucose} onChange={e => setForm({...form, glucose: e.target.value})} />
          {errors.glucose && <small className="err">{errors.glucose}</small>}
        </label>

        <div style={{display:"flex", gap: 12, alignItems:"center"}}>
          <button type="submit" className="primary" disabled={loading}>Predict</button>
          {loading && <Spinner />}
        </div>
      </form>

      <section className="result-card">
        {result ? result.error ? (
          <div className="err">Error: {result.error}</div>
        ) : (
          <div>
            <h3>Result: {result.prediction}</h3>
            {result.confidence !== null && result.confidence !== undefined ? (
              <ConfidenceBar confidence={result.confidence} />
            ) : <small>No confidence score available from model.</small>}
          </div>
        ) : <div className="muted">Submit the form to get a prediction.</div>}
      </section>
    </div>
  );
}
