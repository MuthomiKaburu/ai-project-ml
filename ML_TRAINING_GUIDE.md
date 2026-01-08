# Complete Machine Learning Training Guide

## Overview

This guide provides step-by-step instructions to train the AI course recommendation system to its full potential using synthetic educational data. The system will be trained with realistic student and course data to maximize model accuracy and performance.

## What You'll Build

After following this guide, you'll have:
- 200 realistic student profiles
- 1000+ grade records
- Trained Logistic Regression, Random Forest, Gradient Boosting, and KNN models
- Performance prediction models with ROC-AUC > 0.80
- Course recommendation models with F1-Scores > 0.75
- Generated visualizations of model performance
- Production-ready model parameters

## Prerequisites

1. Python 3.8+ installed
2. Supabase project with database schema created
3. `.env` file configured with:
   ```
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```
4. Courses already seeded (run `seed_data.sql`)

## Complete Setup - Step by Step

### Step 1: Install Python Dependencies

```bash
cd ml_models
pip install -r requirements.txt
```

Expected packages:
- numpy==1.24.3
- pandas==2.0.3
- scikit-learn==1.3.0
- supabase==1.0.4
- python-dotenv==1.0.0
- joblib==1.3.2
- matplotlib==3.7.2
- seaborn==0.12.2

### Step 2: Prepare Your Environment

Create/verify your `.env` file in the project root:

```bash
# .env file
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Generate Training Dataset

This creates 200 realistic student profiles with grades and preferences:

```bash
python generate_dataset.py
```

**What it does:**
- Creates 200 student profiles with realistic GPAs
- Generates 1000+ grade records across different semesters
- Creates student learning preferences
- Adds disability accommodations for 50% of students
- Adds everything to your Supabase database

**Expected Output:**
```
============================================================
GENERATING COMPREHENSIVE EDUCATIONAL DATASET
============================================================

Generated 200 student profiles
✓ Inserted 200 students
Progress: 50/200
Progress: 100/200
Progress: 150/200
Progress: 200/200
✓ Inserted 1050 grades
✓ Inserted 200 preference records
✓ Inserted 98 disability records

============================================================
DATASET GENERATION COMPLETE
============================================================
```

### Step 4: Train Performance Prediction Models

This trains models to predict student performance and identify at-risk students:

```bash
python train_performance_models.py
```

**Models Trained:**
1. **Logistic Regression** - Binary classification for at-risk students
2. **Random Forest Classifier** - Robust at-risk prediction (200 trees)
3. **Gradient Boosting Classifier** - Advanced ensemble method
4. **Random Forest Regressor** - Grade point prediction

**Metrics Evaluated:**
- Accuracy
- Precision & Recall
- F1-Score
- ROC-AUC
- Cross-Validation Scores
- Confusion Matrices
- Feature Importance

**Expected Results:**
- Random Forest Accuracy: 0.82-0.88
- ROC-AUC: 0.85-0.92
- RMSE (Grade Prediction): 0.35-0.45
- R² Score (Grade Prediction): 0.65-0.75

**Output Files Generated:**
- `ml_models/saved_models/logistic_model.pkl`
- `ml_models/saved_models/rf_classifier.pkl`
- `ml_models/saved_models/gb_classifier.pkl`
- `ml_models/saved_models/rf_regressor.pkl`
- `ml_models/saved_models/scaler.pkl`
- `ml_models/saved_models/model_parameters.json`
- `ml_models/saved_models/visualizations/model_analysis.png`

### Step 5: Train Course Recommendation Models

This trains models to recommend suitable courses:

```bash
python train_recommendation_models.py
```

**Models Trained:**
1. **K-Nearest Neighbors** - Similarity-based recommendations
2. **Decision Tree** - Explainable recommendations
3. **Random Forest** - Ensemble recommendations (150 trees)
4. **AdaBoost** - Boosted classifier
5. **Nearest Neighbors** - For similarity search

**Metrics Evaluated:**
- Accuracy
- F1-Score
- ROC-AUC
- Cross-Validation Scores
- Feature Importances
- Decision Tree Rules

**Expected Results:**
- Random Forest Accuracy: 0.78-0.85
- F1-Score: 0.75-0.82
- ROC-AUC: 0.82-0.90
- Decision Tree (Explainability): Maximum depth 8 with clear rules

**Output Files Generated:**
- `ml_models/saved_models/knn_model.pkl`
- `ml_models/saved_models/decision_tree_model.pkl`
- `ml_models/saved_models/random_forest_model.pkl`
- `ml_models/saved_models/adaboost_model.pkl`
- `ml_models/saved_models/nearest_neighbors.pkl`
- `ml_models/saved_models/recommendation_scaler.pkl`
- `ml_models/saved_models/recommendation_parameters.json`
- `ml_models/saved_models/visualizations/recommendation_analysis.png`

### Step 6: Review Model Performance

Check the generated visualizations:

```bash
# View model analysis charts
open ml_models/saved_models/visualizations/model_analysis.png
open ml_models/saved_models/visualizations/recommendation_analysis.png
```

These show:
- ROC Curves for all models
- Feature Importance Rankings
- Prediction Distributions
- Confusion Matrices

### Step 7: Export Models to Edge Functions

The models are automatically exported as:
1. **Pickle files** - Full models for local Python inference
2. **JSON parameters** - Lightweight parameters for TypeScript Edge Functions

The Edge Functions already use these parameters for fast inference!

## Complete Command Sequence

Run all training steps in order:

```bash
cd ml_models

