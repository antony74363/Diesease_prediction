AI Health Prediction System

Status: Development — models removed, training notebooks included.
Purpose: Educational demo that shows a diabetes predictor (classical ML) and a brain tumour detector (CNN). Use the notebooks to train/export models, then place exported models in backend/models/ for the API.

Project structure
ai-health-prediction/
├─ backend/
│  ├─ models/                        # place exported models here
│  │  ├─ diabetes_model.pkl          # <-- put here after training
│  │  └─ cnn_brain_tumour/           # <-- SavedModel folder or .h5 file
│  ├─ app.py
│  ├─ utils.py
│  └─ requirements.txt
├─ frontend/
│  ├─ public/
│  └─ src/
├─ notebooks/                         # TRAINING NOTEBOOKS (you added these)
│  ├─ diabetes_training.ipynb
│  └─ brain_tumour_training.ipynb
├─ README.md
└─ requirements.lock.txt              # optional: exact installed packages

Quick links / datasets

Diabetes dataset: [DATASET_LINK_1]

Brain MRI dataset: [DATASET_LINK_2]

Replace the two placeholders above with the public URLs for the datasets you used.

Overview

Frontend: React app (Vite/CRA compatible). UI pages for Home, Diabetes Prediction (form), Brain Tumour Detection (image upload).

Backend: Flask API exposing:

GET /health — server + model status

POST /predict-diabetes — accepts JSON and returns {"prediction": "...", "confidence": ...}

POST /predict-tumour — accepts multipart image and returns {"prediction": "...", "confidence": ...}

Training: Notebooks are provided in notebooks/. Run these to reproduce training and export models.

Important notes (models removed)

Models have been removed from the repo. Use the notebooks to retrain or reproduce the models locally. After training, export and copy the model artifacts into backend/models/:

Diabetes model: backend/models/diabetes_model.pkl (pickle or joblib)

Brain tumour model: backend/models/cnn_brain_tumour/ (SavedModel folder) or backend/models/cnn_brain_tumour.h5

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

# (optional) freeze the exact working environment
python -m pip freeze > ../requirements.lock.txt


If you installed dependencies without version pins earlier and it worked, keep requirements.lock.txt for reproducibility.

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

Example API calls

Diabetes

curl -X POST http://localhost:5000/predict-diabetes \
  -H "Content-Type: application/json" \
  -d '{
    "gender":"male","age":47,"hypertension":false,
    "heart_disease":false,"smoking_history":"former",
    "bmi":27.3,"hba1c":6.1,"glucose":130
  }'


Tumour

curl -X POST http://localhost:5000/predict-tumour \
  -F "image=@/full/path/to/mri.jpg"

Deployment tips

Add MAX_CONTENT_LENGTH in app.py to limit upload size.

Use gunicorn + nginx (or containerize with Docker).

For production, enable HTTPS and tighten CORS origins.

Consider using background job queue (Celery / RQ) for large workloads.

Troubleshooting

Flask import errors / pip conflicts: Use Python 3.11 and a fresh venv. If you installed latest packages without version pins and it worked, run pip freeze > requirements.lock.txt.

TensorFlow wheel issues: Ensure Python version is compatible (3.8–3.11). For GPU, ensure CUDA/cuDNN compatibility.

Model shape mismatches: Confirm input preprocessing in app.py matches training (resize, normalization, feature order and scaling).

Pickle security: Only load pickles from trusted sources.

Optional enhancements (ideas)

Add an explanation layer (Grad-CAM) for the CNN predictions.

Add confidence calibration for the classifiers.

Add a small admin page to upload trained models directly into backend/models/.

CI test that runs the notebooks or minimal validations (e.g., load-sanity-check models).

Disclaimer

This system is for educational purposes only. It is not a medical diagnostic tool. Do not use predictions for clinical decision-making.
