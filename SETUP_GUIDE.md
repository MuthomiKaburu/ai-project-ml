# Quick Setup Guide

## Getting Started in 5 Minutes

### Step 1: Configure Environment Variables

1. Create a `.env` file in the project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### Step 2: Populate Sample Data

1. Open your Supabase SQL Editor
2. Copy the contents of `seed_data.sql`
3. Run the SQL script to create 20 sample courses

### Step 3: Start the Application

```bash
npm install
npm run dev
```

The application will open at `http://localhost:5173`

### Step 4: Create Your First Account

1. Click "Sign up" on the login page
2. Enter your details:
   - Full Name
   - Email
   - Password (at least 6 characters)
3. Click "Create Account"

### Step 5: Complete Your Profile

1. After logging in, click the "Profile" tab
2. Fill in your information:
   - Major (e.g., "Computer Science")
   - Academic Level (Freshman/Sophomore/Junior/Senior/Graduate)
   - Current GPA (0.0 - 4.0)
3. If you have accessibility needs:
   - Check "I have accessibility needs or a disability"
   - Select your disability type
   - Specify preferred learning mode
   - Add any support requirements
4. Click "Save Profile"

### Step 6: Get Course Recommendations

1. Navigate to the "Recommendations" tab
2. The system will automatically analyze available courses
3. View your personalized recommendations with:
   - Match scores (percentage)
   - Predicted grades
   - Detailed reasoning
   - Course difficulty levels

### Step 7: Check Performance Predictions

1. Go to the "Performance" tab
2. Search for and select any course
3. View your predicted performance:
   - Predicted letter grade
   - At-risk status
   - Contributing factors
   - Personalized recommendations

## Adding Grade History (Optional)

For more accurate recommendations, you can add your grade history using SQL:

```sql
-- First, get your student ID
SELECT id FROM students WHERE email = 'your_email@example.com';

-- Then add grades (replace student_id and course_id values)
INSERT INTO grades (student_id, course_id, grade, grade_point, semester, year, attendance_rate)
VALUES
  ('your_student_id', (SELECT id FROM courses WHERE course_code = 'CS101'), 'A', 4.0, 'Fall', 2023, 95.0),
  ('your_student_id', (SELECT id FROM courses WHERE course_code = 'MATH101'), 'B+', 3.3, 'Fall', 2023, 92.0),
  ('your_student_id', (SELECT id FROM courses WHERE course_code = 'ENG101'), 'A-', 3.7, 'Fall', 2023, 98.0);
```

## Training ML Models (Advanced)

For production deployment with real data:

```bash
cd ml_models
pip install -r requirements.txt

# Ensure .env file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
python train_performance_models.py
python train_recommendation_models.py
```

The trained models will be saved in `ml_models/saved_models/`

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists in project root
- Verify variable names start with `VITE_`
- Restart the dev server after adding `.env`

### No recommendations appear
- Make sure you ran the seed_data.sql script
- Complete your student profile with GPA and major
- Try refreshing the page

### Authentication errors
- Verify your Supabase project is active
- Check that email authentication is enabled in Supabase
- Clear browser cache and try again

### Edge Function errors
- Ensure both Edge Functions are deployed
- Check Supabase logs for error details
- Verify your authentication token is valid

## Next Steps

1. **Explore the Dashboard**: Navigate through all three tabs to see different features
2. **Test Accessibility**: Try keyboard navigation and screen reader compatibility
3. **Add More Data**: Create additional test accounts or add more courses
4. **Review Recommendations**: Compare recommendations with different GPA values
5. **Train Models**: Use the Python scripts with your real data

## Support

If you encounter any issues:
1. Check the main README.md for detailed documentation
2. Review the troubleshooting section above
3. Check Supabase logs for error messages
4. Ensure all dependencies are installed correctly

## Important Notes

- The system uses Supabase authentication (email/password)
- All student data is protected with Row Level Security
- Recommendations update automatically as your profile changes
- ML models can be retrained with new data for improved accuracy
- The UI is fully accessible and WCAG-compliant

Enjoy using the AI-Based Course Recommendation System!
