/**
 * Atomic Design Component Guide
 * 
 * Purpose: Provide a comprehensive framework for building component libraries using atomic design methodology
 * 
 * Current challenges:
 * - AI builders often create inconsistent component hierarchies
 * - Component relationships and dependencies aren't always clear
 * - Lack of standardized naming and organization for components
 * - Difficulty maintaining and extending component libraries over time
 * - Unclear boundaries between component responsibilities
 * 
 * Implementation needs:
 * - Clear guidelines for each atomic design level (atoms, molecules, organisms, templates, pages)
 * - Standardized file structure and naming conventions
 * - Component composition patterns and best practices
 * - Explicit file locations and import patterns
 * 
 * v1 Created (2025-06-05):
 * - Initial comprehensive guide for atomic design implementation
 * - Tailored specifically for React+TypeScript+Tailwind+shadcn projects
 * - Focused on mobile-first implementations
 */

# Atomic Design Component Guide

## Overview

Atomic design is a methodology for creating design systems by breaking down components into five distinct levels:

1. **Atoms**: Basic building blocks (buttons, inputs, icons)
2. **Molecules**: Simple combinations of atoms (form fields, navigation items)
3. **Organisms**: Complex UI sections composed of molecules and atoms
4. **Templates**: Page-level layouts with placeholders
5. **Pages**: Specific instances of templates with real content

This guide will help you implement atomic design in React applications built with TypeScript, Tailwind CSS, and shadcn/ui. By following these guidelines, you'll create a cohesive, maintainable component library that scales from the smallest elements to complete pages.

## File Structure

Organize your components using this file structure:

```
src/
├── components/
│   ├── ui/                  # Atoms (basic building blocks)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── checkbox.tsx
│   │   └── ...
│   ├── compound/            # Molecules (combinations of atoms)
│   │   ├── form-field.tsx
│   │   ├── search-bar.tsx
│   │   ├── menu-item.tsx
│   │   └── ...
│   ├── blocks/              # Organisms (complex UI sections)
│   │   ├── navigation-bar.tsx
│   │   ├── product-card.tsx
│   │   ├── feature-section.tsx
│   │   └── ...
│   ├── layout/              # Templates (page structures)
│   │   ├── app-shell.tsx
│   │   ├── auth-layout.tsx
│   │   ├── dashboard-layout.tsx
│   │   └── ...
│   └── pages/               # Pages (implementations of templates)
│       ├── home-page.tsx
│       ├── product-page.tsx
│       ├── checkout-page.tsx
│       └── ...
```

## Component Categories

### 1. Atoms (`/components/ui/`)

Atoms are the basic building blocks of your interface - the smallest meaningful UI elements that can't be broken down further without losing their functionality.

**Characteristics:**
- Single responsibility
- No dependencies on other components (except icons)
- Stateless when possible (controlled components)
- Highly reusable across the entire application

**Examples:**
- Buttons, inputs, checkboxes, radio buttons
- Icons, labels, badges, avatars
- Typography elements (headings, paragraphs)
- Dividers, spinners, tooltips

**Code Example - Button Atom:**
```tsx
// src/components/ui/button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 2. Molecules (`/components/compound/`)

Molecules are simple combinations of atoms that form functional groups. They represent the smallest composite components with their own purpose.

**Characteristics:**
- Composed of multiple atoms
- Focused on a single responsibility
- Reusable across different contexts
- May contain minimal state for internal functionality

**Examples:**
- Form fields (label + input + error message)
- Search bars (input + button)
- Navigation items (icon + label + badge)
- Card headers (title + description + actions)

**Code Example - Form Field Molecule:**
```tsx
// src/components/compound/form-field.tsx
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  description,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
```

**Usage Example:**
```tsx
<FormField
  label="Email Address"
  htmlFor="email"
  error={errors.email}
  description="We'll never share your email with anyone else."
>
  <Input id="email" placeholder="Enter your email" />
