"""
Flask backend for AI Health Prediction System.

- Loads diabetes model (.pkl) with joblib/pickle at startup.
- Loads CNN model with tensorflow.keras at startup.
- Provides /predict-diabetes and /predict-tumour endpoints.
"""

import os
import io
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

# For diabetes model
import joblib  # joblib or pickle

# For CNN model
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from PIL import Image

from utils import standardize_diabetes_input

# Config
DIABETES_MODEL_PATH = os.path.join("models", "diabetes_model.pkl")
# Either a Keras H5 file or SavedModel folder. Adjust path accordingly.
CNN_MODEL_PATH = os.path.join("models", "cnn_brain_tumour")  

app = Flask(__name__)
CORS(app)

# Load models once at startup
diabetes_model = None
cnn_model = None

def load_models():
    global diabetes_model, cnn_model
    # Load diabetes model (scikit-learn style)
    try:
        diabetes_model = joblib.load(DIABETES_MODEL_PATH)
        app.logger.info("Loaded diabetes model from %s", DIABETES_MODEL_PATH)
    except Exception as e:
        app.logger.error("Failed to load diabetes model: %s", e)
        diabetes_model = None

    # Load CNN model (Keras)
    try:
        # If it's a folder (SavedModel) or .h5 file, Keras load_model handles both
        cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)
        cnn_model.make_predict_function()
        app.logger.info("Loaded CNN model from %s", CNN_MODEL_PATH)
    except Exception as e:
        app.logger.error("Failed to load CNN model: %s", e)
        cnn_model = None

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "diabetes_model_loaded": diabetes_model is not None,
        "cnn_model_loaded": cnn_model is not None
    })

@app.route("/predict-diabetes", methods=["POST"])
def predict_diabetes():
    """
    Expects JSON:
    {
       "gender":"male"/"female",
       "age": 45,
       "hypertension": true/false,
       "heart_disease": true/false,
       "smoking_history": "never"/"former"/"current"/"unknown",
       "bmi": 24.5,
       "hba1c": 5.6,
       "glucose": 110
    }
    Returns JSON:
    {
      "prediction": "Diabetic" / "Not Diabetic",
      "confidence": 0.87,
      "raw_scores": [...optional...] 
    }
    """
    if diabetes_model is None:
        return jsonify({"error": "Diabetes model not loaded on server."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request must be JSON."}), 400

        # Validate & convert inputs (server-side basic validation)
        x = standardize_diabetes_input(data)  # returns 2D numpy array shaped (1, n_features)
        # Predict
        # If scikit-learn classifier with predict_proba:
        confidence = None
        try:
            if hasattr(diabetes_model, "predict_proba"):
                probs = diabetes_model.predict_proba(x)[0]
                # If binary, take probability for positive class (index 1)
                if probs.shape[0] >= 2:
                    positive_prob = float(probs[1])
                else:
                    positive_prob = float(probs[0])
                pred_label = diabetes_model.classes_[int(positive_prob >= 0.5)] \
                    if hasattr(diabetes_model, "classes_") else ("Diabetic" if positive_prob >= 0.5 else "Not Diabetic")
                confidence = positive_prob
            else:
                pred = diabetes_model.predict(x)[0]
                # No probability available; return deterministic answer with confidence None
                positive_prob = None
                pred_label = str(pred)
        except Exception:
            # fallback to predict
            pred = diabetes_model.predict(x)[0]
            pred_label = str(pred)
            positive_prob = None

        # Normalize label to "Diabetic" / "Not Diabetic"
        if isinstance(pred_label, (int, float)):
            # If model returns 0/1
            pred_str = "Diabetic" if float(pred_label) == 1.0 else "Not Diabetic"
        else:
            s = str(pred_label).lower()
            if "diabet" in s or s in ("1", "true", "yes"):
                pred_str = "Diabetic"
            else:
                pred_str = "Not Diabetic"

        response = {
            "prediction": pred_str,
            "confidence": confidence if confidence is not None else None
        }
        return jsonify(response)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error during prediction", "detail": str(e)}), 500


@app.route("/predict-tumour", methods=["POST"])
def predict_tumour():
    """
    Expects multipart/form-data with field 'image' (file).
    Returns:
    {
      "prediction": "Tumour" / "No Tumour",
      "confidence": 0.93
    }
    """
    if cnn_model is None:
        return jsonify({"error": "CNN model not loaded on server."}), 500

    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided under key 'image'"}), 400

        file = request.files["image"]
        img_bytes = file.read()
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Preprocess: resize to model's expected input (commonly 224x224 or 150x150).
        # The exact size must match the model's training preprocessing.
        target_size = (224, 224)  # change if your model uses different size
        pil_img = pil_img.resize(target_size)
        x = np.array(pil_img).astype("float32") / 255.0
        x = np.expand_dims(x, axis=0)  # shape (1, H, W, 3)

        # Prediction
        preds = cnn_model.predict(x)  # shape e.g. (1,2) or (1,1)
        # Determine class & confidence
        if preds.shape[-1] == 1:
            # single sigmoid output
            prob = float(preds[0][0])
            predicted_class = "Tumour" if prob >= 0.5 else "No Tumour"
            confidence = prob if prob >= 0.5 else 1 - prob
        else:
            # softmax with two classes [no_tumour, tumour] or [tumour, no_tumour]
            prob_arr = preds[0]
            class_idx = int(np.argmax(prob_arr))
            confidence = float(np.max(prob_arr))
            # Heuristic: assume index 1 corresponds to tumor if model training followed that.
            # We will convert to labels by checking model.output_shape or letting user map classes.
            # For safety, label index 1 => 'Tumour' (common convention)
            predicted_class = "Tumour" if class_idx == 1 else "No Tumour"

        return jsonify({
            "prediction": predicted_class,
            "confidence": round(float(confidence), 4)
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error during tumour prediction", "detail": str(e)}), 500


if __name__ == "__main__":
    load_models()
    app.run(host="0.0.0.0", port=5000, debug=True)
