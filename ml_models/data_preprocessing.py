import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class DataPreprocessor:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase: Client = create_client(url, key)

    def fetch_all_data(self) -> Dict[str, pd.DataFrame]:
        students = pd.DataFrame(self.supabase.table('students').select('*').execute().data)
        courses = pd.DataFrame(self.supabase.table('courses').select('*').execute().data)
        grades = pd.DataFrame(self.supabase.table('grades').select('*').execute().data)
        preferences = pd.DataFrame(self.supabase.table('student_preferences').select('*').execute().data)
        disabilities = pd.DataFrame(self.supabase.table('disabilities').select('*').execute().data)

        return {
            'students': students,
            'courses': courses,
            'grades': grades,
            'preferences': preferences,
            'disabilities': disabilities
        }

    def prepare_performance_data(self, data: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, pd.Series]:
        grades_df = data['grades'].copy()
        students_df = data['students'].copy()
        courses_df = data['courses'].copy()

        merged = grades_df.merge(students_df, left_on='student_id', right_on='id', suffixes=('', '_student'))
        merged = merged.merge(courses_df, left_on='course_id', right_on='id', suffixes=('', '_course'))

        features = pd.DataFrame({
            'current_gpa': merged['current_gpa'],
            'course_difficulty': merged['difficulty_level'],
            'attendance_rate': merged['attendance_rate'],
            'has_disability': merged['has_disability'].astype(int),
            'credits': merged['credits']
        })

        target = merged['grade_point']

        at_risk = (target < 2.0).astype(int)

        return features, target, at_risk

    def prepare_recommendation_data(self, data: Dict[str, pd.DataFrame], student_id: str) -> pd.DataFrame:
        student = data['students'][data['students']['id'] == student_id].iloc[0]
        student_grades = data['grades'][data['grades']['student_id'] == student_id]
        student_prefs = data['preferences'][data['preferences']['student_id'] == student_id]

        if len(student_prefs) > 0:
            student_prefs = student_prefs.iloc[0]
        else:
            student_prefs = None

        courses_taken = set(student_grades['course_id'].values)
        available_courses = data['courses'][~data['courses']['id'].isin(courses_taken)]

        avg_grade = student_grades['grade_point'].mean() if len(student_grades) > 0 else 2.5

        features_list = []
        for _, course in available_courses.iterrows():
            feature_dict = {
                'course_id': course['id'],
                'student_gpa': student['current_gpa'],
                'avg_previous_grade': avg_grade,
                'course_difficulty': course['difficulty_level'],
                'has_disability': int(student['has_disability']),
                'credits': course['credits']
            }
            features_list.append(feature_dict)

        return pd.DataFrame(features_list)

    def calculate_similarity_features(self, student_id: str, data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        students_df = data['students']
        grades_df = data['grades']
        prefs_df = data['preferences']

        target_student = students_df[students_df['id'] == student_id].iloc[0]
        target_grades = grades_df[grades_df['student_id'] == student_id]
        target_avg_grade = target_grades['grade_point'].mean() if len(target_grades) > 0 else 2.5

        similar_students = []
        for _, student in students_df.iterrows():
            if student['id'] == student_id:
                continue

            student_grades = grades_df[grades_df['student_id'] == student['id']]
            if len(student_grades) == 0:
                continue

            gpa_diff = abs(target_student['current_gpa'] - student['current_gpa'])
            major_match = 1 if target_student['major'] == student['major'] else 0
            disability_match = 1 if target_student['has_disability'] == student['has_disability'] else 0

            similarity_score = (5 - gpa_diff) * 0.4 + major_match * 0.3 + disability_match * 0.3

            similar_students.append({
                'student_id': student['id'],
                'similarity_score': similarity_score,
                'avg_grade': student_grades['grade_point'].mean()
            })

        return pd.DataFrame(similar_students).sort_values('similarity_score', ascending=False)

    def encode_categorical_features(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        df_encoded = df.copy()
        for col in columns:
            if col in df_encoded.columns:
                df_encoded[col] = pd.Categorical(df_encoded[col]).codes
        return df_encoded

    def normalize_features(self, df: pd.DataFrame) -> pd.DataFrame:
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
        return df
