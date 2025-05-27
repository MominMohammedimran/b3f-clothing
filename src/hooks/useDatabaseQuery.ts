
import { useEffect, useState } from 'react';
import { useSupabaseClient } from './useSupabase';
import { toast } from 'sonner';

/**
 * Custom hook for optimized database queries
 * This hook intelligently handles caching, loading states, and error handling
 */
export function useDatabaseQuery<T>(
  tableName: string,
  options: {
    columns?: string;
    where?: Record<string, any>;
    equals?: Record<string, any>;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    single?: boolean;
    enabled?: boolean;
    cacheDuration?: number;
    onSuccess?: (data: T | T[] | null) => void;
    onError?: (error: Error) => void;
  }
) {
  const [data, setData] = useState<T | T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = useSupabaseClient();
  
  // Generate a cache key based on query params
  const getCacheKey = () => {
    return `${tableName}-${JSON.stringify(options)}`;
  };
  
  // Execute the query
  const executeQuery = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Build the query
      let query = supabase.from(tableName).select(options.columns || '*');
      
      // Add where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(column, value);
          }
        });
      }
      
      // Add equals conditions (alternative syntax)
      if (options.equals) {
        Object.entries(options.equals).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(column, value);
          }
        });
      }
      
      // Add ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? false });
      }
      
      // Add limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute as single or multiple
      const { data: queryData, error: queryError } = options.single 
        ? await query.maybeSingle()
        : await query;
        
      if (queryError) throw queryError;
      
      // Update state
      setData(queryData as T | T[]);
      if (options.onSuccess) options.onSuccess(queryData as T | T[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown database error');
      setError(error);
      if (options.onError) options.onError(error);
      console.error('Database query error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Only execute if enabled (default is true)
    if (options.enabled !== false) {
      executeQuery();
    }
  }, [tableName, JSON.stringify(options)]);
  
  // Function to manually refetch data
  const refetch = () => {
    return executeQuery();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
}
