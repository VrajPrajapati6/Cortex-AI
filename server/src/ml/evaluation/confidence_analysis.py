"""
Confidence Analysis & Misclassified Samples Extractor for Cortex ML Engine
Phase 2A.2 — Prediction Probability Confidence Distribution & Top 100 Incorrect Predictions Extractor
"""

import os
import sys
from typing import Dict, Any, List
import numpy as np
import pandas as pd

# Adjust sys.path to allow root package imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ML_ROOT_DIR not in sys.path:
    sys.path.insert(0, ML_ROOT_DIR)

from utils.logger import setup_logger

logger = setup_logger("ConfidenceAnalyzer")


class ConfidenceAnalyzer:
    """Analyzes model probability confidence calibration and extracts misclassified samples."""

    def __init__(self, y_true: np.ndarray, pred_labels: np.ndarray, pred_probs: np.ndarray, target_classes: List[str]):
        self.y_true = y_true
        self.pred_labels = pred_labels
        self.pred_probs = pred_probs
        self.target_classes = target_classes

        # Calculate highest probability for predicted class per sample
        self.confidences = np.max(self.pred_probs, axis=1) * 100.0

    def analyze_confidence_calibration(self) -> Dict[str, Any]:
        """Calculates mean, min, max, median confidence, and probability distribution bins."""
        logger.info("Performing Prediction Confidence Calibration Analysis...")

        avg_conf = float(np.mean(self.confidences))
        min_conf = float(np.min(self.confidences))
        max_conf = float(np.max(self.confidences))
        median_conf = float(np.median(self.confidences))

        # Bin Distribution Calculation
        bin_90_100 = int(np.sum(self.confidences >= 90.0))
        bin_80_90 = int(np.sum((self.confidences >= 80.0) & (self.confidences < 90.0)))
        bin_70_80 = int(np.sum((self.confidences >= 70.0) & (self.confidences < 80.0)))
        bin_below_70 = int(np.sum(self.confidences < 70.0))

        total = len(self.confidences)

        distribution = {
            "90_100_pct": {"count": bin_90_100, "percentage": round((bin_90_100 / total) * 100, 2)},
            "80_90_pct": {"count": bin_80_90, "percentage": round((bin_80_90 / total) * 100, 2)},
            "70_80_pct": {"count": bin_70_80, "percentage": round((bin_70_80 / total) * 100, 2)},
            "below_70_pct": {"count": bin_below_70, "percentage": round((bin_below_70 / total) * 100, 2)}
        }

        logger.info(f"• Average Confidence:     {avg_conf:.2f}%")
        logger.info(f"• Median Confidence:      {median_conf:.2f}%")
        logger.info(f"• Min / Max Confidence:   {min_conf:.2f}% / {max_conf:.2f}%")
        logger.info(f"• 90-100% Confidence Bin: {bin_90_100:,} samples ({distribution['90_100_pct']['percentage']}%)")
        logger.info(f"• Below 70% Confidence:   {bin_below_70:,} samples ({distribution['below_70_pct']['percentage']}%)")

        return {
            "avg_confidence_pct": round(avg_conf, 2),
            "median_confidence_pct": round(median_conf, 2),
            "min_confidence_pct": round(min_conf, 2),
            "max_confidence_pct": round(max_conf, 2),
            "distribution_bins": distribution
        }

    def extract_top_misclassified_samples(self, output_path: str, top_n: int = 100) -> pd.DataFrame:
        """Extracts top N incorrect predictions sorted by prediction confidence for debugging."""
        logger.info(f"Extracting Top {top_n} Misclassified Samples...")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        incorrect_mask = self.y_true != self.pred_labels
        incorrect_indices = np.where(incorrect_mask)[0]

        records = []
        for idx in incorrect_indices:
            actual_idx = self.y_true[idx]
            pred_idx = self.pred_labels[idx]
            conf = self.confidences[idx]

            actual_label = self.target_classes[actual_idx]
            pred_label = self.target_classes[pred_idx]

            records.append({
                "sample_index": int(idx),
                "actual_label": actual_label,
                "predicted_label": pred_label,
                "prediction_confidence_pct": round(conf, 2)
            })

        misclassified_df = pd.DataFrame(records)

        if not misclassified_df.empty:
            # Sort by highest confidence misclassifications first (most confident errors)
            misclassified_df = misclassified_df.sort_values(by="prediction_confidence_pct", ascending=False).head(top_n)
            misclassified_df.to_csv(output_path, index=False)
            logger.info(f"Top {len(misclassified_df)} Misclassified samples saved to: {output_path}")
        else:
            logger.info("Zero misclassified samples found! Exporting empty CSV template.")
            empty_df = pd.DataFrame(columns=["sample_index", "actual_label", "predicted_label", "prediction_confidence_pct"])
            empty_df.to_csv(output_path, index=False)
            misclassified_df = empty_df

        return misclassified_df
