
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseClient = () => {
  return supabase;
};

export default useSupabaseClient;
