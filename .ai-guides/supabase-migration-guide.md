/**
 * Supabase Migration Guide
 * 
 * Purpose: Provide a step-by-step approach for transitioning from mock data to a Supabase backend
 * 
 * Current challenges:
 * - Lack of clear migration path from development mock data to production backend
 * - Difficulty implementing proper authentication and authorization
 * - Unclear patterns for structuring database tables and relationships
 * - RLS (Row Level Security) policies often cause development headaches
 * - Inconsistent service layer design leading to tightly coupled components
 * 
 * Implementation needs:
 * - Cleanly structured service interfaces that abstract database operations
 * - Clear database schema design patterns
 * - Authentication flow implementations
 * - RLS policy templates that are secure but don't block development
 * - Migration strategy that minimizes codebase changes
 * 
 * v1 Created (2025-06-05):
 * - Initial comprehensive migration guide
 * - Focused on React/TypeScript applications
 * - Designed for Zustand state management integration
 */

# Supabase Migration Guide

## Overview

This guide provides a systematic approach for transitioning from mock data to Supabase in React applications. By following a service-oriented architecture pattern, you can make this transition smooth and minimize changes to your UI components.

## Prerequisites

- Existing React application with mock data
- TypeScript for type safety
- Zustand for state management
- Application structured with clean separation between UI and data access

## Migration Strategy

### Phase 1: Preparation

1. **Audit Current Application**
   - Identify all data models and their relationships
   - Review existing mock data structure
   - Analyze current service layer implementation
   - Document all API endpoints and data access patterns

2. **Set Up Supabase Project**
   - Create a new Supabase project
   - Set up development, staging, and production environments
   - Configure authentication providers
   - Establish database backup routines

3. **Define Database Schema**
   - Design tables based on your data models
   - Set up foreign key relationships
   - Create necessary indexes
   - Establish enum types for consistent data

### Phase 2: Database Implementation

#### Database Schema Creation

Create your tables with proper relationships. Here's an example schema for a basic e-commerce application:

```sql
-- Create enum types for consistent data
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Setting Up Row Level Security (RLS)

RLS policies control access to your data. Here are examples of effective RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);
  
CREATE POLICY "Only admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders" ON orders
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for their own orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admin access policies
CREATE POLICY "Admins can do everything" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### Phase 3: Service Layer Implementation

#### Service Interface Pattern

The key to a smooth migration is a well-designed service layer. Create interfaces for each data type:

```typescript
// src/types/models.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Additional interfaces for Order, OrderItem, etc.

// src/services/interfaces/user-service.interface.ts
export interface UserService {
  getCurrentUser(): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
}

// src/services/interfaces/product-service.interface.ts
export interface ProductService {
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}

// Additional service interfaces for Orders, etc.
```

#### Mock Service Implementation (Current)

Your current mock implementations might look something like this:

```typescript
// src/services/mock/mock-product-service.ts
import { mockProducts } from '@/data/products';
import { Product, ProductService } from '@/services/interfaces/product-service.interface';

export class MockProductService implements ProductService {
  async getProducts(): Promise<Product[]> {
    return [...mockProducts];
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const product = mockProducts.find(p => p.id === id);
    return product ? { ...product } : null;
  }
  
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In a real mock service, you might push to the mockProducts array
    return newProduct;
  }
  
  // Additional methods...
}
```

#### Supabase Service Implementation

Now, implement the same interfaces using Supabase:

```typescript
// src/services/supabase/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// src/services/supabase/supabase-product-service.ts
import { supabase } from './supabase-client';
import { Product, ProductService, ProductFilters } from '@/services/interfaces/product-service.interface';

export class SupabaseProductService implements ProductService {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*');
    
    // Apply filters if provided
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
    
    return data as Product[];
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
    
    return data as Product;
  }
  
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
    
    return data as Product;
  }
  
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
    
    return data as Product;
  }
  
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}
```

#### Service Factory Pattern

Create a factory to determine which implementation to use:

```typescript
// src/services/service-factory.ts
import { ProductService } from './interfaces/product-service.interface';
import { UserService } from './interfaces/user-service.interface';
import { OrderService } from './interfaces/order-service.interface';

// Import mock implementations
import { MockProductService } from './mock/mock-product-service';
import { MockUserService } from './mock/mock-user-service';
import { MockOrderService } from './mock/mock-order-service';

