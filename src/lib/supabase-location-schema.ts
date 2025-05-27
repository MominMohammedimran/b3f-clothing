
/**
 * This file contains the Supabase database schema for locations.
 * You'll need to run these SQL commands in your Supabase project SQL editor.
 */

/**
 * SQL to create the locations table:
 * 
 * CREATE TABLE locations (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   code TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Create a unique constraint on the code
 * ALTER TABLE locations ADD CONSTRAINT locations_code_unique UNIQUE (code);
 * 
 * -- Insert some initial data
 * INSERT INTO locations (name, code) VALUES
 *   ('Andhra Pradesh', 'AP'),
 *   ('Karnataka', 'KA'),
 *   ('Tamil Nadu', 'TN'),
 *   ('Kerala', 'KL'),
 *   ('Telangana', 'TG'),
 *   ('Maharashtra', 'MH'),
 *   ('Gujarat', 'GJ'),
 *   ('Delhi', 'DL');
 * 
 * -- Enable Row Level Security
 * ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create policies
 * -- Policy for public read access
 * CREATE POLICY "Allow public read access" ON locations
 *   FOR SELECT
 *   TO PUBLIC
 *   USING (true);
 * 
 * -- Policy for admin write access
 * CREATE POLICY "Allow admin write access" ON locations
 *   FOR ALL
 *   TO authenticated
 *   USING (auth.uid() IN (SELECT id FROM auth.users WHERE email IN ('admin@example.com')));
 * 
 */

export type Location = {
  id?: string;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
};

export {}; // This is a TypeScript module