</FormField>
```

### 3. Organisms (`/components/blocks/`)

Organisms are complex UI sections composed of molecules and atoms. They represent distinct sections of an interface that form a relatively complete piece of functionality.

**Characteristics:**
- Composed of multiple molecules and atoms
- Represent a distinct section of the user interface
- May contain their own state and business logic
- Focused on a specific domain context
- More specialized and less reusable than molecules

**Examples:**
- Navigation bars
- Product cards or listings
- Forms (registration, checkout, etc.)
- Headers and footers
- Comment sections
- Sidebar widgets

**Code Example - Product Card Organism:**
```tsx
// src/components/blocks/product-card.tsx
import * as React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, ShoppingCartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { Product } from "@/types/models";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  className,
}: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <div className="relative aspect-square overflow-hidden">
        {product.discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-destructive">
            {product.discountPercentage}% OFF
          </Badge>
        )}
        <img
          src={product.thumbnail}
          alt={product.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1">{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">
            {formatCurrency(product.price * (1 - product.discountPercentage / 100))}
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-muted-foreground text-sm line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2 mt-auto">
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCartIcon className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onAddToWishlist(product)}
        >
          <HeartIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 4. Templates (`/components/layout/`)

Templates are page-level structures that define the layout of a page without specifying the actual content. They provide the skeleton for different page types in your application.

**Characteristics:**
- Define the overall layout and structure of pages
- Composed of organisms arranged in a specific layout
- Focus on structure, not content
- Include placeholders for dynamic content
- Handle responsive behavior across different screen sizes

**Examples:**
- App shell/main layout
- Authentication layout
- Dashboard layout
- Article layout
- Product detail layout

**Code Example - Dashboard Layout Template:**
```tsx
// src/components/layout/dashboard-layout.tsx
import * as React from "react";
import { Sidebar } from "@/components/blocks/sidebar";
import { TopNav } from "@/components/blocks/top-nav";
import { MobileNav } from "@/components/blocks/mobile-nav";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Mobile top navigation - visible on small screens */}
      <TopNav className="md:hidden" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, visible on larger screens */}
        <Sidebar className="hidden md:flex md:w-64 md:flex-shrink-0" />
        
        {/* Main content area */}
        <main className={cn("flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
      
      {/* Mobile bottom navigation - visible on small screens only */}
      <MobileNav className="md:hidden" />
    </div>
  );
}
```

### 5. Pages (`/components/pages/`)

Pages are specific implementations of templates that populate the template structure with actual content. They represent the final, complete UI that users interact with.

**Characteristics:**
- Implement a specific template with real content
- Connect UI to application state and data
- Handle page-specific logic and data fetching
- Serve as the entry point for routes
- Compose organisms to create the complete UI

**Examples:**
- Home page
- Product listing page
- Product detail page
- Checkout page
- User profile page

**Code Example - Dashboard Page:**
```tsx
// src/components/pages/dashboard-page.tsx
import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardStats } from "@/components/blocks/dashboard-stats";
import { RecentOrders } from "@/components/blocks/recent-orders";
import { ActivityFeed } from "@/components/blocks/activity-feed";
import { useUserStore } from "@/stores/user-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useActivityStore } from "@/stores/activity-store";

export function DashboardPage() {
  const { user } = useUserStore();
  const { recentOrders, fetchRecentOrders } = useOrdersStore();
  const { activities, fetchRecentActivities } = useActivityStore();
  
  React.useEffect(() => {
    fetchRecentOrders();
    fetchRecentActivities();
  }, [fetchRecentOrders, fetchRecentActivities]);
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Welcome back, {user?.firstName || 'User'}
      </h1>
      
      <div className="mb-8">
        <DashboardStats />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## Component Composition Patterns

### Props Drilling vs. Context

- **Props Drilling**: Use for shallow component trees (2-3 levels)
  ```tsx
  <ParentComponent data={data} onAction={handleAction} />
  ```

- **Context**: Use for deeply nested components that need the same data
  ```tsx
  // Create context
  const UserContext = React.createContext(null);
  
  // Provider in parent component
  <UserContext.Provider value={{ user, updateUser }}>
    <ChildComponents />
  </UserContext.Provider>
  
  // Consumer in deeply nested component
  const { user } = React.useContext(UserContext);
  ```

### Composition over Configuration

Prefer component composition over complex configuration props:

```tsx
// Instead of this:
<Card 
  title="Card Title"
  description="Card description"
  footerContent={<Button>Action</Button>}
