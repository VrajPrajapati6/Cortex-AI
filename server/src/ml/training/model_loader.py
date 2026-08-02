"""
Dataset & Encoder Loader Module for Cortex ML Training Pipeline
"""

import os
import sys
import json
import joblib
from typing import Tuple, List, Dict, Any
import pandas as pd
import numpy as np

# Adjust sys.path to allow root package imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ML_ROOT_DIR not in sys.path:
    sys.path.insert(0, ML_ROOT_DIR)

from utils.logger import setup_logger

logger = setup_logger("ModelLoader")

TRAIN_CSV_PATH = os.path.join(ML_ROOT_DIR, "datasets/processed/train_dataset.csv")
TEST_CSV_PATH = os.path.join(ML_ROOT_DIR, "datasets/processed/test_dataset.csv")
ENCODERS_DIR = os.path.join(ML_ROOT_DIR, "models/encoders")
FEATURE_NAMES_PATH = os.path.join(ENCODERS_DIR, "feature_names.json")
TARGET_ENCODER_PATH = os.path.join(ENCODERS_DIR, "target_incident_type_encoder.pkl")
TARGET_COL = "target_incident_type"


class DatasetLoader:
    """Production-grade dataset loader and validator for XGBoost training."""

    def __init__(
        self,
        train_path: str = TRAIN_CSV_PATH,
        test_path: str = TEST_CSV_PATH,
        feature_names_path: str = FEATURE_NAMES_PATH,
        target_encoder_path: str = TARGET_ENCODER_PATH
    ):
        self.train_path = train_path
        self.test_path = test_path
        self.feature_names_path = feature_names_path
        self.target_encoder_path = target_encoder_path

    def load_and_validate(self) -> Tuple[pd.DataFrame, np.ndarray, pd.DataFrame, np.ndarray, List[str], Any]:
        """
        Loads training/testing sets and target encoders, verifying schema integrity.
        
        Returns:
            Tuple[X_train, y_train, X_test, y_test, feature_names, target_encoder]
        """
        logger.info("Loading Processed Training & Testing Datasets...")

        if not os.path.exists(self.train_path) or not os.path.exists(self.test_path):
            logger.error(f"Processed dataset files missing! Check {self.train_path} and {self.test_path}")
            raise FileNotFoundError("Processed datasets missing. Run data preparation first.")

        # 1. Load Data
        train_df = pd.read_csv(self.train_path)
        test_df = pd.read_csv(self.test_path)
        target_encoder = joblib.load(self.target_encoder_path)

        if os.path.exists(self.feature_names_path):
            try:
                with open(self.feature_names_path, 'r', encoding='utf-8') as f:
                    feature_names = json.load(f)
            except Exception:
                feature_names = joblib.load(self.feature_names_path)
        else:
            feature_names = [c for c in train_df.columns if c != TARGET_COL]
            with open(self.feature_names_path, 'w', encoding='utf-8') as f:
                json.dump(feature_names, f, indent=2)

        # 2. Verify Predictor Matrix X & Target Column y
        if TARGET_COL not in train_df.columns or TARGET_COL not in test_df.columns:
            logger.error(f"Target column '{TARGET_COL}' missing from datasets!")
            raise ValueError(f"Missing target column '{TARGET_COL}'")

        X_train = train_df[feature_names].copy()
        y_train = train_df[TARGET_COL].values

        X_test = test_df[feature_names].copy()
        y_test = test_df[TARGET_COL].values

        # 3. Validation Checks
        expected_features_count = 33
        if len(feature_names) != expected_features_count:
            logger.error(f"Feature count discrepancy: Expected {expected_features_count}, got {len(feature_names)}")
            raise ValueError("Feature count mismatch")

        if X_train.shape[1] != expected_features_count or X_test.shape[1] != expected_features_count:
            logger.error("Predictor matrix shape does not match expected 33 features!")
            raise ValueError("Predictor matrix feature count mismatch")

        # 4. Verify Target Classes
        unique_targets_train = set(np.unique(y_train))
        unique_targets_test = set(np.unique(y_test))
        expected_label_indices = set(range(len(target_encoder.classes_)))

        if unique_targets_train != expected_label_indices or unique_targets_test != expected_label_indices:
            logger.error("Encoded target values do not match expected class indices (0..3)!")
            raise ValueError("Target label index mismatch")

        # 5. Dataset Summary Log
        logger.info("Dataset Loaded & Schema Verified Successfully")
        logger.info(f"• Training Samples:              {len(X_train):,}")
        logger.info(f"• Testing Samples:               {len(X_test):,}")
        logger.info(f"• Number of Predictor Features:   {len(feature_names)}")
        logger.info(f"• Target Classes ({len(target_encoder.classes_)}):           {list(target_encoder.classes_)}")
        logger.info(f"• Encoded Integer Mapping:       { {idx: cls for idx, cls in enumerate(target_encoder.classes_)} }")

        return X_train, y_train, X_test, y_test, feature_names, target_encoder


def load_dataset_pipeline() -> Tuple[pd.DataFrame, np.ndarray, pd.DataFrame, np.ndarray, List[str], Any]:
    """Convenience function to execute dataset loader pipeline."""
    loader = DatasetLoader()
    return loader.load_and_validate()
