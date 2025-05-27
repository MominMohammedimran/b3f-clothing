
import { supabase } from '@/integrations/supabase/client';

// Base API service for making HTTP requests to microservices
export class ApiService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(serviceUrl: string) {
    this.baseUrl = serviceUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Set authorization header for authenticated requests
  public async setAuthHeader(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      this.headers['Authorization'] = `Bearer ${data.session.access_token}`;
    }
  }

  // GET request
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters if provided
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`GET request failed: ${error}`);
      throw error;
    }
  }

  // POST request
  public async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`POST request failed: ${error}`);
      throw error;
    }
  }

  // PUT request
  public async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`PUT request failed: ${error}`);
      throw error;
    }
  }

  // DELETE request
  public async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`DELETE request failed: ${error}`);
      throw error;
    }
  }
}

// Implementation of Edge Function API service using Supabase Edge Functions
export class EdgeFunctionApiService extends ApiService {
  constructor() {
    // Edge functions don't need a base URL as they're accessed via supabase.functions.invoke
    super('');
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke(endpoint, {
        method: 'GET',
        body: params
      });

      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`EdgeFunction GET request failed: ${error}`);
      throw error;
    }
  }

  public async post<T>(endpoint: string, body: any): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke(endpoint, {
        method: 'POST',
        body
      });

      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`EdgeFunction POST request failed: ${error}`);
      throw error;
    }
  }

  // Override other methods as needed for edge functions
}

// Create and export service instances for different microservices
export const orderService = new EdgeFunctionApiService();
export const paymentService = new EdgeFunctionApiService();
export const notificationService = new EdgeFunctionApiService();
export const userService = new EdgeFunctionApiService();
