import numpy as np
import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import random
from datetime import datetime, timedelta

load_dotenv()

class DatasetGenerator:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not url or not key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

        self.supabase: Client = create_client(url, key)
        self.departments = ['Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Psychology', 'Economics', 'History', 'English', 'Art']
        self.academic_levels = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
        self.disabilities = [None, 'Visual', 'Hearing', 'Mobility', 'Learning']
        self.semesters = ['Fall', 'Spring', 'Summer']

    def generate_students(self, count: int = 200) -> list:
        """Generate realistic student profiles"""
        print(f"\nGenerating {count} student profiles...")
        students = []

        for i in range(count):
            level = random.choice(self.academic_levels)
            has_disability = random.choice([True, False])

            if level == 'Freshman':
                gpa_base = np.random.normal(2.8, 0.6)
            elif level == 'Sophomore':
                gpa_base = np.random.normal(3.0, 0.6)
            elif level == 'Junior':
                gpa_base = np.random.normal(3.1, 0.5)
            elif level == 'Senior':
                gpa_base = np.random.normal(3.2, 0.5)
            else:
                gpa_base = np.random.normal(3.5, 0.4)

            if has_disability:
                gpa_base -= np.random.uniform(0, 0.3)

            current_gpa = max(0, min(4.0, gpa_base))

            student = {
                'full_name': f'Student {i+1}',
                'email': f'student{i+1}@university.edu',
                'current_gpa': round(current_gpa, 2),
                'academic_level': level,
                'major': random.choice(self.departments),
                'has_disability': has_disability
            }
            students.append(student)

        return students

    def generate_grades(self, student_id: str, num_courses: int = 5) -> list:
        """Generate grade history for a student"""
        grades = []
        current_year = datetime.now().year

        for _ in range(num_courses):
            year = random.randint(current_year - 3, current_year)
            semester = random.choice(self.semesters)

            courses_response = self.supabase.table('courses').select('id').execute()
            if not courses_response.data:
                continue

            course_id = random.choice(courses_response.data)['id']

            gpa_influence = random.gauss(0, 0.5)
            grade_point = max(0, min(4.0, 3.0 + gpa_influence))

            attendance = random.uniform(75, 100)

            grade_map = {
                4.0: 'A',
                3.7: 'A-',
                3.3: 'B+',
                3.0: 'B',
                2.7: 'B-',
                2.3: 'C+',
                2.0: 'C',
                1.7: 'C-',
                1.0: 'D',
                0.0: 'F'
            }

            closest_grade = min(grade_map.keys(), key=lambda x: abs(x - grade_point))
            grade_letter = grade_map[closest_grade]

            grades.append({
                'student_id': student_id,
                'course_id': course_id,
                'grade': grade_letter,
                'grade_point': round(grade_point, 2),
                'semester': semester,
                'year': year,
                'attendance_rate': round(attendance, 2)
            })

        return grades

    def generate_preferences(self, student_id: str) -> dict:
        """Generate student learning preferences"""
        career_interests = random.sample([
            'Software Engineering', 'Data Science', 'Artificial Intelligence',
            'Web Development', 'Cybersecurity', 'Research', 'Academia',
            'Game Development', 'Mobile Development', 'Cloud Computing'
        ], k=random.randint(2, 4))

        learning_styles = random.sample(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'], k=random.randint(1, 3))
        time_preferences = random.sample(['Morning', 'Afternoon', 'Evening'], k=random.randint(1, 3))
        formats = random.sample(['In-person', 'Online', 'Hybrid'], k=random.randint(1, 3))
        interests = random.sample([
            'Programming', 'Algorithms', 'Database Design', 'Web Technologies',
            'Machine Learning', 'Mathematics', 'Physics', 'Biology', 'Economics'
        ], k=random.randint(2, 5))

        return {
            'student_id': student_id,
            'career_interests': career_interests,
            'preferred_learning_styles': learning_styles,
            'course_time_preferences': time_preferences,
            'preferred_course_formats': formats,
            'interests': interests,
            'goals': 'Build a successful career in technology and contribute to innovative projects.'
        }

    def generate_disabilities(self, student_id: str, has_disability: bool) -> dict:
        """Generate disability accommodations if applicable"""
        if not has_disability:
            return None

        disability_type = random.choice(['Visual', 'Hearing', 'Mobility', 'Learning'])

        accommodation_map = {
            'Visual': {
                'preferred_interaction_mode': 'Audio materials and screen reader compatible content',
                'support_requirements': 'Braille materials, audio descriptions, magnified text'
            },
            'Hearing': {
                'preferred_interaction_mode': 'Visual materials and written summaries',
                'support_requirements': 'Captioning, sign language interpreter, written notes'
            },
            'Mobility': {
                'preferred_interaction_mode': 'Flexible seating and movement breaks',
                'support_requirements': 'Accessible facilities, flexible class attendance'
            },
            'Learning': {
                'preferred_interaction_mode': 'Structured materials and additional time',
                'support_requirements': 'Extended test time, simplified instructions, tutoring'
            }
        }

        accommodation = accommodation_map.get(disability_type, {})

        return {
            'student_id': student_id,
            'disability_type': disability_type,
            'preferred_interaction_mode': accommodation.get('preferred_interaction_mode'),
            'support_requirements': accommodation.get('support_requirements')
        }

    def seed_all_data(self, student_count: int = 200):
        """Generate and insert all test data"""
        print("=" * 60)
        print("GENERATING COMPREHENSIVE EDUCATIONAL DATASET")
        print("=" * 60)

        students = self.generate_students(student_count)
        print(f"✓ Generated {len(students)} student profiles")

        print("\nInserting students into database...")
        created_students = []
        for student in students:
            try:
                response = self.supabase.table('students').insert({
                    'full_name': student['full_name'],
                    'email': student['email'],
                    'current_gpa': student['current_gpa'],
                    'academic_level': student['academic_level'],
                    'major': student['major'],
                    'has_disability': student['has_disability']
                }).execute()

                if response.data:
                    created_students.append(response.data[0])
            except Exception as e:
                if 'Duplicate' not in str(e):
                    print(f"  Warning: {str(e)}")

        print(f"✓ Inserted {len(created_students)} students")

        total_grades = 0
        print(f"\nGenerating grades for {len(created_students)} students...")
        for idx, student in enumerate(created_students):
            if (idx + 1) % 50 == 0:
                print(f"  Progress: {idx + 1}/{len(created_students)}")

            grades = self.generate_grades(student['id'], num_courses=random.randint(5, 15))

            for grade in grades:
                try:
                    self.supabase.table('grades').insert(grade).execute()
                    total_grades += 1
                except Exception as e:
                    if 'Duplicate' not in str(e):
                        pass

        print(f"✓ Inserted {total_grades} grades")

        print(f"\nGenerating preferences for {len(created_students)} students...")
        total_prefs = 0
        for student in created_students:
            try:
                prefs = self.generate_preferences(student['id'])
                self.supabase.table('student_preferences').insert(prefs).execute()
                total_prefs += 1
            except Exception as e:
                if 'Duplicate' not in str(e):
                    pass

        print(f"✓ Inserted {total_prefs} preference records")

        print(f"\nGenerating disability accommodations...")
        total_disabilities = 0
        for student in created_students:
            if student['has_disability']:
                try:
                    disability = self.generate_disabilities(student['id'], True)
                    self.supabase.table('disabilities').insert(disability).execute()
                    total_disabilities += 1
                except Exception as e:
                    if 'Duplicate' not in str(e):
                        pass

        print(f"✓ Inserted {total_disabilities} disability records")

        print("\n" + "=" * 60)
        print("DATASET GENERATION COMPLETE")
        print("=" * 60)
        print(f"\nSummary:")
        print(f"  - Students: {len(created_students)}")
        print(f"  - Grades: {total_grades}")
        print(f"  - Preferences: {total_prefs}")
        print(f"  - Disability Records: {total_disabilities}")
        print(f"\nDataset ready for ML model training!")
        print("=" * 60)

if __name__ == "__main__":
    try:
        generator = DatasetGenerator()
        generator.seed_all_data(student_count=200)
    except Exception as e:
        print(f"Error: {str(e)}")
        print("\nMake sure:")
        print("1. .env file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("2. Courses are already seeded (run seed_data.sql)")
        print("3. Database tables are created (run migration)")
