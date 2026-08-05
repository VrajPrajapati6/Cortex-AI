from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import xgboost as xgb
import os
import json

app = FastAPI()

# Enable CORS for production cross-service requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(base_dir, 'models')
encoders_dir = os.path.join(models_dir, 'encoders')

anomaly_model = joblib.load(os.path.join(models_dir, 'anomaly_xgboost_classifier.pkl'))
incident_model = joblib.load(os.path.join(models_dir, 'incident_prediction_model.pkl'))
encoders = joblib.load(os.path.join(encoders_dir, 'categorical_feature_encoders.pkl'))
target_encoder = joblib.load(os.path.join(encoders_dir, 'target_incident_type_encoder.pkl'))

with open(os.path.join(encoders_dir, 'feature_names.json'), 'r') as f:
    feature_names = json.load(f)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Cortex ML Inference Engine"}

@app.post("/predict")
def predict(data: dict):
    try:
        df = pd.DataFrame([data])

        for col, le in encoders.items():
            if col in df.columns:
                df[col] = df[col].astype(str)
                df[col] = df[col].map(lambda s: le.transform([s])[0] if s in le.classes_ else -1)

        for col in feature_names:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_names]

        if hasattr(anomaly_model, "predict_proba"):
            is_anomaly = int(anomaly_model.predict_proba(df)[0][1] > 0.5)
            incident_idx = int(incident_model.predict(df)[0])
        else:
            dmat = xgb.DMatrix(df)
            is_anomaly = int(anomaly_model.predict(dmat)[0] > 0.5)
            incident_idx = int(incident_model.predict(dmat)[0])

        incident_type = target_encoder.inverse_transform([incident_idx])[0]

        return {
            "is_anomaly": is_anomaly,
            "predicted_incident": incident_type,
            "primary_service": data.get("primary_service")
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5005))
    uvicorn.run(app, host="0.0.0.0", port=port)