/>

// Prefer this:
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Component Variants with Class Variance Authority (CVA)

Use CVA to define component variants:

```tsx
const buttonVariants = cva(
  "base-styles-here",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        outline: "border border-input bg-transparent",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

### Compound Components Pattern

Use the compound component pattern for complex, related component groups:

```tsx
import * as React from "react";

// Example Tabs compound component
const TabsContext = React.createContext(null);

export function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
}

export function TabsTrigger({ children, value }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  
  return (
    <button
      className={`tabs-trigger ${activeTab === value ? "active" : ""}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value }) {
  const { activeTab } = React.useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div className="tabs-content">{children}</div>;
}

// Usage:
/*
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings...</TabsContent>
  <TabsContent value="password">Password settings...</TabsContent>
</Tabs>
*/
```

## Best Practices

### Component Naming

- Use **PascalCase** for component names (e.g., `Button`, `ProductCard`)
- Use **kebab-case** for file names (e.g., `button.tsx`, `product-card.tsx`)
- Be descriptive and specific (e.g., `ProductSearchResult` vs. `Item`)
- Use consistent prefixes for related components:
  - Base component: `Card`
  - Child components: `CardHeader`, `CardBody`, `CardFooter`

### File Organization

- One component per file for atoms and molecules
- Related components can be grouped in the same file for compound components
- Group related files in subdirectories for complex organisms and templates
- Export all components from an index file for easier imports

### Props & TypeScript

- Use TypeScript interfaces for component props
- Make props explicit and descriptive
- Provide default values for optional props
- Use discriminated unions for components with multiple states

```tsx
// Using discriminated unions for different states
type ButtonProps = 
  | { variant: 'primary'; onClick: () => void; children: React.ReactNode }
  | { variant: 'link'; href: string; children: React.ReactNode };

function Button(props: ButtonProps) {
  if (props.variant === 'primary') {
    return <button onClick={props.onClick}>{props.children}</button>;
  } else {
    return <a href={props.href}>{props.children}</a>;
  }
}
```

### Responsive Design

- Design for mobile first, then enhance for larger screens
- Use Tailwind's responsive prefixes consistently:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  ```
- Use flexible layouts rather than fixed sizes
- Test components at all breakpoints

### Accessibility

- Use semantic HTML elements (e.g., `<button>`, `<nav>`, `<article>`)
- Include ARIA attributes where needed
- Ensure keyboard navigability for all interactive elements
- Maintain sufficient color contrast (4.5:1 for normal text)
- Test with screen readers

## Implementation Workflow

Follow this workflow when implementing atomic design in your project:

1. **Start with design tokens** (colors, typography, spacing)
2. **Build atoms** first (basic UI components)
3. **Compose molecules** from atoms
4. **Create organisms** by combining molecules and atoms
5. **Define templates** for common page layouts
6. **Implement pages** using templates and filling with real content

This bottom-up approach ensures that you have the necessary building blocks before creating more complex components.

## Examples From Popular Apps

### Notion-like UI Components

- **Atoms**: Text blocks, action buttons, icons
- **Molecules**: Command menu item, page list item, property field
- **Organisms**: Command palette, page sidebar, block editor
- **Templates**: Document layout, database layout
- **Pages**: Document page, database view page

### iOS/macOS Design Patterns

- **Atoms**: SF Symbol icons, badges, labels
- **Molecules**: List items, action buttons, navigation items
- **Organisms**: Navigation bars, tab bars, cards/panels
- **Templates**: Settings layout, list detail layout
- **Pages**: Settings page, content detail page

By following these atomic design principles, you'll create a component library that is modular, maintainable, and scalable, allowing your application to grow while maintaining consistency and quality.
