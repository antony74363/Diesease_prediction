###AI Health Prediction System


##Quick links / datasets

Diabetes dataset: [https://www.kaggle.com/datasets/iammustafatz/diabetes-prediction-dataset]

Brain MRI dataset: [https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset]

##Overview

Frontend: React app (Vite/CRA compatible). UI pages for Home, Diabetes Prediction (form), Brain Tumour Detection (image upload).

Backend: Flask API exposing:

GET /health — server + model status

POST /predict-diabetes — accepts JSON and returns {"prediction": "...", "confidence": ...}

POST /predict-tumour — accepts multipart image and returns {"prediction": "...", "confidence": ...}

Training: Notebooks are provided in notebooks/. Run these to reproduce training and export models.

The API expects these exact paths — adjust app.py if you use different filenames.

Environment & prerequisites

Recommended Python: 3.11.x

Node.js & npm (for frontend)

For ML (TensorFlow):

CPU-only: OK

GPU: install proper CUDA/cuDNN matching installed TF version

Setup — Backend (Linux / macOS)
# go to backend
cd backend

# create venv using Python 3.11
python3.11 -m venv venv
source venv/bin/activate

# upgrade pip and install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt


Setup — Frontend
cd frontend
npm install
npm run dev
# open the printed URL (typically http://localhost:5173)


If the frontend cannot reach the backend, ensure frontend/src/pages/* uses the correct API_URL (default http://localhost:5000).

Training notebooks — recommended workflow

Open Jupyter with the project venv kernel:

# from project root or notebooks folder
source backend/venv/bin/activate
python -m pip install ipykernel
python -m ipykernel install --user --name ai-health-venv --display-name "AI Health (venv)"
jupyter lab  # or jupyter notebook


Open:

notebooks/diabetes_training.ipynb — preprocessing, feature engineering, model training, cross-validation, and joblib.dump(model, "diabetes_model.pkl").

notebooks/brain_tumour_training.ipynb — CNN training, augmentation, and model.save("cnn_brain_tumour") or model.save("cnn_brain_tumour.h5").

After training, copy exported files into backend/models/.

How to export models (examples)

Diabetes (scikit-learn)

import joblib
joblib.dump(trained_model, "diabetes_model.pkl")
# copy to backend/models/diabetes_model.pkl


Brain tumour (Keras)

# SavedModel
model.save("cnn_brain_tumour")
# or HDF5
model.save("cnn_brain_tumour.h5")
# copy folder/file into backend/models/

Running the API (after models are placed)

From backend/ venv:

source venv/bin/activate
python app.py
# server listens usually on http://127.0.0.1:5000


Health check:

curl http://localhost:5000/health
# expect JSON {"status":"ok", "diabetes_model_loaded": true, "cnn_model_loaded": true}


Tumour

curl -X POST http://localhost:5000/predict-tumour \
  -F "image=@/full/path/to/mri.jpg"


Disclaimer

This system is for educational purposes only. It is not a medical diagnostic tool. Do not use predictions for clinical decision-making.