// Import Supabase implementations
import { SupabaseProductService } from './supabase/supabase-product-service';
import { SupabaseUserService } from './supabase/supabase-user-service';
import { SupabaseOrderService } from './supabase/supabase-order-service';

// Environment configuration
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Factory functions
export function getProductService(): ProductService {
  return USE_SUPABASE
    ? new SupabaseProductService()
    : new MockProductService();
}

export function getUserService(): UserService {
  return USE_SUPABASE
    ? new SupabaseUserService()
    : new MockUserService();
}

export function getOrderService(): OrderService {
  return USE_SUPABASE
    ? new SupabaseOrderService()
    : new MockOrderService();
}
```

### Phase 4: Zustand Store Integration

Your Zustand stores should interact with the service layer:

```typescript
// src/stores/product-store.ts
import { create } from 'zustand';
import { getProductService } from '@/services/service-factory';
import type { Product, ProductFilters } from '@/types/models';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  
  fetchProducts: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => {
  const productService = getProductService();
  
  return {
    products: [],
    isLoading: false,
    error: null,
    filters: {},
    
    fetchProducts: async () => {
      try {
        set({ isLoading: true, error: null });
        const products = await productService.getProducts(get().filters);
        set({ products, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    },
    
    setFilters: (filters) => {
      set({ filters });
      get().fetchProducts();
    },
    
    addProduct: async (product) => {
      try {
        set({ isLoading: true, error: null });
        await productService.createProduct(product);
        get().fetchProducts(); // Refresh the list
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    },
    
    updateProduct: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        await productService.updateProduct(id, data);
        get().fetchProducts(); // Refresh the list
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    },
    
    deleteProduct: async (id) => {
      try {
        set({ isLoading: true, error: null });
        await productService.deleteProduct(id);
        get().fetchProducts(); // Refresh the list
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'An unknown error occurred', 
          isLoading: false 
        });
      }
    },
  };
});
```

### Phase 5: Authentication Implementation

#### Setting Up Supabase Auth

```typescript
// src/services/supabase/supabase-auth-service.ts
import { supabase } from './supabase-client';
import type { User } from '@/types/models';

export interface AuthService {
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export class SupabaseAuthService implements AuthService {
  async signUp(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing up:', error);
      throw new Error(error.message);
    }
  }
  
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error);
      throw new Error(error.message);
    }
    
    // Fetch user profile from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user profile:', userError);
      throw new Error('Failed to fetch user profile');
    }
    
    return userData as User;
  }
  
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw new Error(error.message);
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Error resetting password:', error);
      throw new Error(error.message);
    }
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) {
      return null;
    }
    
    // Fetch user profile from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user profile:', userError);
      return null;
    }
    
    return userData as User;
  }
}
```

#### Authentication Store

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/models';
import { SupabaseAuthService } from '@/services/supabase/supabase-auth-service';
import { MockAuthService } from '@/services/mock/mock-auth-service';

// Environment configuration
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const authService = USE_SUPABASE
        ? new SupabaseAuthService()
        : new MockAuthService();
      
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        signUp: async (email, password) => {
          try {
            set({ isLoading: true, error: null });
            await authService.signUp(email, password);
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'An unknown error occurred', 
              isLoading: false 
            });
          }
        },
        
        signIn: async (email, password) => {
          try {
            set({ isLoading: true, error: null });
            const user = await authService.signIn(email, password);
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'An unknown error occurred', 
              isLoading: false 
            });
          }
        },
        
        signOut: async () => {
          try {
            set({ isLoading: true, error: null });
            await authService.signOut();
            set({ user: null, isAuthenticated: false, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'An unknown error occurred', 
              isLoading: false 
            });
          }
        },
        
        resetPassword: async (email) => {
          try {
            set({ isLoading: true, error: null });
            await authService.resetPassword(email);
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'An unknown error occurred', 
              isLoading: false 
            });
          }
        },
        
        initAuth: async () => {
          try {
            set({ isLoading: true, error: null });
            const user = await authService.getCurrentUser();
            set({ 
              user, 
              isAuthenticated: !!user, 
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'An unknown error occurred', 
              isLoading: false 
            });
          }
        },
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

### Phase 6: Environment Configuration

Set up environment variables for configuring the application:

```
# .env.development
VITE_USE_SUPABASE=false

