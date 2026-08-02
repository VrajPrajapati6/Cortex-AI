"""
Comprehensive Evaluation Metrics Module for Cortex ML Engine
Phase 2A.2 — Evaluates Baseline XGBoost Multiclass Predictions
"""

import os
import sys
import json
from typing import Dict, Any, List
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    log_loss,
    balanced_accuracy_score,
    matthews_corrcoef,
    cohen_kappa_score
)

# Adjust sys.path to allow root package imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ML_ROOT_DIR not in sys.path:
    sys.path.insert(0, ML_ROOT_DIR)

from utils.logger import setup_logger

logger = setup_logger("EvaluationMetrics")


class EvaluatorMetrics:
    """Computes production-grade multiclass classification evaluation metrics."""

    def __init__(self, y_true: np.ndarray, pred_labels: np.ndarray, pred_probs: np.ndarray, target_classes: List[str]):
        self.y_true = y_true
        self.pred_labels = pred_labels
        self.pred_probs = pred_probs
        self.target_classes = target_classes

    def compute_metrics(self) -> Dict[str, Any]:
        """Calculates accuracy, per-class/macro/weighted metrics, log loss, MCC, & Cohen's Kappa."""
        logger.info("Computing Classification Metrics...")

        # 1. Overall Accuracy
        acc = accuracy_score(self.y_true, self.pred_labels)

        # 2. Balanced Accuracy
        bal_acc = balanced_accuracy_score(self.y_true, self.pred_labels)

        # 3. Log Loss
        loss = log_loss(self.y_true, self.pred_probs)

        # 4. MCC & Cohen's Kappa
        mcc = matthews_corrcoef(self.y_true, self.pred_labels)
        kappa = cohen_kappa_score(self.y_true, self.pred_labels)

        # 5. Per-class & Aggregate Precision, Recall, F1
        prec_per_class, rec_per_class, f1_per_class, supp_per_class = precision_recall_fscore_support(
            self.y_true, self.pred_labels, labels=list(range(len(self.target_classes)))
        )

        prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(self.y_true, self.pred_labels, average="macro")
        prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(self.y_true, self.pred_labels, average="weighted")

        # 6. Structured Classification Report Dict
        report_dict = classification_report(
            self.y_true,
            self.pred_labels,
            target_names=self.target_classes,
            output_dict=True
        )

        per_class_metrics = {}
        for idx, class_name in enumerate(self.target_classes):
            per_class_metrics[class_name] = {
                "precision": float(prec_per_class[idx]),
                "recall": float(rec_per_class[idx]),
                "f1_score": float(f1_per_class[idx]),
                "support": int(supp_per_class[idx])
            }

        metrics_summary = {
            "accuracy": float(acc),
            "balanced_accuracy": float(bal_acc),
            "log_loss": float(loss),
            "mcc": float(mcc),
            "cohen_kappa": float(kappa),
            "macro_avg": {
                "precision": float(prec_macro),
                "recall": float(rec_macro),
                "f1_score": float(f1_macro)
            },
            "weighted_avg": {
                "precision": float(prec_weighted),
                "recall": float(rec_weighted),
                "f1_score": float(f1_weighted)
            },
            "per_class": per_class_metrics,
            "full_classification_report": report_dict
        }

        # Console Summary Output
        logger.info(f"• Accuracy:               {acc * 100:.2f}%")
        logger.info(f"• Balanced Accuracy:      {bal_acc * 100:.2f}%")
        logger.info(f"• Log Loss:               {loss:.4f}")
        logger.info(f"• MCC:                    {mcc:.4f}")
        logger.info(f"• Cohen's Kappa:          {kappa:.4f}")
        logger.info(f"• Macro F1-Score:         {f1_macro:.4f}")
        logger.info(f"• Weighted F1-Score:      {f1_weighted:.4f}")

        return metrics_summary

    def save_classification_report(self, report_dict: Dict[str, Any], output_path: str) -> None:
        """Saves classification report as formatted JSON."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report_dict, f, indent=2)
        logger.info(f"Classification report JSON saved to: {output_path}")
