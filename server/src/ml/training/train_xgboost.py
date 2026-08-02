"""
Phase 2A.1 — Baseline XGBoost Incident Prediction Model Training Script

Strictly implements baseline XGBoost model fitting, test predictions generation,
model persistence, and experiment metadata recording. Evaluation metrics (accuracy,
F1, confusion matrix, SHAP, ROC) are explicitly deferred to Phase 2A.2.
"""

import os
import sys
import time
import json
import joblib
from datetime import datetime
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
import xgboost as xgb

# Adjust sys.path to allow root package imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ML_ROOT_DIR not in sys.path:
    sys.path.insert(0, ML_ROOT_DIR)

from utils.logger import setup_logger
from training.model_loader import load_dataset_pipeline

logger = setup_logger("TrainXGBoostBaseline")

# Directory paths
MODELS_DIR = os.path.join(ML_ROOT_DIR, "models")
ARTIFACTS_DIR = os.path.join(ML_ROOT_DIR, "artifacts")
PROCESSED_DATASET_DIR = os.path.join(ML_ROOT_DIR, "datasets/processed")

BASELINE_MODEL_PATH = os.path.join(MODELS_DIR, "incident_xgboost_baseline.pkl")
PREDICTIONS_OUTPUT_PATH = os.path.join(PROCESSED_DATASET_DIR, "test_predictions_baseline.pkl")
METADATA_OUTPUT_PATH = os.path.join(ARTIFACTS_DIR, "training_metadata.json")

# Recommended baseline XGBoost hyperparameter configuration
BASELINE_HYPERPARAMETERS: Dict[str, Any] = {
    "objective": "multi:softprob",
    "num_class": 4,
    "max_depth": 6,
    "learning_rate": 0.1,
    "n_estimators": 100,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
    "eval_metric": "mlogloss",
    "tree_method": "hist",
    "verbosity": 1
}


class XGBoostBaselineTrainer:
    """Production-grade baseline XGBoost trainer for incident prediction."""

    def __init__(self, params: Dict[str, Any] = BASELINE_HYPERPARAMETERS):
        self.params = params
        self.model: xgb.XGBClassifier = None
        self.training_duration_sec: float = 0.0

    def train(self, X_train: pd.DataFrame, y_train: np.ndarray) -> xgb.XGBClassifier:
        """
        Trains baseline XGBoost classifier on X_train and y_train only.
        The testing dataset must remain completely unseen during training.
        """
        logger.info("Initializing XGBoost Classifier with Baseline Configuration...")
        for param, val in self.params.items():
            logger.info(f"  • {param:<20}: {val}")

        self.model = xgb.XGBClassifier(**self.params)

        logger.info("Training Started...")
        start_time = time.time()

        self.model.fit(X_train, y_train)

        self.training_duration_sec = round(time.time() - start_time, 2)

        total_trees = self.model.n_estimators if hasattr(self.model, "n_estimators") else self.params["n_estimators"]
        logger.info("Training Completed Successfully")
        logger.info(f"  • Total Training Time: {self.training_duration_sec} seconds")
        logger.info(f"  • Total Trees Created: {total_trees}")

        return self.model

    def predict(self, X_test: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates predictions and prediction probabilities for unseen test dataset X_test.
        """
        if self.model is None:
            logger.error("Model has not been trained yet!")
            raise RuntimeError("Model unfit. Run train() first.")

        logger.info("Generating Test Dataset Predictions & Probabilities...")
        test_pred_labels = self.model.predict(X_test)
        test_pred_probs = self.model.predict_proba(X_test)

        logger.info(f"  • Generated Predictions for {len(test_pred_labels):,} test samples.")
        logger.info(f"  • Prediction Probabilities Shape: {test_pred_probs.shape}")

        return test_pred_labels, test_pred_probs

    def save_model(self, model_path: str = BASELINE_MODEL_PATH) -> None:
        """Saves trained model binary to disk."""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(self.model, model_path)
        logger.info(f"Saving Model... Saved to {model_path}")

    def save_predictions(
        self,
        y_test: np.ndarray,
        pred_labels: np.ndarray,
        pred_probs: np.ndarray,
        output_path: str = PREDICTIONS_OUTPUT_PATH
    ) -> None:
        """Saves test prediction labels and probabilities for Phase 2A.2 evaluation."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        predictions_data = {
            "y_test_true": y_test,
            "pred_labels": pred_labels,
            "pred_probs": pred_probs
        }
        joblib.dump(predictions_data, output_path)
        logger.info(f"Saving Test Predictions Artifact... Saved to {output_path}")

    def save_metadata(
        self,
        X_train_shape: Tuple[int, int],
        X_test_shape: Tuple[int, int],
        feature_names: list,
        target_encoder: Any,
        output_path: str = METADATA_OUTPUT_PATH
    ) -> None:
        """Generates and saves experiment reproduction metadata JSON."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        metadata = {
            "model_name": "Baseline XGBoost Incident Predictor",
            "phase": "2A.1 Baseline",
            "training_timestamp": datetime.now().isoformat(),
            "python_version": sys.version.split()[0],
            "xgboost_version": xgb.__version__,
            "dataset_version": "v1.0 (200,000 synthetic windows)",
            "training_samples": int(X_train_shape[0]),
            "testing_samples": int(X_test_shape[0]),
            "feature_count": int(X_train_shape[1]),
            "target_classes": [str(c) for c in target_encoder.classes_],
            "target_mapping": {int(idx): str(cls) for idx, cls in enumerate(target_encoder.classes_)},
            "random_seed": self.params["random_state"],
            "baseline_hyperparameters": self.params,
            "training_time_seconds": self.training_duration_sec,
            "model_file_name": os.path.basename(BASELINE_MODEL_PATH)
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Saving Metadata... Saved to {output_path}")


def main():
    """Main execution function for Phase 2A.1 Baseline Training."""
    logger.info("================================================================================")
    logger.info("🚀 CORTEX ML ENGINE — PHASE 2A.1: BASELINE XGBOOST MODEL TRAINING")
    logger.info("================================================================================")

    # 1. Load Data Pipeline
    X_train, y_train, X_test, y_test, feature_names, target_encoder = load_dataset_pipeline()

    # 2. Train Model
    trainer = XGBoostBaselineTrainer(params=BASELINE_HYPERPARAMETERS)
    trainer.train(X_train=X_train, y_train=y_train)

    # 3. Generate Predictions on unseen X_test
    pred_labels, pred_probs = trainer.predict(X_test=X_test)

    # 4. Save Artifacts
    trainer.save_model(model_path=BASELINE_MODEL_PATH)
    trainer.save_predictions(y_test=y_test, pred_labels=pred_labels, pred_probs=pred_probs, output_path=PREDICTIONS_OUTPUT_PATH)
    trainer.save_metadata(
        X_train_shape=X_train.shape,
        X_test_shape=X_test.shape,
        feature_names=feature_names,
        target_encoder=target_encoder,
        output_path=METADATA_OUTPUT_PATH
    )

    logger.info("================================================================================")
    logger.info("✨ Baseline Model Ready! (Phase 2A.1 Deliverables Fully Created)")
    logger.info("================================================================================\n")


if __name__ == "__main__":
    main()
