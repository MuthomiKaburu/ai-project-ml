import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          current_gpa: number;
          academic_level: string;
          major: string;
          has_disability: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      courses: {
        Row: {
          id: string;
          course_code: string;
          course_name: string;
          description: string;
          credits: number;
          difficulty_level: number;
          department: string;
          prerequisites: string[];
          accessibility_features: Record<string, unknown>;
          learning_styles: string[];
          created_at: string;
        };
      };
      course_recommendations: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          recommendation_score: number;
          model_type: string;
          reasoning: Record<string, unknown>;
          predicted_grade: number;
          risk_level: string;
          created_at: string;
        };
      };
      performance_predictions: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          predicted_grade_point: number;
          confidence: number;
          at_risk: boolean;
          model_type: string;
          factors: Record<string, unknown>;
          created_at: string;
        };
      };
    };
  };
}
