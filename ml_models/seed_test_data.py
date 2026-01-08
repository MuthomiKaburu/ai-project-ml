import os
from supabase import create_client, Client
from dotenv import load_dotenv
import random

load_dotenv()

def seed_test_data():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables")
        return

    supabase: Client = create_client(url, key)

    print("=" * 50)
    print("Seeding Test Data for Course Recommendation System")
    print("=" * 50)

    courses_response = supabase.table('courses').select('id, course_code, course_name').execute()
    courses = courses_response.data

    if not courses or len(courses) == 0:
        print("\nError: No courses found in database.")
        print("Please run seed_data.sql first to populate courses.")
        return

    print(f"\nFound {len(courses)} courses in database")

    test_students = [
        {
            "email": "john.doe@example.com",
            "full_name": "John Doe",
            "major": "Computer Science",
            "academic_level": "Junior",
            "current_gpa": 3.5,
            "has_disability": False
        },
        {
            "email": "jane.smith@example.com",
            "full_name": "Jane Smith",
            "major": "Computer Science",
            "academic_level": "Senior",
            "current_gpa": 3.8,
            "has_disability": True
        },
        {
            "email": "bob.johnson@example.com",
            "full_name": "Bob Johnson",
            "major": "Mathematics",
            "academic_level": "Sophomore",
            "current_gpa": 2.9,
            "has_disability": False
        },
        {
            "email": "alice.williams@example.com",
            "full_name": "Alice Williams",
            "major": "Physics",
            "academic_level": "Freshman",
            "current_gpa": 3.2,
            "has_disability": True
        },
        {
            "email": "charlie.brown@example.com",
            "full_name": "Charlie Brown",
            "major": "Biology",
            "academic_level": "Junior",
            "current_gpa": 2.5,
            "has_disability": False
        }
    ]

    print("\nNote: This script creates test student profiles without authentication.")
    print("For production use, students should create accounts through the application.\n")

    students_response = supabase.table('students').select('email').execute()
    existing_emails = {s['email'] for s in students_response.data}

    created_students = []

    for student_data in test_students:
        if student_data['email'] in existing_emails:
            print(f"✓ Student {student_data['email']} already exists, skipping...")
            student = supabase.table('students').select('*').eq('email', student_data['email']).single().execute()
            created_students.append(student.data)
            continue

        try:
            student = supabase.table('students').insert({
                'full_name': student_data['full_name'],
                'email': student_data['email'],
                'major': student_data['major'],
                'academic_level': student_data['academic_level'],
                'current_gpa': student_data['current_gpa'],
                'has_disability': student_data['has_disability']
            }).execute()

            created_students.append(student.data[0])
            print(f"✓ Created student: {student_data['full_name']}")

            if student_data['has_disability']:
                disability_types = ['Visual', 'Hearing', 'Learning']
                disability_type = random.choice(disability_types)

                supabase.table('disabilities').insert({
                    'student_id': student.data[0]['id'],
                    'disability_type': disability_type,
                    'preferred_interaction_mode': 'Audio and visual materials',
                    'support_requirements': 'Extended time for assignments and exams'
                }).execute()

                print(f"  └─ Added {disability_type} disability profile")

        except Exception as e:
            print(f"✗ Error creating student {student_data['full_name']}: {str(e)}")

    print(f"\n{len(created_students)} students ready for grade data")

    grade_map = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
    }

    for student in created_students:
        student_id = student['id']
        gpa = student['current_gpa']

        num_courses = random.randint(3, 6)
        selected_courses = random.sample(courses, num_courses)

        print(f"\nAdding grades for {student['full_name']}:")

        for course in selected_courses:
            if gpa >= 3.5:
                grade_options = ['A', 'A-', 'B+']
            elif gpa >= 3.0:
                grade_options = ['A-', 'B+', 'B', 'B-']
            elif gpa >= 2.5:
                grade_options = ['B', 'B-', 'C+', 'C']
            else:
                grade_options = ['C+', 'C', 'C-', 'D']

            grade = random.choice(grade_options)
            grade_point = grade_map[grade]
            attendance = random.uniform(75, 100)
            semester = random.choice(['Fall', 'Spring'])
            year = random.choice([2022, 2023])

            try:
                existing_grade = supabase.table('grades').select('id').eq('student_id', student_id).eq('course_id', course['id']).eq('semester', semester).eq('year', year).execute()

                if len(existing_grade.data) > 0:
                    print(f"  ✓ Grade already exists for {course['course_code']}")
                    continue

                supabase.table('grades').insert({
                    'student_id': student_id,
                    'course_id': course['id'],
                    'grade': grade,
                    'grade_point': grade_point,
                    'semester': semester,
                    'year': year,
                    'attendance_rate': attendance
                }).execute()

                print(f"  ✓ {course['course_code']}: {grade} ({grade_point}) - {semester} {year}")

            except Exception as e:
                print(f"  ✗ Error adding grade for {course['course_code']}: {str(e)}")

    print("\n" + "=" * 50)
    print("Test data seeding complete!")
    print("=" * 50)
    print("\nSummary:")
    print(f"- {len(courses)} courses available")
    print(f"- {len(created_students)} test students created")
    print("\nYou can now:")
    print("1. Train ML models: python train_performance_models.py")
    print("2. Train recommenders: python train_recommendation_models.py")
    print("3. Test the application with the seeded data")
    print("\nNote: These test students don't have authentication credentials.")
    print("Create real accounts through the application for full functionality.")

if __name__ == "__main__":
    seed_test_data()
