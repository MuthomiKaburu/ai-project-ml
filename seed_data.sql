-- Seed Data for Course Recommendation System
-- This script populates the database with sample data for testing

-- Insert sample courses
INSERT INTO courses (course_code, course_name, description, credits, difficulty_level, department, prerequisites, accessibility_features, learning_styles) VALUES
('CS101', 'Introduction to Programming', 'Learn the fundamentals of programming using Python. Covers variables, data types, control structures, and basic algorithms.', 3, 1, 'Computer Science', ARRAY[]::text[], '{"closed_captions": true, "screen_reader_compatible": true, "visual_aids": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('CS102', 'Data Structures', 'Study of fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs.', 4, 3, 'Computer Science', ARRAY['CS101'], '{"closed_captions": true, "extended_time": true}'::jsonb, ARRAY['Visual', 'Reading/Writing']),
('CS201', 'Algorithms', 'Analysis and design of computer algorithms. Topics include sorting, searching, dynamic programming, and graph algorithms.', 4, 4, 'Computer Science', ARRAY['CS102'], '{"closed_captions": true, "collaborative_options": true}'::jsonb, ARRAY['Visual', 'Auditory']),
('CS220', 'Database Systems', 'Introduction to database design, SQL, normalization, and database management systems.', 3, 3, 'Computer Science', ARRAY['CS101'], '{"screen_reader_compatible": true, "hands_on_labs": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('MATH101', 'Calculus I', 'Limits, derivatives, and applications. Introduction to integral calculus.', 4, 3, 'Mathematics', ARRAY[]::text[], '{"extended_time": true, "note_taking_assistance": true}'::jsonb, ARRAY['Visual', 'Reading/Writing']),
('MATH201', 'Calculus II', 'Advanced integration techniques, sequences, series, and parametric equations.', 4, 4, 'Mathematics', ARRAY['MATH101'], '{"extended_time": true, "visual_aids": true}'::jsonb, ARRAY['Visual', 'Reading/Writing']),
('PHYS101', 'Physics I', 'Classical mechanics including kinematics, dynamics, energy, and momentum.', 4, 3, 'Physics', ARRAY[]::text[], '{"closed_captions": true, "lab_accommodations": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('ENG101', 'English Composition', 'Fundamentals of academic writing, including essay structure, argumentation, and research.', 3, 2, 'English', ARRAY[]::text[], '{"speech_to_text": true, "extended_time": true}'::jsonb, ARRAY['Reading/Writing', 'Auditory']),
('HIST101', 'World History', 'Survey of world history from ancient civilizations to the modern era.', 3, 2, 'History', ARRAY[]::text[], '{"audio_materials": true, "visual_timelines": true}'::jsonb, ARRAY['Auditory', 'Visual']),
('BIO101', 'Introduction to Biology', 'Fundamental concepts of biology including cell structure, genetics, evolution, and ecology.', 4, 2, 'Biology', ARRAY[]::text[], '{"lab_accommodations": true, "visual_aids": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('CS305', 'Operating Systems', 'Study of operating system concepts including process management, memory management, and file systems.', 4, 4, 'Computer Science', ARRAY['CS102'], '{"closed_captions": true, "hands_on_projects": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('CS310', 'Software Engineering', 'Principles and practices of software development including requirements analysis, design patterns, and testing.', 3, 3, 'Computer Science', ARRAY['CS102'], '{"collaborative_tools": true, "flexible_deadlines": true}'::jsonb, ARRAY['Visual', 'Reading/Writing']),
('MATH301', 'Linear Algebra', 'Study of vector spaces, linear transformations, matrices, and eigenvalues.', 3, 4, 'Mathematics', ARRAY['MATH101'], '{"visual_aids": true, "extended_time": true}'::jsonb, ARRAY['Visual', 'Reading/Writing']),
('CS405', 'Machine Learning', 'Introduction to machine learning algorithms including supervised and unsupervised learning, neural networks, and deep learning.', 4, 5, 'Computer Science', ARRAY['CS201', 'MATH301'], '{"accessible_datasets": true, "alternative_formats": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('CS420', 'Web Development', 'Modern web development using HTML, CSS, JavaScript, and frameworks. Covers frontend and backend development.', 3, 2, 'Computer Science', ARRAY['CS101'], '{"screen_reader_compatible": true, "hands_on_projects": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('PSYCH101', 'Introduction to Psychology', 'Survey of psychological principles including cognition, development, and social psychology.', 3, 2, 'Psychology', ARRAY[]::text[], '{"audio_lectures": true, "visual_aids": true}'::jsonb, ARRAY['Auditory', 'Visual']),
('ECON101', 'Microeconomics', 'Principles of microeconomics including supply and demand, market structures, and consumer behavior.', 3, 2, 'Economics', ARRAY[]::text[], '{"visual_graphs": true, "extended_time": true}'::jsonb, ARRAY['Visual', 'Reading/Writing']),
('ART101', 'Introduction to Art', 'Survey of art history and techniques including drawing, painting, and sculpture.', 3, 1, 'Art', ARRAY[]::text[], '{"tactile_materials": true, "visual_descriptions": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('CHEM101', 'General Chemistry', 'Introduction to chemical principles including atomic structure, bonding, and reactions.', 4, 3, 'Chemistry', ARRAY[]::text[], '{"lab_accommodations": true, "safety_equipment": true}'::jsonb, ARRAY['Visual', 'Kinesthetic']),
('PHIL101', 'Introduction to Philosophy', 'Survey of major philosophical questions and thinkers including ethics, metaphysics, and epistemology.', 3, 2, 'Philosophy', ARRAY[]::text[], '{"audio_materials": true, "discussion_alternatives": true}'::jsonb, ARRAY['Reading/Writing', 'Auditory'])
ON CONFLICT (course_code) DO NOTHING;

-- Note: Sample student data would require authentication setup first
-- Users should create accounts through the application

-- The following is a template for adding grades after students are created:
-- INSERT INTO grades (student_id, course_id, grade, grade_point, semester, year, attendance_rate)
-- SELECT s.id, c.id, 'A', 4.0, 'Fall', 2023, 95.0
-- FROM students s, courses c
-- WHERE s.email = 'student@example.com' AND c.course_code = 'CS101';

-- Instructions for testing:
-- 1. Create a test account through the application
-- 2. Update the student profile with GPA, major, and academic level
-- 3. Manually add some grades using SQL or through application features (to be implemented)
-- 4. Request course recommendations to see the ML models in action
