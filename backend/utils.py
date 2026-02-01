"""
Utility helpers for backend input standardisation and validation.
"""

import numpy as np

def standardize_diabetes_input(data: dict):
    """
    Convert incoming JSON to numeric feature vector expected by the diabetes model.

    IMPORTANT: This implementation is a simple mapping example.
    You must change feature ordering/names to exactly match how the model was trained.
    """
    # Example mapping (change to match your model)
    # Suppose model expects features:
    # ['gender_male', 'age', 'hypertension', 'heart_disease', 'smoking_current', 'bmi', 'hba1c', 'glucose']
    gender = data.get("gender", "").lower()
    age = float(data.get("age", 0))
    hypertension = 1.0 if bool(data.get("hypertension", False)) else 0.0
    heart_disease = 1.0 if bool(data.get("heart_disease", False)) else 0.0
    smoking = str(data.get("smoking_history", "unknown")).lower()
    bmi = float(data.get("bmi", 0.0))
    hba1c = float(data.get("hba1c", 0.0))
    glucose = float(data.get("glucose", 0.0))

    gender_male = 1.0 if gender in ("male", "m") else 0.0

    smoking_current = 1.0 if smoking in ("current", "smoker", "yes") else 0.0

    # Build feature vector in the order expected by model
    features = [gender_male, age, hypertension, heart_disease, smoking_current, bmi, hba1c, glucose]
    return np.array([features], dtype=float)
