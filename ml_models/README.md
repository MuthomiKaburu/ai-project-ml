# AI Course Recommendation System - Machine Learning Models

This directory contains Python scripts for training machine learning models used in the course recommendation system.

## Models Implemented

### 1. Performance Prediction Models
- **Logistic Regression**: Binary classification for identifying at-risk students
- **Random Forest Classifier**: Multi-class classification for risk assessment
- **Random Forest Regressor**: Predicting numerical grade outcomes

### 2. Recommendation Models
- **K-Nearest Neighbors (KNN)**: Recommends courses based on similarity to successful student profiles
- **Decision Tree**: Provides explainable recommendations with clear decision paths

## Setup Instructions

### 1. Install Dependencies

```bash
cd ml_models
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Prepare Training Data

Ensure your Supabase database contains sufficient data in the following tables:
- `students` (at least 10+ records)
- `courses` (at least 20+ records)
- `grades` (at least 50+ records)
- `student_preferences`
- `disabilities`

### 4. Train Models

#### Train Performance Prediction Models
```bash
python train_performance_models.py
```

This will:
- Train Logistic Regression and Random Forest models
- Evaluate model performance
- Save trained models to `saved_models/` directory
- Export model parameters for Edge Functions

#### Train Recommendation Models
```bash
python train_recommendation_models.py
```

This will:
- Train KNN and Decision Tree models
- Generate explainable decision rules
- Save trained models to `saved_models/` directory
- Export model parameters for Edge Functions

## Model Files

After training, the following files will be created in `saved_models/`:

- `logistic_model.pkl` - Trained Logistic Regression model
- `rf_classifier.pkl` - Random Forest Classifier
- `rf_regressor.pkl` - Random Forest Regressor
- `knn_model.pkl` - K-Nearest Neighbors model
- `decision_tree_model.pkl` - Decision Tree model
- `nearest_neighbors.pkl` - Nearest Neighbors for similarity search
- `model_parameters.json` - Exported parameters for performance models
- `recommendation_parameters.json` - Exported parameters for recommendation models

## Model Performance Metrics

### Performance Prediction
- **Accuracy**: Percentage of correct at-risk predictions
- **Precision**: Of predicted at-risk students, how many actually are at risk
- **Recall**: Of actual at-risk students, how many were identified
- **F1-Score**: Harmonic mean of precision and recall
- **RMSE**: Root Mean Square Error for grade predictions
- **R² Score**: Variance explained by the model

### Course Recommendations
- **Accuracy**: Percentage of correct recommendations
- **Cross-validation Score**: Average performance across different data splits
- **Feature Importance**: Which factors most influence recommendations

## Integration with Edge Functions

The trained models are exported in two ways:

1. **Pickle Files**: Full models for local Python inference
2. **JSON Parameters**: Lightweight parameters for Edge Function inference

Edge Functions use simplified inference logic based on the trained model parameters, enabling fast recommendations without loading full scikit-learn models.

## Retraining Models

Models should be retrained periodically as new data becomes available:

1. **Weekly**: For active systems with frequent enrollment changes
2. **Monthly**: For stable systems with consistent patterns
3. **Per Semester**: At minimum, retrain before each academic term

## Accessibility Considerations

The models incorporate disability-related features:
- `has_disability` flag
- Accessibility needs from student profile
- Course accessibility features
- Preferred learning styles and interaction modes

These features ensure recommendations are appropriate for all students, including those with disabilities.

## Model Interpretability

### Decision Trees
Decision trees provide explainable recommendations through:
- Clear if-then rules
- Feature importance rankings
- Decision path visualization

### Feature Importance
Key features influencing recommendations:
1. Student GPA
2. Course difficulty level
3. Previous grade averages
4. Attendance rates
5. Disability accommodations

## Troubleshooting

### "Not enough data to train models"
- Ensure database has sufficient records
- Run data seeding script to populate sample data

### Import errors
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check Python version (requires Python 3.8+)

### Model performance is poor
- Check data quality and completeness
- Increase training data size
- Adjust hyperparameters in training scripts
- Consider feature engineering

## Future Enhancements

- Deep learning models (Neural Networks)
- Natural Language Processing for course descriptions
- Collaborative filtering for peer recommendations
- Reinforcement learning for adaptive recommendations
- Time-series analysis for grade trends
