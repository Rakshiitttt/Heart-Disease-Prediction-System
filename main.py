from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os

app = FastAPI(title="Heart Disease Prediction API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and features
MODEL_PATH = "heart_disease_model.pkl"
FEATURES_PATH = "feature_columns.pkl"

model = None
feature_columns = None

def load_resources():
    global model, feature_columns
    if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH):
        model = joblib.load(MODEL_PATH)
        feature_columns = joblib.load(FEATURES_PATH)
        return True
    return False

class PatientData(BaseModel):
    Age: float
    Sex: int
    Chest_pain_type: int
    BP: float
    Cholesterol: float
    FBS_over_120: int
    EKG_results: int
    Max_HR: float
    Exercise_angina: int
    ST_depression: float
    Slope_of_ST: int
    Number_of_vessels_fluro: int
    Thallium: int

def categorize_bp(bp):
    if bp < 120:
        return 'Normal'
    elif 120 <= bp < 130:
        return 'Elevated'
    elif 130 <= bp < 140:
        return 'Stage 1 HTN'
    else:
        return 'Stage 2 HTN'

@app.get("/")
def read_root():
    return {"message": "Heart Disease Prediction API is running"}

@app.post("/predict")
def predict(data: PatientData):
    if not load_resources():
        raise HTTPException(status_code=503, detail="Model not trained/loaded yet")
    
    # Convert input to DataFrame
    input_dict = data.dict()
    # Handle naming differences if any (e.g., Chest pain type vs Chest_pain_type)
    # The notebook features were: Age, Sex, Chest pain type, BP, Cholesterol, FBS over 120, EKG results, Max HR, Exercise angina, ST depression, Slope of ST, Number of vessels fluro, Thallium
    
    formatted_dict = {
        "Age": input_dict["Age"],
        "Sex": input_dict["Sex"],
        "Chest pain type": input_dict["Chest_pain_type"],
        "BP": input_dict["BP"],
        "Cholesterol": input_dict["Cholesterol"],
        "FBS over 120": input_dict["FBS_over_120"],
        "EKG results": input_dict["EKG_results"],
        "Max HR": input_dict["Max_HR"],
        "Exercise angina": input_dict["Exercise_angina"],
        "ST depression": input_dict["ST_depression"],
        "Slope of ST": input_dict["Slope_of_ST"],
        "Number of vessels fluro": input_dict["Number_of_vessels_fluro"],
        "Thallium": input_dict["Thallium"]
    }
    
    df = pd.DataFrame([formatted_dict])
    
    # Feature Engineering
    df['Expected_Max_HR'] = 220 - df['Age']
    df['HR_Reserve'] = df['Expected_Max_HR'] - df['Max HR']
    df['BP_Category'] = df['BP'].apply(categorize_bp)
    
    # One-Hot Encoding
    df = pd.get_dummies(df)
    
    # Reindex to match training columns
    df = df.reindex(columns=feature_columns, fill_value=0)
    
    # Prediction
    prob = model.predict(df)[0]
    prediction = "Presence" if prob > 0.5 else "Absence"
    
    return {
        "prediction": prediction,
        "probability": float(prob),
        "status": "success"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
