/*
  # Course Recommendation System Schema

  ## Overview
  This migration creates the complete database schema for an AI-based course recommendation system
  that supports both regular and disabled students.

  ## New Tables

  ### 1. students
  - `id` (uuid, primary key) - Unique identifier linked to auth.users
  - `full_name` (text) - Student's full name
  - `email` (text) - Student email address
  - `current_gpa` (decimal) - Current cumulative GPA
  - `academic_level` (text) - Freshman, Sophomore, Junior, Senior, Graduate
  - `major` (text) - Student's major/program
  - `has_disability` (boolean) - Whether student has registered disability
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. disabilities
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - References students table
  - `disability_type` (text) - Visual, Hearing, Mobility, Learning, Other
  - `accessibility_needs` (jsonb) - Specific accessibility requirements
  - `preferred_interaction_mode` (text) - Preferred mode of learning
  - `support_requirements` (text) - Additional support needed
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. courses
  - `id` (uuid, primary key) - Unique identifier
  - `course_code` (text) - Course code (e.g., CS101)
  - `course_name` (text) - Full course name
  - `description` (text) - Course description
  - `credits` (integer) - Credit hours
  - `difficulty_level` (integer) - 1-5 scale
  - `department` (text) - Academic department
  - `prerequisites` (text[]) - Array of prerequisite course codes
  - `accessibility_features` (jsonb) - Available accessibility features
  - `learning_styles` (text[]) - Supported learning styles
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. grades
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - References students table
  - `course_id` (uuid, foreign key) - References courses table
  - `grade` (text) - Letter grade (A, A-, B+, etc.)
  - `grade_point` (decimal) - Numeric grade (4.0 scale)
  - `semester` (text) - Semester taken
  - `year` (integer) - Year taken
  - `attendance_rate` (decimal) - Attendance percentage
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. student_preferences
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - References students table
  - `career_interests` (text[]) - Array of career interests
  - `preferred_learning_styles` (text[]) - Visual, Auditory, Kinesthetic, Reading/Writing
  - `course_time_preferences` (text[]) - Morning, Afternoon, Evening
  - `preferred_course_formats` (text[]) - In-person, Online, Hybrid
  - `interests` (text[]) - General academic interests
  - `goals` (text) - Academic and career goals
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. course_recommendations
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - References students table
  - `course_id` (uuid, foreign key) - References courses table
  - `recommendation_score` (decimal) - Confidence score (0-1)
  - `model_type` (text) - KNN, DecisionTree, Ensemble
  - `reasoning` (jsonb) - Explanation for recommendation
  - `predicted_grade` (decimal) - Predicted performance
  - `risk_level` (text) - Low, Medium, High
  - `created_at` (timestamptz) - Recommendation timestamp

  ### 7. performance_predictions
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - References students table
  - `course_id` (uuid, foreign key) - References courses table
  - `predicted_grade_point` (decimal) - Predicted GPA for course
  - `confidence` (decimal) - Prediction confidence (0-1)
  - `at_risk` (boolean) - Whether student is at risk
  - `model_type` (text) - LogisticRegression, RandomForest
  - `factors` (jsonb) - Contributing factors
  - `created_at` (timestamptz) - Prediction timestamp

  ## Security
  - Enable RLS on all tables
  - Students can only access their own data
  - Public can read course information
  - Only authenticated users can create recommendations
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  current_gpa decimal(3,2) DEFAULT 0.00,
  academic_level text NOT NULL DEFAULT 'Freshman',
  major text,
  has_disability boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create disabilities table
CREATE TABLE IF NOT EXISTS disabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  disability_type text NOT NULL,
  accessibility_needs jsonb DEFAULT '{}'::jsonb,
  preferred_interaction_mode text,
  support_requirements text,
  created_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text UNIQUE NOT NULL,
  course_name text NOT NULL,
  description text,
  credits integer DEFAULT 3,
  difficulty_level integer CHECK (difficulty_level BETWEEN 1 AND 5),
  department text NOT NULL,
  prerequisites text[] DEFAULT ARRAY[]::text[],
  accessibility_features jsonb DEFAULT '{}'::jsonb,
  learning_styles text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  grade text NOT NULL,
  grade_point decimal(3,2) NOT NULL,
  semester text NOT NULL,
  year integer NOT NULL,
  attendance_rate decimal(5,2) DEFAULT 100.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id, semester, year)
);

-- Create student_preferences table
CREATE TABLE IF NOT EXISTS student_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE UNIQUE NOT NULL,
  career_interests text[] DEFAULT ARRAY[]::text[],
  preferred_learning_styles text[] DEFAULT ARRAY[]::text[],
  course_time_preferences text[] DEFAULT ARRAY[]::text[],
  preferred_course_formats text[] DEFAULT ARRAY[]::text[],
  interests text[] DEFAULT ARRAY[]::text[],
  goals text,
  updated_at timestamptz DEFAULT now()
);

-- Create course_recommendations table
CREATE TABLE IF NOT EXISTS course_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  recommendation_score decimal(3,2) NOT NULL,
  model_type text NOT NULL,
  reasoning jsonb DEFAULT '{}'::jsonb,
  predicted_grade decimal(3,2),
  risk_level text DEFAULT 'Low',
  created_at timestamptz DEFAULT now()
);

-- Create performance_predictions table
CREATE TABLE IF NOT EXISTS performance_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  predicted_grade_point decimal(3,2) NOT NULL,
  confidence decimal(3,2) NOT NULL,
  at_risk boolean DEFAULT false,
  model_type text NOT NULL,
  factors jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE disabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can insert own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for disabilities table
CREATE POLICY "Students can view own disability info"
  ON disabilities FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert own disability info"
  ON disabilities FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own disability info"
  ON disabilities FOR UPDATE
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- RLS Policies for courses table (public read)
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for grades table
CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert own grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- RLS Policies for student_preferences table
CREATE POLICY "Students can view own preferences"
  ON student_preferences FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert own preferences"
  ON student_preferences FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own preferences"
  ON student_preferences FOR UPDATE
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- RLS Policies for course_recommendations table
CREATE POLICY "Students can view own recommendations"
  ON course_recommendations FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "System can insert recommendations"
  ON course_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for performance_predictions table
CREATE POLICY "Students can view own predictions"
  ON performance_predictions FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "System can insert predictions"
  ON performance_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_disabilities_student_id ON disabilities(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_student_preferences_student_id ON student_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_course_recommendations_student_id ON course_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_student_id ON performance_predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level);