
// Generic types for Supabase database tables
// These types are simplified to avoid the TS errors related to generics

interface DatabaseRow {
  [key: string]: any;
}

interface DatabaseInsert {
  [key: string]: any;
}

interface DatabaseUpdate {
  [key: string]: any;
}

export type Tables = {
  cart_items: {
    Row: DatabaseRow;
    Insert: DatabaseInsert;
    Update: DatabaseUpdate;
    Relationships: any[];
  };
  carts: {
    Row: DatabaseRow;
    Insert: DatabaseInsert;
    Update: DatabaseUpdate;
    Relationships: any[];
  };
  products: {
    Row: DatabaseRow;
    Insert: DatabaseInsert;
    Update: DatabaseUpdate;
    Relationships: any[];
  };
  // Add other tables as needed
};

// Simplified function with better typing to avoid the errors
export function createDatabaseTypes<T extends keyof Tables>(
  tableName: T,
  rowData: Partial<Tables[T]['Row']>
): Tables[T]['Row'] {
  return rowData as Tables[T]['Row'];
}

export function createDatabaseInsert<T extends keyof Tables>(
  tableName: T,
  insertData: Partial<Tables[T]['Insert']>
): Tables[T]['Insert'] {
  return insertData as Tables[T]['Insert'];
}

export function createDatabaseUpdate<T extends keyof Tables>(
  tableName: T,
  updateData: Partial<Tables[T]['Update']>
): Tables[T]['Update'] {
  return updateData as Tables[T]['Update'];
}

// Enum types (if needed)
export type Enums = {};

export function createEnumValue<E extends keyof Enums>(
  enumName: E,
  value: Enums[E]
): Enums[E] {
  return value;
}