# Step 1: Generate data
python generate_dataset.py

# Step 2: Train performance models
python train_performance_models.py

# Step 3: Train recommendation models
python train_recommendation_models.py

cd ..

# Step 4: Rebuild the frontend
npm run build

# Step 5: Start your app
npm run dev
```

## Understanding the Model Files

### Saved Models Directory Structure

```
ml_models/saved_models/
├── logistic_model.pkl              # Performance prediction (at-risk)
├── rf_classifier.pkl               # Random Forest classifier
├── gb_classifier.pkl               # Gradient Boosting classifier
├── rf_regressor.pkl                # Grade point prediction
├── scaler.pkl                      # Feature scaler for performance
├── knn_model.pkl                   # K-Nearest Neighbors
├── decision_tree_model.pkl         # Explainable recommendations
├── random_forest_model.pkl         # Ensemble recommendations
├── adaboost_model.pkl              # Boosted classifier
├── nearest_neighbors.pkl           # Similarity search
├── recommendation_scaler.pkl       # Feature scaler for recommendations
├── model_parameters.json           # Performance model parameters for Edge Functions
├── recommendation_parameters.json  # Recommendation parameters for Edge Functions
└── visualizations/
    ├── model_analysis.png          # Performance model charts
    └── recommendation_analysis.png # Recommendation model charts