# .env.staging
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key

# .env.production
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Phase 7: Migration Execution

1. **Implement Service Interfaces**: Define all service interfaces based on your data models
2. **Create Supabase Implementations**: Implement these interfaces using Supabase
3. **Set Up Service Factory**: Create factory functions to switch between implementations
4. **Update Stores**: Modify Zustand stores to use the service factory
5. **Configure Environments**: Set up environment variables for different environments
6. **Testing**: Test the application with both mock and Supabase implementations
7. **Deployment**: Deploy to staging, then production

## Common Pitfalls and Solutions

### RLS Troubles

**Problem**: Row Level Security policies blocking access to data during development.

**Solution**: 
- Create more permissive policies in development
- Use service roles for backend-like operations
- Implement a bypass flag for RLS during development

```sql
-- Development-friendly RLS policy
CREATE POLICY "Bypass RLS in development"
ON table_name
USING (
  current_setting('app.environment', true) = 'development'
  OR auth.uid() = user_id
);
```

### Authentication Edge Cases

**Problem**: Handling token expiration and refresh.

**Solution**: Implement an auth state listener:

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { supabase } from '@/services/supabase/supabase-client';
import { useAuthStore } from '@/stores/auth-store';

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth]);

  // Rest of your app...
}
```

### Type Mismatches

**Problem**: TypeScript types not matching Supabase database types.

**Solution**: 
- Generate types from your database schema
- Use a schema validation library like Zod
- Create adapter functions to transform between formats

```typescript
// src/utils/adapters.ts
import type { DatabaseProduct } from '@/types/database';
import type { Product } from '@/types/models';

export function adaptDatabaseProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: parseFloat(dbProduct.price),
    inventory: dbProduct.inventory,
    category: dbProduct.category || '',
    imageUrl: dbProduct.image_url || '',
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

export function adaptToDatabase(product: Partial<Product>): Partial<DatabaseProduct> {
  return {
    ...(product.name && { name: product.name }),
    ...(product.description && { description: product.description }),
    ...(product.price && { price: product.price.toString() }),
    ...(product.inventory !== undefined && { inventory: product.inventory }),
    ...(product.category && { category: product.category }),
    ...(product.imageUrl && { image_url: product.imageUrl }),
  };
}
```

### Performance Optimization

**Problem**: Fetching too much data or making too many requests.

**Solution**:
- Implement proper pagination
- Use Supabase's filtering capabilities
- Cache results in Zustand stores
- Use Supabase's real-time features for updates

```typescript
// Pagination example
async function getProductsWithPagination(page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to);
    
  if (error) throw error;
  
  return {
    data,
    count,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  };
}
```

## Real-Time Features

Supabase provides real-time capabilities. Here's how to implement them:

```typescript
// src/hooks/use-real-time.ts
import { useEffect } from 'react';
import { supabase } from '@/services/supabase/supabase-client';
import { useProductStore } from '@/stores/product-store';

export function useProductRealTime() {
  const { fetchProducts } = useProductStore();
  
  useEffect(() => {
    // Set up real-time subscription
    const subscription = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          // Refresh products when changes occur
          fetchProducts();
        }
      )
      .subscribe();
    
    // Initial fetch
    fetchProducts();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchProducts]);
}
```

## Testing Considerations

1. **Unit Testing Services**:
   - Test both mock and Supabase implementations
   - Use dependency injection for testing
   - Mock Supabase responses

2. **Integration Testing**:
   - Use a test Supabase project
   - Seed test data before tests
   - Clean up after tests

3. **End-to-End Testing**:
   - Test complete user flows
   - Use Cypress or Playwright
   - Set up test users with different roles

## Conclusion

By following this service-oriented architecture approach, you can transition from mock data to Supabase with minimal changes to your UI components. The key is to design your services and stores with this migration in mind from the beginning.

Remember these principles:
1. Define clear interfaces for all services
2. Implement both mock and Supabase versions
3. Use a factory pattern to switch between implementations
4. Keep UI components decoupled from data access
5. Design RLS policies that are secure but don't block development

With this approach, you can develop your application with mock data for speed and flexibility, then seamlessly transition to Supabase when you're ready for production.
