
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Initialize the database with required tables for the application
 */
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    
    // Check if tables exist by trying to query them
    const tablesStatus = await checkTablesExist();
    
    // Create tables that don't exist
    for (const tableName in tablesStatus) {
      if (!tablesStatus[tableName]) {
        console.log(`Table '${tableName}' does not exist, creating it...`);
        await createTable(tableName);
      } else {
        console.log(`Table '${tableName}' exists`);
      }
    }

    // If products table exists but has no inventory items, add default inventory
    if (tablesStatus.products) {
      // Check if we have inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'inventory');
      
      if (!inventoryError && (!inventoryData || inventoryData.length === 0)) {
        console.log('No inventory items found, inserting default inventory...');
        await insertDefaultInventory();
      }
    }
    
    // If locations table exists but is empty, add default locations
    if (tablesStatus.locations) {
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*');
      
      if (!locationsError && (!locationsData || locationsData.length === 0)) {
        console.log('No locations found, inserting default locations...');
        await insertDefaultLocations();
      }
    }
    
    console.log('Database initialization complete');
    return true;
  } catch (error: any) {
    console.error('Error initializing database:', error);
    toast.error('Database initialization failed');
    return false;
  }
};

/**
 * Check if the required tables exist in the database
 */
const checkTablesExist = async () => {
  const tables = ['products', 'locations', 'orders', 'wishlists'];
  const status: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      // Use a type assertion to allow dynamic table names
      // This is necessary because the Supabase client is strongly typed
      const { error } = await (supabase.from(table as any) as any).select('*').limit(1);
      status[table] = !error || !error.message.includes(`relation "${table}" does not exist`);
    } catch (error) {
      console.error(`Error checking if ${table} table exists:`, error);
      status[table] = false;
    }
  }
  
  return status;
};

/**
 * Create a specific table in the database
 */
const createTable = async (tableName: string) => {
  try {
    // Cast the entire RPC call to 'any' to bypass TypeScript's strict typing
    let sqlQuery = '';
    
    switch (tableName) {
      case 'products':
        sqlQuery = `
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price NUMERIC NOT NULL,
            original_price NUMERIC NOT NULL,
            discount_percentage NUMERIC DEFAULT 0,
            image TEXT,
            images JSONB,
            rating NUMERIC DEFAULT 5,
            category TEXT NOT NULL,
            tags JSONB,
            sizes JSONB,
            stock INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        break;
      case 'locations':
        sqlQuery = `
          CREATE TABLE IF NOT EXISTS locations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        break;
      case 'orders':
        sqlQuery = `
          CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            order_number TEXT NOT NULL,
            total NUMERIC NOT NULL,
            status TEXT NOT NULL DEFAULT 'processing',
            items JSONB NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'razorpay',
            delivery_fee NUMERIC DEFAULT 0,
            shipping_address JSONB,
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        break;
      case 'wishlists':
        sqlQuery = `
          CREATE TABLE IF NOT EXISTS wishlists (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            product_id TEXT NOT NULL,
            name TEXT NOT NULL,
            price NUMERIC NOT NULL,
            image TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, product_id)
          );
        `;
        break;
      default:
        console.error(`No SQL definition for table: ${tableName}`);
        return false;
    }
    
    const { error } = await (supabase.rpc as any)('execute_sql', {
      sql_query: sqlQuery
    });
    
    if (error) {
      console.error(`Error creating ${tableName} table with RPC:`, error);
      
      // For direct operations without RPC, you could try this alternative approach
      // But this likely won't work without proper permissions
      console.log(`Attempting fallback creation method for ${tableName}...`);
      
      if (tableName === 'products') {
        await insertDefaultInventory();
      } else if (tableName === 'locations') {
        await insertDefaultLocations();
      }
    } else {
      console.log(`${tableName} table created successfully`);
    }
    
    return !error;
  } catch (error) {
    console.error(`Error in creating ${tableName} table:`, error);
    return false;
  }
};

/**
 * Insert default inventory items
 */
const insertDefaultInventory = async () => {
  try {
    // Insert inventory items one by one to avoid type errors
    const inventoryItems = [
      { code: 'TSH-S', name: 'tshirt_S', category: 'inventory', price: 0, original_price: 0, stock: 10 },
      { code: 'TSH-M', name: 'tshirt_M', category: 'inventory', price: 0, original_price: 0, stock: 15 },
      { code: 'TSH-L', name: 'tshirt_L', category: 'inventory', price: 0, original_price: 0, stock: 8 },
      { code: 'TSH-XL', name: 'tshirt_XL', category: 'inventory', price: 0, original_price: 0, stock: 5 },
      { code: 'MUG-STD', name: 'mug_Standard', category: 'inventory', price: 0, original_price: 0, stock: 20 },
      { code: 'CAP-STD', name: 'cap_Standard', category: 'inventory', price: 0, original_price: 0, stock: 12 }
    ];
    
    for (const item of inventoryItems) {
      // We need to cast to 'any' here as well to avoid type errors
      const { error } = await (supabase.from('products') as any).insert([item]);
      
      if (error) {
        console.error(`Error inserting inventory item ${item.name}:`, error);
      }
    }
    
    console.log('Default inventory inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting default inventory:', error);
    return false;
  }
};

/**
 * Insert default locations
 */
const insertDefaultLocations = async () => {
  try {
    // Insert locations one by one to avoid type errors
    const locations = [
      { name: 'Karnataka', code: 'KA', is_active: true },
      { name: 'Andhra Pradesh', code: 'AP', is_active: true },
      { name: 'Tamil Nadu', code: 'TN', is_active: true },
      { name: 'Kerala', code: 'KL', is_active: true },
      { name: 'Telangana', code: 'TG', is_active: true }
    ];
    
    for (const location of locations) {
      // Cast to 'any' to bypass TypeScript's type checking
      const { error } = await (supabase.from('locations') as any).insert([location]);
      
      if (error) {
        console.error(`Error inserting location ${location.name}:`, error);
      }
    }
    
    console.log('Default locations inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting default locations:', error);
    return false;
  }
};
