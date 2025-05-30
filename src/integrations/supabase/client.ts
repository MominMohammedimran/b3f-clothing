
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Updated to use the correct project ID
const supabaseUrl = 'https://cmpggiyuiattqjmddcac.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE';

// Create a strongly typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const useSupabaseClient = () => supabase;
