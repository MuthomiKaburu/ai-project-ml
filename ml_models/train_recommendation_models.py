import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier, NearestNeighbors
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix, f1_score
from sklearn.preprocessing import StandardScaler
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
import os
from typing import Dict
from data_preprocessing import DataPreprocessor

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

class CourseRecommender:
    def __init__(self):
        self.preprocessor = DataPreprocessor()
        self.knn_model = None
        self.decision_tree_model = None
        self.random_forest_model = None
        self.adaboost_model = None
        self.nearest_neighbors = None
        self.scaler = StandardScaler()

    def train_models(self):
        print("Fetching data from Supabase...")
        data = self.preprocessor.fetch_all_data()

        print("Preparing recommendation training data...")
        training_data = self._prepare_training_data(data)

        if len(training_data) < 10:
            print("Not enough data to train models. Need at least 10 samples.")
            return

        X = training_data[['student_gpa', 'course_difficulty', 'has_disability',
                           'credits', 'avg_previous_grade']]
        y = training_data['success']

        X_scaled = self.scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        print("\n" + "="*60)
        print("TRAINING COURSE RECOMMENDATION MODELS")
        print("="*60)

        print("\n=== Training K-Nearest Neighbors ===")
        self.knn_model = KNeighborsClassifier(
            n_neighbors=min(5, len(X_train) // 2),
            weights='distance',
            metric='euclidean',
            leaf_size=30
        )
        self.knn_model.fit(X_train, y_train)

        y_pred_knn = self.knn_model.predict(X_test)
        y_proba_knn = self.knn_model.predict_proba(X_test)[:, 1]

        accuracy_knn = accuracy_score(y_test, y_pred_knn)
        f1_knn = f1_score(y_test, y_pred_knn)
        roc_auc_knn = roc_auc_score(y_test, y_proba_knn)

        print(f"KNN Results:")
        print(f"  Accuracy: {accuracy_knn:.4f}")
        print(f"  F1-Score: {f1_knn:.4f}")
        print(f"  ROC-AUC: {roc_auc_knn:.4f}")

        cv_scores_knn = cross_val_score(self.knn_model, X_train, y_train, cv=5, scoring='f1')
        print(f"  Cross-Val Mean: {cv_scores_knn.mean():.4f} (+/- {cv_scores_knn.std():.4f})")

        print("\n=== Training Decision Tree ===")
        self.decision_tree_model = DecisionTreeClassifier(
            max_depth=8,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )
        self.decision_tree_model.fit(X_train, y_train)

        y_pred_dt = self.decision_tree_model.predict(X_test)
        y_proba_dt = self.decision_tree_model.predict_proba(X_test)[:, 1]

        accuracy_dt = accuracy_score(y_test, y_pred_dt)
        f1_dt = f1_score(y_test, y_pred_dt)
        roc_auc_dt = roc_auc_score(y_test, y_proba_dt)

        print(f"Decision Tree Results:")
        print(f"  Accuracy: {accuracy_dt:.4f}")
        print(f"  F1-Score: {f1_dt:.4f}")
        print(f"  ROC-AUC: {roc_auc_dt:.4f}")

        cv_scores_dt = cross_val_score(self.decision_tree_model, X_train, y_train, cv=5, scoring='f1')
        print(f"  Cross-Val Mean: {cv_scores_dt.mean():.4f} (+/- {cv_scores_dt.std():.4f})")

        print("\n=== Decision Tree Rules (Top 30 lines) ===")
        tree_rules = export_text(self.decision_tree_model, feature_names=['GPA', 'Difficulty', 'Disability', 'Credits', 'Avg Grade'])
        print(tree_rules[:1000])

        print("\n=== Training Random Forest Classifier ===")
        self.random_forest_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced',
            n_jobs=-1
        )
        self.random_forest_model.fit(X_train, y_train)

        y_pred_rf = self.random_forest_model.predict(X_test)
        y_proba_rf = self.random_forest_model.predict_proba(X_test)[:, 1]

        accuracy_rf = accuracy_score(y_test, y_pred_rf)
        f1_rf = f1_score(y_test, y_pred_rf)
        roc_auc_rf = roc_auc_score(y_test, y_proba_rf)

        print(f"Random Forest Results:")
        print(f"  Accuracy: {accuracy_rf:.4f}")
        print(f"  F1-Score: {f1_rf:.4f}")
        print(f"  ROC-AUC: {roc_auc_rf:.4f}")

        print("\n=== Training AdaBoost Classifier ===")
        self.adaboost_model = AdaBoostClassifier(
            n_estimators=100,
            learning_rate=0.1,
            random_state=42
        )
        self.adaboost_model.fit(X_train, y_train)

        y_pred_ada = self.adaboost_model.predict(X_test)
        y_proba_ada = self.adaboost_model.predict_proba(X_test)[:, 1]

        accuracy_ada = accuracy_score(y_test, y_pred_ada)
        f1_ada = f1_score(y_test, y_pred_ada)
        roc_auc_ada = roc_auc_score(y_test, y_proba_ada)

        print(f"AdaBoost Results:")
        print(f"  Accuracy: {accuracy_ada:.4f}")
        print(f"  F1-Score: {f1_ada:.4f}")
        print(f"  ROC-AUC: {roc_auc_ada:.4f}")

        print("\n=== Training Nearest Neighbors for Similarity ===")
        self.nearest_neighbors = NearestNeighbors(
            n_neighbors=min(10, len(X_train) - 1),
            metric='euclidean'
        )
        self.nearest_neighbors.fit(X_train)
        print("✓ Nearest Neighbors model trained")

        print("\n=== Feature Importance Analysis ===")
        feature_names = ['GPA', 'Difficulty', 'Disability', 'Credits', 'Avg Grade']
        feature_importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': self.random_forest_model.feature_importances_
        }).sort_values('importance', ascending=False)
        print(feature_importance_df.to_string(index=False))

        print("\n=== Confusion Matrices ===")
        print("Decision Tree:")
        cm_dt = confusion_matrix(y_test, y_pred_dt)
        print(f"  TN: {cm_dt[0,0]}, FP: {cm_dt[0,1]}, FN: {cm_dt[1,0]}, TP: {cm_dt[1,1]}")

        print("Random Forest:")
        cm_rf = confusion_matrix(y_test, y_pred_rf)
        print(f"  TN: {cm_rf[0,0]}, FP: {cm_rf[0,1]}, FN: {cm_rf[1,0]}, TP: {cm_rf[1,1]}")

        self._save_models()
        self._export_model_parameters(tree_rules, feature_names)
        self._generate_visualizations(y_test, y_proba_rf, y_proba_dt, feature_importance_df)

        return {
            'knn_accuracy': float(accuracy_knn),
            'knn_f1': float(f1_knn),
            'knn_roc_auc': float(roc_auc_knn),
            'decision_tree_accuracy': float(accuracy_dt),
            'decision_tree_f1': float(f1_dt),
            'decision_tree_roc_auc': float(roc_auc_dt),
            'random_forest_accuracy': float(accuracy_rf),
            'random_forest_f1': float(f1_rf),
            'random_forest_roc_auc': float(roc_auc_rf),
            'adaboost_accuracy': float(accuracy_ada),
            'adaboost_f1': float(f1_ada),
            'adaboost_roc_auc': float(roc_auc_ada),
            'samples_used': len(training_data),
            'train_size': len(X_train),
            'test_size': len(X_test)
        }

    def _prepare_training_data(self, data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        grades_df = data['grades'].copy()
        students_df = data['students'].copy()
        courses_df = data['courses'].copy()

        merged = grades_df.merge(students_df, left_on='student_id', right_on='id', suffixes=('', '_student'))
        merged = merged.merge(courses_df, left_on='course_id', right_on='id', suffixes=('', '_course'))

        student_avg_grades = grades_df.groupby('student_id')['grade_point'].transform('mean')

        training_data = pd.DataFrame({
            'student_id': merged['student_id'],
            'course_id': merged['course_id'],
            'student_gpa': merged['current_gpa'],
            'course_difficulty': merged['difficulty_level'],
            'has_disability': merged['has_disability'].astype(int),
            'credits': merged['credits'],
            'avg_previous_grade': student_avg_grades,
            'actual_grade': merged['grade_point'],
            'success': (merged['grade_point'] >= 2.5).astype(int)
        })

        return training_data

    def _save_models(self):
        print("\n=== Saving Models ===")
        joblib.dump(self.knn_model, 'ml_models/saved_models/knn_model.pkl')
        joblib.dump(self.decision_tree_model, 'ml_models/saved_models/decision_tree_model.pkl')
        joblib.dump(self.random_forest_model, 'ml_models/saved_models/random_forest_model.pkl')
        joblib.dump(self.adaboost_model, 'ml_models/saved_models/adaboost_model.pkl')
        joblib.dump(self.nearest_neighbors, 'ml_models/saved_models/nearest_neighbors.pkl')
        joblib.dump(self.scaler, 'ml_models/saved_models/recommendation_scaler.pkl')
        print("All models saved successfully!")

    def _export_model_parameters(self, tree_rules: str, feature_names: list):
        print("\n=== Exporting Model Parameters for Edge Functions ===")

        params = {
            'metadata': {
                'model_version': '2.0',
                'feature_names': feature_names,
                'trained_at': pd.Timestamp.now().isoformat()
            },
            'knn': {
                'n_neighbors': self.knn_model.n_neighbors,
                'weights': self.knn_model.weights,
                'metric': self.knn_model.metric
            },
            'decision_tree': {
                'max_depth': self.decision_tree_model.max_depth,
                'n_features': self.decision_tree_model.n_features_in_,
                'n_classes': self.decision_tree_model.n_classes_,
                'feature_importances': self.decision_tree_model.feature_importances_.tolist(),
                'feature_names': feature_names,
                'tree_rules': tree_rules[:2000]
            },
            'random_forest': {
                'n_estimators': self.random_forest_model.n_estimators,
                'feature_importances': self.random_forest_model.feature_importances_.tolist(),
                'max_depth': self.random_forest_model.max_depth
            },
            'adaboost': {
                'n_estimators': self.adaboost_model.n_estimators,
                'learning_rate': float(self.adaboost_model.learning_rate)
            }
        }

        with open('ml_models/saved_models/recommendation_parameters.json', 'w') as f:
            json.dump(params, f, indent=2, cls=NpEncoder)

        print("Recommendation model parameters exported successfully!")
        print(f"Parameters saved to: ml_models/saved_models/recommendation_parameters.json")

    def _generate_visualizations(self, y_test, y_proba_rf, y_proba_dt, feature_importance_df):
        print("\n=== Generating Visualizations ===")

        os.makedirs('ml_models/saved_models/visualizations', exist_ok=True)

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('Course Recommendation Model Performance', fontsize=16, fontweight='bold')

        from sklearn.metrics import roc_curve, auc
        fpr_rf, tpr_rf, _ = roc_curve(y_test, y_proba_rf)
        fpr_dt, tpr_dt, _ = roc_curve(y_test, y_proba_dt)

        axes[0, 0].plot(fpr_rf, tpr_rf, 'b-', linewidth=2, label=f'Random Forest (AUC={auc(fpr_rf, tpr_rf):.3f})')
        axes[0, 0].plot(fpr_dt, tpr_dt, 'g-', linewidth=2, label=f'Decision Tree (AUC={auc(fpr_dt, tpr_dt):.3f})')
        axes[0, 0].plot([0, 1], [0, 1], 'r--', linewidth=2, label='Random')
        axes[0, 0].set_xlabel('False Positive Rate')
        axes[0, 0].set_ylabel('True Positive Rate')
        axes[0, 0].set_title('ROC Curves')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)

        top_features = feature_importance_df.head(5)
        axes[0, 1].barh(top_features['feature'], top_features['importance'], color='steelblue')
        axes[0, 1].set_xlabel('Importance')
        axes[0, 1].set_title('Feature Importances')
        axes[0, 1].invert_yaxis()

        axes[1, 0].hist(y_proba_rf[y_test == 0], bins=20, alpha=0.6, label='Not Recommended', color='green')
        axes[1, 0].hist(y_proba_rf[y_test == 1], bins=20, alpha=0.6, label='Recommended', color='red')
        axes[1, 0].set_xlabel('Predicted Probability')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].set_title('Prediction Distribution')
        axes[1, 0].legend()

        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(y_test, (y_proba_rf > 0.5).astype(int))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[1, 1], cbar=False)
        axes[1, 1].set_xlabel('Predicted')
        axes[1, 1].set_ylabel('Actual')
        axes[1, 1].set_title('Confusion Matrix (Random Forest)')

        plt.tight_layout()
        plt.savefig('ml_models/saved_models/visualizations/recommendation_analysis.png', dpi=300, bbox_inches='tight')
        print("✓ Saved visualization to: ml_models/saved_models/visualizations/recommendation_analysis.png")
        plt.close()

    def _load_models(self):
        self.knn_model = joblib.load('ml_models/saved_models/knn_model.pkl')
        self.decision_tree_model = joblib.load('ml_models/saved_models/decision_tree_model.pkl')
        self.random_forest_model = joblib.load('ml_models/saved_models/random_forest_model.pkl')
        self.adaboost_model = joblib.load('ml_models/saved_models/adaboost_model.pkl')
        self.nearest_neighbors = joblib.load('ml_models/saved_models/nearest_neighbors.pkl')
        self.scaler = joblib.load('ml_models/saved_models/recommendation_scaler.pkl')

if __name__ == "__main__":
    os.makedirs('ml_models/saved_models', exist_ok=True)

    recommender = CourseRecommender()
    results = recommender.train_models()

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
