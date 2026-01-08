import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, mean_squared_error, r2_score,
    roc_auc_score, confusion_matrix, classification_report, roc_curve
)
from sklearn.preprocessing import StandardScaler
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
from data_preprocessing import DataPreprocessor

class PerformancePredictor:
    def __init__(self):
        self.preprocessor = DataPreprocessor()
        self.logistic_model = None
        self.random_forest_classifier = None
        self.random_forest_regressor = None
        self.gradient_boosting_classifier = None
        self.scaler = StandardScaler()

    def train_models(self):
        print("Fetching data from Supabase...")
        data = self.preprocessor.fetch_all_data()

        print("Preparing performance data...")
        features, target_grades, target_at_risk = self.preprocessor.prepare_performance_data(data)

        if len(features) < 10:
            print("Not enough data to train models. Need at least 10 samples.")
            return

        X = self.scaler.fit_transform(features)
        X_train, X_test, y_grade_train, y_grade_test, y_risk_train, y_risk_test = train_test_split(
            X, target_grades, target_at_risk, test_size=0.2, random_state=42, stratify=target_at_risk
        )

        print("\n" + "="*60)
        print("TRAINING PERFORMANCE PREDICTION MODELS")
        print("="*60)

        print("\n=== Training Logistic Regression for At-Risk Prediction ===")
        self.logistic_model = LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced')
        self.logistic_model.fit(X_train, y_risk_train)

        y_risk_pred = self.logistic_model.predict(X_test)
        y_risk_proba = self.logistic_model.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_risk_test, y_risk_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(y_risk_test, y_risk_pred, average='binary')
        roc_auc = roc_auc_score(y_risk_test, y_risk_proba)

        cv_scores = cross_val_score(self.logistic_model, X_train, y_risk_train, cv=5, scoring='f1')

        print(f"Logistic Regression Results:")
        print(f"  Accuracy: {accuracy:.4f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall: {recall:.4f}")
        print(f"  F1-Score: {f1:.4f}")
        print(f"  ROC-AUC: {roc_auc:.4f}")
        print(f"  Cross-Val Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

        print("\n=== Training Random Forest Classifier for At-Risk Prediction ===")
        self.random_forest_classifier = RandomForestClassifier(
            n_estimators=200, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, random_state=42, class_weight='balanced',
            n_jobs=-1
        )
        self.random_forest_classifier.fit(X_train, y_risk_train)

        y_risk_pred_rf = self.random_forest_classifier.predict(X_test)
        y_risk_proba_rf = self.random_forest_classifier.predict_proba(X_test)[:, 1]

        accuracy_rf = accuracy_score(y_risk_test, y_risk_pred_rf)
        precision_rf, recall_rf, f1_rf, _ = precision_recall_fscore_support(
            y_risk_test, y_risk_pred_rf, average='binary'
        )
        roc_auc_rf = roc_auc_score(y_risk_test, y_risk_proba_rf)

        cv_scores_rf = cross_val_score(self.random_forest_classifier, X_train, y_risk_train, cv=5, scoring='f1')

        print(f"Random Forest Classifier Results:")
        print(f"  Accuracy: {accuracy_rf:.4f}")
        print(f"  Precision: {precision_rf:.4f}")
        print(f"  Recall: {recall_rf:.4f}")
        print(f"  F1-Score: {f1_rf:.4f}")
        print(f"  ROC-AUC: {roc_auc_rf:.4f}")
        print(f"  Cross-Val Mean: {cv_scores_rf.mean():.4f} (+/- {cv_scores_rf.std():.4f})")

        print("\n=== Training Gradient Boosting Classifier for At-Risk Prediction ===")
        self.gradient_boosting_classifier = GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.05, max_depth=5,
            min_samples_split=5, min_samples_leaf=2, random_state=42
        )
        self.gradient_boosting_classifier.fit(X_train, y_risk_train)

        y_risk_pred_gb = self.gradient_boosting_classifier.predict(X_test)
        y_risk_proba_gb = self.gradient_boosting_classifier.predict_proba(X_test)[:, 1]

        accuracy_gb = accuracy_score(y_risk_test, y_risk_pred_gb)
        precision_gb, recall_gb, f1_gb, _ = precision_recall_fscore_support(
            y_risk_test, y_risk_pred_gb, average='binary'
        )
        roc_auc_gb = roc_auc_score(y_risk_test, y_risk_proba_gb)

        print(f"Gradient Boosting Classifier Results:")
        print(f"  Accuracy: {accuracy_gb:.4f}")
        print(f"  Precision: {precision_gb:.4f}")
        print(f"  Recall: {recall_gb:.4f}")
        print(f"  F1-Score: {f1_gb:.4f}")
        print(f"  ROC-AUC: {roc_auc_gb:.4f}")

        print("\n=== Training Random Forest Regressor for Grade Prediction ===")
        self.random_forest_regressor = RandomForestRegressor(
            n_estimators=200, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, random_state=42, n_jobs=-1
        )
        self.random_forest_regressor.fit(X_train, y_grade_train)

        y_grade_pred = self.random_forest_regressor.predict(X_test)
        mse = mean_squared_error(y_grade_test, y_grade_pred)
        rmse = np.sqrt(mse)
        mae = np.mean(np.abs(y_grade_test - y_grade_pred))
        r2 = r2_score(y_grade_test, y_grade_pred)

        print(f"Random Forest Regressor Results:")
        print(f"  RMSE: {rmse:.4f}")
        print(f"  MAE: {mae:.4f}")
        print(f"  R² Score: {r2:.4f}")

        print("\n=== Feature Importance Analysis ===")
        feature_importance_df = pd.DataFrame({
            'feature': features.columns,
            'importance': self.random_forest_classifier.feature_importances_
        }).sort_values('importance', ascending=False)
        print(feature_importance_df.to_string(index=False))

        print("\n=== Confusion Matrix (Random Forest) ===")
        cm = confusion_matrix(y_risk_test, y_risk_pred_rf)
        print(f"True Negatives: {cm[0,0]}, False Positives: {cm[0,1]}")
        print(f"False Negatives: {cm[1,0]}, True Positives: {cm[1,1]}")

        self._save_models()
        self._export_model_parameters(features.columns.tolist())
        self._generate_visualizations(y_risk_test, y_risk_proba_rf, feature_importance_df)

        return {
            'logistic_accuracy': float(accuracy),
            'logistic_roc_auc': float(roc_auc),
            'rf_classifier_accuracy': float(accuracy_rf),
            'rf_classifier_roc_auc': float(roc_auc_rf),
            'gb_classifier_accuracy': float(accuracy_gb),
            'gb_classifier_roc_auc': float(roc_auc_gb),
            'rf_regressor_rmse': float(rmse),
            'rf_regressor_mae': float(mae),
            'rf_regressor_r2': float(r2),
            'samples_used': len(features),
            'train_size': len(X_train),
            'test_size': len(X_test)
        }

    def _save_models(self):
        print("\n=== Saving Models ===")
        joblib.dump(self.logistic_model, 'ml_models/saved_models/logistic_model.pkl')
        joblib.dump(self.random_forest_classifier, 'ml_models/saved_models/rf_classifier.pkl')
        joblib.dump(self.gradient_boosting_classifier, 'ml_models/saved_models/gb_classifier.pkl')
        joblib.dump(self.random_forest_regressor, 'ml_models/saved_models/rf_regressor.pkl')
        joblib.dump(self.scaler, 'ml_models/saved_models/scaler.pkl')
        print("Models saved successfully!")

    def _export_model_parameters(self, feature_names: list):
        print("\n=== Exporting Model Parameters for Edge Functions ===")

        params = {
            'metadata': {
                'model_version': '2.0',
                'training_samples': len(feature_names),
                'feature_names': feature_names,
                'trained_at': pd.Timestamp.now().isoformat()
            },
            'logistic_regression': {
                'coefficients': self.logistic_model.coef_[0].tolist(),
                'intercept': float(self.logistic_model.intercept_[0]),
                'classes': self.logistic_model.classes_.tolist()
            },
            'random_forest_classifier': {
                'n_estimators': self.random_forest_classifier.n_estimators,
                'feature_importances': self.random_forest_classifier.feature_importances_.tolist(),
                'max_depth': self.random_forest_classifier.max_depth
            },
            'gradient_boosting_classifier': {
                'n_estimators': self.gradient_boosting_classifier.n_estimators,
                'learning_rate': float(self.gradient_boosting_classifier.learning_rate),
                'max_depth': self.gradient_boosting_classifier.max_depth
            },
            'random_forest_regressor': {
                'n_estimators': self.random_forest_regressor.n_estimators,
                'feature_importances': self.random_forest_regressor.feature_importances_.tolist(),
                'max_depth': self.random_forest_regressor.max_depth
            }
        }

        with open('ml_models/saved_models/model_parameters.json', 'w') as f:
            json.dump(params, f, indent=2)

        print("Model parameters exported successfully!")
        print(f"Parameters saved to: ml_models/saved_models/model_parameters.json")

    def _generate_visualizations(self, y_test, y_proba, feature_importance_df):
        print("\n=== Generating Visualizations ===")

        os.makedirs('ml_models/saved_models/visualizations', exist_ok=True)

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('Model Performance Analysis', fontsize=16, fontweight='bold')

        fpr, tpr, _ = roc_curve(y_test, y_proba)
        axes[0, 0].plot(fpr, tpr, 'b-', linewidth=2, label=f'ROC Curve (AUC={roc_auc_score(y_test, y_proba):.3f})')
        axes[0, 0].plot([0, 1], [0, 1], 'r--', linewidth=2, label='Random Classifier')
        axes[0, 0].set_xlabel('False Positive Rate')
        axes[0, 0].set_ylabel('True Positive Rate')
        axes[0, 0].set_title('ROC Curve')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)

        top_features = feature_importance_df.head(10)
        axes[0, 1].barh(top_features['feature'], top_features['importance'], color='steelblue')
        axes[0, 1].set_xlabel('Importance')
        axes[0, 1].set_title('Top 10 Feature Importances')
        axes[0, 1].invert_yaxis()

        prediction_dist = pd.Series(y_proba)
        axes[1, 0].hist(prediction_dist[y_test == 0], bins=20, alpha=0.6, label='Not At-Risk', color='green')
        axes[1, 0].hist(prediction_dist[y_test == 1], bins=20, alpha=0.6, label='At-Risk', color='red')
        axes[1, 0].set_xlabel('Predicted Probability')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].set_title('Prediction Distribution')
        axes[1, 0].legend()

        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(y_test, (y_proba > 0.5).astype(int))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[1, 1], cbar=False)
        axes[1, 1].set_xlabel('Predicted')
        axes[1, 1].set_ylabel('Actual')
        axes[1, 1].set_title('Confusion Matrix')

        plt.tight_layout()
        plt.savefig('ml_models/saved_models/visualizations/model_analysis.png', dpi=300, bbox_inches='tight')
        print("✓ Saved visualization to: ml_models/saved_models/visualizations/model_analysis.png")
        plt.close()

    def predict_performance(self, student_features: pd.DataFrame) -> dict:
        if self.logistic_model is None:
            self._load_models()

        X_scaled = self.scaler.transform(student_features)

        at_risk_prob = self.logistic_model.predict_proba(X_scaled)[:, 1]
        at_risk = self.logistic_model.predict(X_scaled)
        predicted_grade = self.random_forest_regressor.predict(X_scaled)

        feature_importance_dict = dict(zip(
            student_features.columns,
            self.random_forest_classifier.feature_importances_
        ))

        return {
            'predicted_grade': float(predicted_grade[0]),
            'at_risk': bool(at_risk[0]),
            'risk_probability': float(at_risk_prob[0]),
            'feature_importance': feature_importance_dict
        }

    def _load_models(self):
        self.logistic_model = joblib.load('ml_models/saved_models/logistic_model.pkl')
        self.random_forest_classifier = joblib.load('ml_models/saved_models/rf_classifier.pkl')
        self.gradient_boosting_classifier = joblib.load('ml_models/saved_models/gb_classifier.pkl')
        self.random_forest_regressor = joblib.load('ml_models/saved_models/rf_regressor.pkl')
        self.scaler = joblib.load('ml_models/saved_models/scaler.pkl')

if __name__ == "__main__":
    import os
    os.makedirs('ml_models/saved_models', exist_ok=True)

    predictor = PerformancePredictor()
    results = predictor.train_models()

    if results:
        print("\n" + "="*60)
        print("TRAINING COMPLETE - SUMMARY")
        print("="*60)
        for key, value in results.items():
            if isinstance(value, float):
                print(f"  {key}: {value:.4f}")
            else:
                print(f"  {key}: {value}")
        print("="*60)
