"""
Confusion Matrix & Misclassification Analysis Module for Cortex ML Engine
Phase 2A.2 — Multiclass Confusion Matrix CSV, Heatmap PNG, and Misclassification Analytics
"""

import os
import sys
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix

# Adjust sys.path to allow root package imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ML_ROOT_DIR not in sys.path:
    sys.path.insert(0, ML_ROOT_DIR)

from utils.logger import setup_logger

logger = setup_logger("ConfusionMatrixEvaluator")


class ConfusionMatrixEvaluator:
    """Computes, visualizes, and analyzes multiclass confusion matrices."""

    def __init__(self, y_true: np.ndarray, pred_labels: np.ndarray, target_classes: List[str]):
        self.y_true = y_true
        self.pred_labels = pred_labels
        self.target_classes = target_classes
        self.cm_matrix = confusion_matrix(self.y_true, self.pred_labels, labels=list(range(len(self.target_classes))))

    def export_csv(self, output_path: str) -> pd.DataFrame:
        """Exports 4x4 confusion matrix as CSV with actual/predicted headers."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cm_df = pd.DataFrame(
            self.cm_matrix,
            index=[f"Actual_{c}" for c in self.target_classes],
            columns=[f"Predicted_{c}" for c in self.target_classes]
        )
        cm_df.to_csv(output_path, index=True)
        logger.info(f"Confusion Matrix CSV saved to: {output_path}")
        return cm_df

    def export_plot(self, output_path: str) -> None:
        """Generates high-resolution Seaborn confusion matrix heatmap visualization PNG."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.figure(figsize=(8, 6), dpi=300)
        
        sns.heatmap(
            self.cm_matrix,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=self.target_classes,
            yticklabels=self.target_classes,
            cbar=True,
            linewidths=0.5
        )
        
        plt.title("Baseline XGBoost Incident Prediction — Confusion Matrix", fontsize=12, fontweight="bold", pad=12)
        plt.xlabel("Predicted Incident Class", fontsize=10, labelpad=10)
        plt.ylabel("Actual Ground Truth Class", fontsize=10, labelpad=10)
        plt.tight_layout()
        
        plt.savefig(output_path, dpi=300)
        plt.close()
        logger.info(f"Confusion Matrix PNG visualization saved to: {output_path}")

    def analyze_misclassifications(self) -> Dict[str, Any]:
        """Performs detailed misclassification analysis and per-class error percentage calculation."""
        logger.info("Analyzing Misclassifications & Per-Class Error Rates...")

        total_samples = len(self.y_true)
        correct_predictions = int(np.trace(self.cm_matrix))
        total_misclassified = total_samples - correct_predictions
        overall_error_rate_pct = (total_misclassified / total_samples) * 100

        per_class_stats = {}
        most_confused_pairs = []

        for idx, class_name in enumerate(self.target_classes):
            class_total = int(self.cm_matrix[idx, :].sum())
            class_correct = int(self.cm_matrix[idx, idx])
            class_misclassified = class_total - class_correct
            error_pct = (class_misclassified / max(1, class_total)) * 100
            accuracy_pct = 100.0 - error_pct

            per_class_stats[class_name] = {
                "total_samples": class_total,
                "correct_predictions": class_correct,
                "misclassified_samples": class_misclassified,
                "accuracy_pct": round(accuracy_pct, 2),
                "error_pct": round(error_pct, 2)
            }

            # Find most confused target class
            for target_idx, target_name in enumerate(self.target_classes):
                if idx != target_idx:
                    count = int(self.cm_matrix[idx, target_idx])
                    if count > 0:
                        most_confused_pairs.append((class_name, target_name, count))

        # Sort per-class by accuracy to identify best & worst
        sorted_by_acc = sorted(per_class_stats.items(), key=lambda item: item[1]["accuracy_pct"], reverse=True)
        best_class = sorted_by_acc[0][0]
        worst_class = sorted_by_acc[-1][0]

        # Sort confused pairs by frequency
        most_confused_pairs.sort(key=lambda x: x[2], reverse=True)

        # Generate Engineering Summary String
        top_confused_str = ""
        if most_confused_pairs:
            top_pair = most_confused_pairs[0]
            top_confused_str = f"The model most frequently confuses '{top_pair[0]}' incidents as '{top_pair[1]}' ({top_pair[2]:,} samples)."

        engineering_summary = (
            f"Model achieves best prediction accuracy on '{best_class}' ({per_class_stats[best_class]['accuracy_pct']}%) "
            f"and lowest accuracy on '{worst_class}' ({per_class_stats[worst_class]['accuracy_pct']}%). "
            f"Total misclassifications: {total_misclassified:,} / {total_samples:,} samples ({overall_error_rate_pct:.2f}% error rate). "
            f"{top_confused_str}"
        )

        logger.info(f"• Total Misclassified Samples: {total_misclassified:,} / {total_samples:,} ({overall_error_rate_pct:.2f}%)")
        logger.info(f"• Best Predicted Class:        {best_class} ({per_class_stats[best_class]['accuracy_pct']}%)")
        logger.info(f"• Worst Predicted Class:       {worst_class} ({per_class_stats[worst_class]['accuracy_pct']}%)")
        logger.info(f"• Engineering Summary:         {engineering_summary}")

        return {
            "total_samples": total_samples,
            "correct_predictions": correct_predictions,
            "total_misclassified": total_misclassified,
            "overall_error_rate_pct": round(overall_error_rate_pct, 2),
            "best_predicted_class": best_class,
            "worst_predicted_class": worst_class,
            "per_class_stats": per_class_stats,
            "most_confused_pairs": [{"actual": p[0], "predicted": p[1], "count": p[2]} for p in most_confused_pairs[:5]],
            "engineering_summary": engineering_summary
        }
