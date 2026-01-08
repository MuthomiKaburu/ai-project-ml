# AI-Based Course Recommendation System

An intelligent course recommendation system that uses machine learning to help both regular and disabled students find suitable courses based on their academic performance, preferences, and accessibility needs.

## Features

### Machine Learning Models
- **Logistic Regression & Random Forest**: Predict student performance and identify at-risk students
- **K-Nearest Neighbors (KNN)**: Recommend courses based on similarity in grades, interests, and learning needs
- **Decision Trees**: Provide explainable recommendations suitable for academic advising

### Key Capabilities
- Personalized course recommendations with confidence scores
- Performance prediction for individual courses
- At-risk student identification
- Accessibility-focused recommendations for students with disabilities
- Explainable AI with detailed reasoning for each recommendation
- Support for multiple learning styles and interaction modes

### Accessibility Features
- WCAG-compliant UI with proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Disability profile management
- Course accessibility feature matching

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend
- Supabase for database and authentication
- Supabase Edge Functions for ML inference
- Python with scikit-learn for model training

### Machine Learning
- scikit-learn (Logistic Regression, Random Forest, KNN, Decision Trees)
- pandas & numpy for data processing
- joblib for model serialization

## Project Structure

```
├── ml_models/                    # Python ML training scripts
│   ├── data_preprocessing.py     # Data loading and preprocessing
│   ├── train_performance_models.py # Train performance prediction models
│   ├── train_recommendation_models.py # Train recommendation models
│   ├── requirements.txt          # Python dependencies
│   └── saved_models/             # Trained model files (generated)
├── supabase/
│   └── functions/                # Edge Functions for ML inference
│       ├── get-course-recommendations/
│       └── predict-performance/
├── src/
│   ├── components/
│   │   ├── Auth/                 # Authentication components
│   │   └── Dashboard/            # Main application components
│   ├── contexts/                 # React contexts
│   ├── lib/                      # Utility libraries
│   └── App.tsx                   # Main application component
├── seed_data.sql                 # Sample data for testing
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Supabase account

### 1. Database Setup

The database schema is already configured with the following tables:
- `students` - Student profiles and academic information
- `courses` - Available courses with difficulty and accessibility features
- `grades` - Student grade history
- `student_preferences` - Learning preferences and career interests
- `disabilities` - Accessibility needs and accommodations
- `course_recommendations` - Generated recommendations
- `performance_predictions` - Performance predictions

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Seed Sample Data

Run the seed data script in your Supabase SQL editor:

```bash
# Copy contents of seed_data.sql and run in Supabase SQL editor
```

### 5. Train Machine Learning Models (Optional)

For production use, train the ML models with real data:

```bash
cd ml_models
pip install -r requirements.txt

# Train performance prediction models
python train_performance_models.py

# Train recommendation models
python train_recommendation_models.py
```

Note: The Edge Functions include built-in inference logic, so training is optional for testing purposes.

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage Guide

### For Students

1. **Create an Account**
   - Sign up with email and password
   - Complete your student profile

2. **Update Your Profile**
   - Add your major, GPA, and academic level
   - Specify any disability or accessibility needs
   - Set learning preferences

3. **Get Recommendations**
   - Navigate to the Recommendations tab
   - View personalized course suggestions with:
     - Match scores
     - Predicted grades
     - Detailed reasoning
     - Risk assessments

4. **Predict Performance**
   - Go to the Performance tab
   - Select a course to see:
     - Predicted grade
     - At-risk status
     - Contributing factors
     - Personalized recommendations

### For Administrators

1. **Manage Courses**
   - Add courses through SQL or API
   - Include accessibility features
   - Set difficulty levels

2. **Monitor System**
   - Review recommendation accuracy
   - Track at-risk students
   - Analyze prediction confidence

3. **Retrain Models**
   - Periodically retrain with new data
   - Evaluate model performance
   - Export updated parameters

## Data Model

### Student Features Used
- Current GPA
- Academic level
- Major
- Grade history
- Attendance rates
- Disability status
- Accessibility needs
- Learning style preferences

### Course Features Used
- Difficulty level (1-5 scale)
- Department
- Credits
- Prerequisites
- Accessibility features
- Supported learning styles

### Recommendation Scoring
- KNN similarity score (0-1)
- Decision tree classification (0-1)
- Ensemble average for final recommendation
- Predicted grade point (0-4.0)
- Risk level (Low/Medium/High)

## Machine Learning Details

### Performance Prediction Models

**Logistic Regression**
- Binary classification for at-risk prediction
- Features: GPA, course difficulty, attendance, disability status
- Output: At-risk probability

**Random Forest**
- Classifier for at-risk identification
- Regressor for grade prediction
- Handles non-linear relationships
- Provides feature importance

### Recommendation Models

**K-Nearest Neighbors**
- Finds similar student profiles
- Recommends based on success patterns
- Weighted by similarity distance
- Accounts for GPA and grade history

**Decision Tree**
- Explainable recommendations
- Clear if-then rules
- Easy to interpret for advising
- Maximum depth of 5 for simplicity

### Model Performance Metrics
- Accuracy: Correct prediction rate
- Precision/Recall: At-risk identification quality
- RMSE: Grade prediction error
- R² Score: Variance explained
- Cross-validation: Generalization ability

## Accessibility Considerations

### Disability Types Supported
- Visual impairments
- Hearing impairments
- Mobility limitations
- Learning disabilities
- Other accessibility needs

### Accommodations
- Course difficulty adjustments
- Learning style matching
- Accessibility feature matching
- Support requirement tracking
- Interaction mode preferences

### UI Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Focus management
- High contrast support
- Screen reader announcements

## API Endpoints

### Get Course Recommendations
```
GET /functions/v1/get-course-recommendations
Authorization: Bearer {access_token}
```

Returns personalized course recommendations for the authenticated student.

### Predict Performance
```
POST /functions/v1/predict-performance
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "courseId": "uuid"
}
```

Returns predicted performance for a specific course.

## Development

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Future Enhancements

- Deep learning models (Neural Networks)
- Natural Language Processing for course descriptions
- Collaborative filtering recommendations
- Real-time performance monitoring
- Mobile application
- Integration with Learning Management Systems
- Sentiment analysis of course reviews
- Career path recommendations
- Degree completion planning
- Peer study group matching

## Security Considerations

- Row Level Security (RLS) enabled on all tables
- Students can only access their own data
- JWT-based authentication
- Secure Edge Function endpoints
- Input validation and sanitization
- No sensitive data in client-side code

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists with correct values
- Restart the development server

### "No recommendations available"
- Add course data using seed_data.sql
- Complete student profile
- Add some grade history

### ML model performance issues
- Train models with more data
- Adjust hyperparameters
- Check data quality

### Authentication errors
- Clear browser cache and cookies
- Check Supabase project status
- Verify authentication is enabled

## License

MIT License

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Supabase for backend infrastructure
- scikit-learn for ML algorithms
- React team for the frontend framework
- All contributors and testers
