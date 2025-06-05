
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmpggiyuiattqjmddcac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGdnaXl1aWF0dHFqbWRkY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzkwNDksImV4cCI6MjA2Mjk1NTA0OX0.-8ae0vFjxM6FR8RgssFduVaBjfERURWQL8Wj3i5TujE';

export const useSupabaseClient = () => {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  return supabase;
};