```

### What Each File Does

| File | Purpose | Usage |
|------|---------|-------|
| `logistic_model.pkl` | Binary classification | Predict if student is at-risk |
| `rf_classifier.pkl` | Classification ensemble | Robust at-risk prediction |
| `gb_classifier.pkl` | Gradient boosting | Advanced at-risk classification |
| `rf_regressor.pkl` | Regression ensemble | Predict numeric grade points |
| `scaler.pkl` | Feature normalization | Scale features before prediction |
| `knn_model.pkl` | Similarity-based | Recommend courses by similarity |
| `decision_tree_model.pkl` | Explainable | Human-readable recommendations |
| `random_forest_model.pkl` | Ensemble | Best course recommendations |
| `adaboost_model.pkl` | Boosted | Alternative ensemble method |
| `nearest_neighbors.pkl` | Similarity search | Find similar students |
| Model JSON files | Parameter export | Used by Edge Functions |
| PNG visualizations | Performance charts | Evaluate model quality |

## Interpreting Performance Metrics

### Accuracy
- **Range:** 0.0 - 1.0
- **Interpretation:** Percentage of correct predictions
- **Target:** > 0.80 for production

### Precision & Recall
- **Precision:** Of predicted at-risk, how many were actually at-risk
- **Recall:** Of actual at-risk, how many were identified
- **Trade-off:** Higher recall catches more at-risk students but may have false positives

### F1-Score
- **Definition:** Harmonic mean of precision and recall
- **Range:** 0.0 - 1.0
- **Target:** > 0.75 for balanced performance

### ROC-AUC
- **Range:** 0.5 - 1.0 (0.5 = random, 1.0 = perfect)
- **Interpretation:** Model's ability to distinguish classes
- **Target:** > 0.80 for good discrimination

### RMSE (Root Mean Square Error)
- **Definition:** Standard deviation of prediction errors
- **Range:** 0.0 - 4.0 (GPA scale)
- **Target:** < 0.50 for grade prediction

### R² Score
- **Range:** 0.0 - 1.0
- **Interpretation:** Proportion of variance explained
- **Target:** > 0.60 for meaningful predictions

## Customizing the Training

### Adjust Dataset Size

Edit `ml_models/generate_dataset.py`:

```python
if __name__ == "__main__":
    generator = DatasetGenerator()
    # Change 200 to desired number of students
    generator.seed_all_data(student_count=500)
```

### Tune Model Hyperparameters

Edit `ml_models/train_performance_models.py`:

```python
# Random Forest Classifier - try different values
self.random_forest_classifier = RandomForestClassifier(
    n_estimators=300,      # More trees = better but slower
    max_depth=20,          # Deeper = more complex patterns
    min_samples_split=3,   # Fewer = more branches
    min_samples_leaf=1,    # Fewer = more leaves
    random_state=42,
    class_weight='balanced'
)
```

## Troubleshooting

### "Not enough data to train models"
**Solution:** Run `generate_dataset.py` first to create training data

### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
**Solution:** Check `.env` file has these variables

### "No courses found in database"
**Solution:** Run `seed_data.sql` first to populate courses

### Model performance is poor
**Solutions:**
1. Generate more data: `generator.seed_all_data(student_count=500)`
2. Tune hyperparameters based on target metrics
3. Review feature engineering in `data_preprocessing.py`
4. Check data quality and distribution

### Pickle file too large
**Solution:** This is normal. Models can be 10-50MB. They won't be used by frontend (uses JSON parameters).

## Model Versioning

After training, create a version file:

```bash
mkdir -p ml_models/saved_models/v1.0
cp ml_models/saved_models/*.pkl ml_models/saved_models/v1.0/
cp ml_models/saved_models/*.json ml_models/saved_models/v1.0/
```

This helps track model versions over time.

## Production Deployment

1. **Train models** with production data
2. **Export model parameters** to JSON files
3. **Update Edge Functions** if needed
4. **Deploy** to Supabase Edge Functions
5. **Monitor** model performance and accuracy

## Advanced: Retraining Schedule

For production systems:

- **Weekly:** For systems with frequent changes
- **Monthly:** For stable systems
- **Per Semester:** Minimum recommended frequency
- **After Major Data Collection:** Whenever you have significant new data

## Next Steps

1. Run the complete training pipeline
2. Review generated visualizations
3. Test recommendations with different student profiles
4. Adjust hyperparameters based on your requirements
5. Deploy models to production
6. Monitor performance over time
7. Plan retraining schedule

## Support & Documentation

- Training scripts: `ml_models/train_*.py`
- Data preprocessing: `ml_models/data_preprocessing.py`
- Dataset generation: `ml_models/generate_dataset.py`
- Model parameters: `ml_models/saved_models/*.json`
- Main documentation: `README.md`
