from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import xgboost as xgb
import os
import json

app = FastAPI()

base_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(base_dir, 'models')
encoders_dir = os.path.join(models_dir, 'encoders')

anomaly_model = joblib.load(os.path.join(models_dir, 'anomaly_xgboost_classifier.pkl'))
incident_model = joblib.load(os.path.join(models_dir, 'incident_prediction_model.pkl'))
encoders = joblib.load(os.path.join(encoders_dir, 'categorical_feature_encoders.pkl'))
target_encoder = joblib.load(os.path.join(encoders_dir, 'target_incident_type_encoder.pkl'))

with open(os.path.join(encoders_dir, 'feature_names.json'), 'r') as f:
    feature_names = json.load(f)

@app.post("/predict")
def predict(data: dict):
    try:
        df = pd.DataFrame([data])
        df = df[feature_names]

        cat_cols = ['workflow_name', 'primary_service', 'database_state', 'cache_state', 'network_state', 'external_api_state']
        for col in cat_cols:
            if col in encoders:
                known_classes = set(encoders[col].classes_)
                df[col] = df[col].apply(lambda x: x if x in known_classes else encoders[col].classes_[0])
                df[col] = encoders[col].transform(df[col])

        if hasattr(anomaly_model, 'predict_proba'):
            is_anomaly = int(anomaly_model.predict(df)[0])
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
    uvicorn.run(app, host="127.0.0.1", port=5005)
