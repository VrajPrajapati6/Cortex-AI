"""
Phase 2A.2 — Comprehensive Evaluation Orchestrator Script

Rigorously evaluates the baseline XGBoost Incident Prediction model on the unseen test dataset.
Exports classification report JSON, evaluation metadata JSON, confusion matrix CSV/PNG,
confidence calibration metrics, and top 100 misclassified samples CSV.
"""

import os
import sys
import json
import joblib
from datetime import datetime
from typing import Dict, Any
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
from evaluation.metrics import EvaluatorMetrics
from evaluation.confusion_matrix import ConfusionMatrixEvaluator
from evaluation.confidence_analysis import ConfidenceAnalyzer

logger = setup_logger("EvaluateModel")

# File Paths
MODELS_DIR = os.path.join(ML_ROOT_DIR, "models")
ARTIFACTS_DIR = os.path.join(ML_ROOT_DIR, "artifacts")
PROCESSED_DIR = os.path.join(ML_ROOT_DIR, "datasets/processed")

BASELINE_MODEL_PATH = os.path.join(MODELS_DIR, "incident_xgboost_baseline.pkl")
PREDICTIONS_PATH = os.path.join(PROCESSED_DIR, "test_predictions_baseline.pkl")

# Artifact Output Paths
CLASSIFICATION_REPORT_PATH = os.path.join(ARTIFACTS_DIR, "classification_report.json")
EVALUATION_METADATA_PATH = os.path.join(ARTIFACTS_DIR, "evaluation_metadata.json")
CONFUSION_MATRIX_CSV_PATH = os.path.join(ARTIFACTS_DIR, "confusion_matrix.csv")
CONFUSION_MATRIX_PNG_PATH = os.path.join(ARTIFACTS_DIR, "confusion_matrix.png")
MISCLASSIFIED_SAMPLES_PATH = os.path.join(ARTIFACTS_DIR, "misclassified_samples.csv")


def evaluate_baseline_model() -> Dict[str, Any]:
    """Orchestrates Phase 2A.2 complete model evaluation workflow."""
    logger.info("================================================================================")
    logger.info("📊 CORTEX ML ENGINE — PHASE 2A.2: BASELINE MODEL COMPREHENSIVE EVALUATION")
    logger.info("================================================================================")

    # 1. Load Data Pipeline & Test Set
    logger.info("Loading Testing Dataset & Schema Encoders...")
    _, _, X_test, y_test, feature_names, target_encoder = load_dataset_pipeline()
    target_classes = [str(c) for c in target_encoder.classes_]

    # 2. Load Model & Predictions
    logger.info(f"Loading Model... from {BASELINE_MODEL_PATH}")
    if not os.path.exists(BASELINE_MODEL_PATH):
        logger.error("Baseline model file missing!")
        raise FileNotFoundError("Baseline model not found. Run training first.")

    model: xgb.XGBClassifier = joblib.load(BASELINE_MODEL_PATH)

    if os.path.exists(PREDICTIONS_PATH):
        logger.info(f"Loading Saved Predictions Artifact... from {PREDICTIONS_PATH}")
        pred_data = joblib.load(PREDICTIONS_PATH)
        pred_labels = pred_data["pred_labels"]
        pred_probs = pred_data["pred_probs"]
    else:
        logger.info("Generating Fresh Predictions on Test Set...")
        pred_labels = model.predict(X_test)
        pred_probs = model.predict_proba(X_test)

    # 3. Calculate Comprehensive Evaluation Metrics
    metrics_evaluator = EvaluatorMetrics(
        y_true=y_test,
        pred_labels=pred_labels,
        pred_probs=pred_probs,
        target_classes=target_classes
    )
    metrics_summary = metrics_evaluator.compute_metrics()
    metrics_evaluator.save_classification_report(
        report_dict=metrics_summary["full_classification_report"],
        output_path=CLASSIFICATION_REPORT_PATH
    )

    # 4. Generate & Analyze Confusion Matrix
    cm_evaluator = ConfusionMatrixEvaluator(
        y_true=y_test,
        pred_labels=pred_labels,
        target_classes=target_classes
    )
    cm_evaluator.export_csv(output_path=CONFUSION_MATRIX_CSV_PATH)
    cm_evaluator.export_plot(output_path=CONFUSION_MATRIX_PNG_PATH)
    misclass_summary = cm_evaluator.analyze_misclassifications()

    # 5. Prediction Probability Confidence Analysis & Top 100 Incorrect Predictions
    conf_analyzer = ConfidenceAnalyzer(
        y_true=y_test,
        pred_labels=pred_labels,
        pred_probs=pred_probs,
        target_classes=target_classes
    )
    conf_summary = conf_analyzer.analyze_confidence_calibration()
    conf_analyzer.extract_top_misclassified_samples(output_path=MISCLASSIFIED_SAMPLES_PATH, top_n=100)

    # 6. Generate Evaluation Metadata JSON
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    eval_metadata = {
        "model_name": "Baseline XGBoost Incident Predictor",
        "phase": "2A.2 Evaluation",
        "dataset_used": "server/src/ml/datasets/processed/test_dataset.csv",
        "test_samples_count": len(y_test),
        "evaluation_timestamp": datetime.now().isoformat(),
        "accuracy_pct": round(metrics_summary["accuracy"] * 100, 2),
        "macro_f1_score": round(metrics_summary["macro_avg"]["f1_score"], 4),
        "weighted_f1_score": round(metrics_summary["weighted_avg"]["f1_score"], 4),
        "balanced_accuracy_pct": round(metrics_summary["balanced_accuracy"] * 100, 2),
        "log_loss": round(metrics_summary["log_loss"], 4),
        "mcc": round(metrics_summary["mcc"], 4),
        "cohen_kappa": round(metrics_summary["cohen_kappa"], 4),
        "average_prediction_confidence_pct": conf_summary["avg_confidence_pct"],
        "total_misclassified_samples": misclass_summary["total_misclassified"],
        "overall_error_rate_pct": misclass_summary["overall_error_rate_pct"],
        "best_predicted_class": misclass_summary["best_predicted_class"],
        "worst_predicted_class": misclass_summary["worst_predicted_class"],
        "engineering_summary": misclass_summary["engineering_summary"],
        "confidence_distribution_bins": conf_summary["distribution_bins"]
    }

    with open(EVALUATION_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(eval_metadata, f, indent=2)

    logger.info(f"Evaluation Metadata JSON saved to: {EVALUATION_METADATA_PATH}")

    logger.info("================================================================================")
    logger.info("✨ Evaluation Completed Successfully. (Phase 2A.2 Deliverables Fully Created)")
    logger.info("================================================================================\n")

    return eval_metadata


if __name__ == "__main__":
    evaluate_baseline_model()
