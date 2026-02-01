import React from "react";

/**
 * confidence: number between 0 and 1
 */
export default function ConfidenceBar({ confidence = 0 }) {
  const pct = Math.round(Math.min(Math.max(confidence, 0), 1) * 100);
  return (
    <div className="confidence-wrapper" aria-hidden>
      <div className="confidence-label">Confidence: {pct}%</div>
      <div className="confidence-track">
        <div
          className="confidence-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
