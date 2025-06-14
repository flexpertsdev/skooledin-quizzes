/**
 * Design System Prompt Guide v2
 * 
 * Purpose: Create a comprehensive one-shot starter prompt for AI LLM builder tools like lovable.dev and bolt.new
 * to generate a complete, modular, mobile-first design system with all necessary components, layouts, and PWA setup
 * 
 * v2 Updates (2025-06-05):
 * - Added Essential Pages Checklist with complete CRUD operations
 * - Added Desktop Enhancement Guidelines with specific navigation patterns
 * - Added Component Layout Specifications with sticky/floating elements
 * - Added Interaction Patterns section with micro-interactions
 * - Added Role-Specific Features for complete functionality
 * - Enhanced layout specifications based on real-world app requirements
 */

# Design System Prompt Guide v2

## Overview

This comprehensive guide provides a battle-tested starter prompt for AI LLM builder tools (lovable.dev, bolt.new, etc.) to create complete mobile-first design systems. Based on real-world feedback, this version includes specific layout requirements, complete CRUD operations, and desktop enhancement patterns.

## Customizable Starter Prompt Template

### Part 1: Project Customization Header

**Replace this section with your specific project details:**

```
PROJECT CUSTOMIZATION (Replace with your specifics):
- App Name: [Your App Name]
- App Vision: [Brief description of what your app does]
- Target Audience: [Who will use this app]
- Color Palette: [e.g., "Modern blue and teal", "Warm sunset colors", "Professional navy and gold"]
- UI Style Reference: [e.g., "Clean like Notion", "Playful like Duolingo", "Elegant like Apple"]
- Key Features: [3-5 main features your app will have]
- Inspiration Apps: [2-3 apps that inspired your design direction]
```

### Part 2: Complete Design System Prompt

**Copy this entire prompt and paste into your AI builder after customizing Part 1:**

---

# Complete Mobile-First PWA with Desktop Enhancement

Build a production-ready React application with TypeScript, Tailwind CSS, and shadcn/ui components. Create a comprehensive design system that works flawlessly on mobile devices, looks beautiful on desktop, and serves as the foundation for a scalable application.

**PROJECT CONTEXT**: [INSERT YOUR PROJECT CUSTOMIZATION FROM PART 1 HERE]

Based on the project context above, implement the following comprehensive design system:

## 📋 Essential Pages Checklist

### Core App Pages (MUST IMPLEMENT ALL)

**Authentication Flow:**
- Login page with social auth options
- Registration page with user type selection
- Onboarding flow (3-4 welcome screens explaining key features)
- Forgot password with email verification
- Email verification page

**Main Application Pages:**
- **Home/Dashboard page** with overview of key metrics and recent activity
- **Primary content page** (feed/timeline/main interface) with filtering, sorting, creation
- **Communication page** (chat/messaging) with sticky bottom input, file attachments
- **Content management page** (notebook/library/saved items) with floating action button, CRUD operations
- **Profile/Settings page** with user info editing, preferences, logout
- **Notifications page** with mark as read, activity filtering

**Essential Secondary Pages:**
- Search results page with universal search across all content
- Help/Support page with FAQs and contact options
- Terms of Service page
- Privacy Policy page
- Contact/Feedback page

### User Role-Specific Pages

**Primary User Type:**
- Detailed item/content pages with full information display
- Creation/submission pages with file upload capabilities
- Progress/analytics tracking page with visual metrics
- Personal planning/organization page

**Secondary User Type (Admin/Creator Role):**
- Management dashboard with user/content oversight
- Creation/editing pages with rich text editor and media support
- Analytics and reporting pages with data visualization
- Bulk operations page for mass actions
- Scheduling/calendar management page

**Tertiary User Type (Supervisor/Monitor Role):**
- Overview dashboard with monitoring capabilities
- Comparison/evaluation pages with rating systems
- Communication hub for direct messaging
- Reports and progress tracking dashboard
- Account/subscription management page

## 🖥️ Desktop Enhancement Guidelines

### Desktop Header Navigation (768px+)
**CRITICAL**: Implement full desktop navigation in header, not just mobile bottom nav.

```jsx
// REQUIRED: Desktop header with full navigation
<header className="hidden md:flex h-16 border-b bg-background/95 backdrop-blur sticky top-0 z-50">
  <div className="container flex items-center justify-between px-6">
    {/* Left: Brand + Main Navigation */}
    <div className="flex items-center space-x-8">
      <Link to="/" className="font-bold text-xl text-primary">
        [Your App Name]
      </Link>
      <nav className="flex items-center space-x-6">
        <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
          [Primary Page Name]
        </Link>
        <Link to="/[secondary]" className="text-sm font-medium hover:text-primary transition-colors">
          [Secondary Page Name]
        </Link>
        <Link to="/[tertiary]" className="text-sm font-medium hover:text-primary transition-colors">
          [Tertiary Page Name]
        </Link>
        {/* Add role-specific nav items based on user type */}
      </nav>
    </div>
    
    {/* Right: Search + Actions + Profile */}
    <div className="flex items-center space-x-4">
      <Button variant="ghost" size="sm" className="w-64 justify-start">
        <Search className="h-4 w-4 mr-2" />
        Search anything... <kbd className="ml-auto text-xs">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="sm">
        <Bell className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>
```

### Desktop Layout Patterns
- **Two-column layouts**: Sidebar + main content for detailed pages
- **Multi-panel views**: Chat + notebook side-by-side on large screens
- **Hover interactions**: Tooltips, preview cards, context menus
- **Keyboard shortcuts**: Cmd+K search, ESC to close modals
- **Breadcrumb navigation**: For deep page hierarchies

## 🎯 Component Layout Specifications

### Communication Interface (CRITICAL REQUIREMENTS)
```jsx
// REQUIRED: Communication interface must have sticky bottom input
<div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] md:h-[calc(100dvh-4rem)]">
  {/* Header */}
  <div className="border-b p-4 bg-background shrink-0">
    <h2>[Communication Page Title]</h2>
  </div>
  
  {/* Messages/Content Area - MUST BE SCROLLABLE */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {/* Messages or communication content */}
  </div>
  
  {/* Input Area - MUST BE STICKY AT BOTTOM */}
  <div className="border-t p-4 bg-background shrink-0 sticky bottom-0">
    <div className="flex items-end space-x-2">
      <Input 
        placeholder="[Context-appropriate placeholder]..." 
        className="flex-1 min-h-[44px]"
      />
      <Button size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
```

### Content Management Interface (CRITICAL REQUIREMENTS)
```jsx
// REQUIRED: Floating Action Button for creating new content
<div className="relative">
  {/* Content Grid/List */}
  <div className="space-y-4">
    {/* Content items */}
  </div>
  
  {/* REQUIRED: Floating Action Button */}
  <Button 
    className="fixed bottom-20 right-4 md:bottom-6 h-14 w-14 rounded-full shadow-lg z-40"
    size="icon"
    onClick={handleCreateContent}
  >
    <Plus className="h-6 w-6" />
  </Button>
</div>
```

### Primary Content Interface (CRITICAL REQUIREMENTS)
```jsx
// REQUIRED: Sticky filter bar + create content functionality
<div className="space-y-4">
  {/* Sticky Filter Bar */}
  <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur py-4 border-b">
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm">
          All
        </Button>
        <Button variant={filter === 'category1' ? 'default' : 'outline'} size="sm">
          [Category 1]
        </Button>
        <Button variant={filter === 'category2' ? 'default' : 'outline'} size="sm">
          [Category 2]
        </Button>
        {/* More filters based on content types */}
      </div>
      {user?.role === '[creator_role]' && (
        <Button onClick={handleCreateContent}>
          <Plus className="h-4 w-4 mr-2" />
          Create [Content Type]
        </Button>
      )}
    </div>
  </div>
  
  {/* Content Feed */}
  <div className="space-y-4">
    {/* Content items */}
  </div>
</div>
```

## 🎨 Design System Foundation

### Color System
Create a cohesive color palette based on: [INSERT YOUR COLOR PALETTE FROM PART 1]

```css
:root {
  /* Primary colors - CUSTOMIZE TO YOUR BRAND */
  --primary: [Your primary color HSL];
  --primary-foreground: [Contrasting text color];
  --secondary: [Your secondary color HSL];
  --secondary-foreground: [Contrasting text color];
  
  /* Semantic colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
  --info: 199 89% 48%;
  
  /* Neutral palette */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: var(--primary);
  
  /* Dynamic viewport height for mobile */
  --vh: 1vh;
}

/* Dark mode variants */
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 11%;
  --card-foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
}
```

## 🔄 CRUD Operations Requirements

### Content Management CRUD (ESSENTIAL)
```jsx
// REQUIRED: Complete content management
const ContentManagementPage = () => {
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // CREATE
  const handleCreateItem = () => {
    setIsCreating(true);
    // Open create item modal/bottom sheet
  };
  
  // READ with search and filters
  const filteredItems = items.filter(item => 
    item.title.includes(searchQuery) || 
    item.content.includes(searchQuery)
  );
  
  // UPDATE
  const handleEditItem = (itemId) => {
    setEditingItem(itemId);
    // Open edit modal/bottom sheet
  };
  
  // DELETE with confirmation
  const handleDeleteItem = (itemId) => {
    // Show confirmation dialog
    // Then delete item
  };
  
  return (
    <div>
      {/* Search bar */}
      <Input placeholder="Search [content type]..." />
      
      {/* Content grid with edit/delete actions */}
      {filteredItems.map(item => (
        <Card key={item.id}>
          <CardContent>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleEditItem(item.id)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Floating create button */}
      <Button 
        className="fixed bottom-20 right-4 md:bottom-6 rounded-full"
        onClick={handleCreateItem}
      >
        <Plus />
      </Button>
    </div>
  );
};
```

### Primary Content CRUD (Creator Role)
```jsx
// REQUIRED: Content creators can create, edit, delete content
const PrimaryContentPage = () => {
  // CREATE content functionality
  const handleCreateContent = () => {
    // Open create content modal with rich text editor
  };
  
  // UPDATE content (edit)
  const handleEditContent = (contentId) => {
    // Open edit modal with existing content data
  };
  
  // DELETE content with confirmation
  const handleDeleteContent = (contentId) => {
    // Show confirmation dialog
  };
  
  return (
    <div>
      {/* Create content button for creators */}
      {user?.role === '[creator_role]' && (
        <Button onClick={handleCreateContent}>
          <Plus className="mr-2" />
          Create [Content Type]
        </Button>
      )}
      
      {/* Content items with edit/delete for own content */}
      {contentItems.map(item => (
        <Card key={item.id}>
          {/* Content display */}
          {item.authorId === user?.id && (
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleEditContent(item.id)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteContent(item.id)}>
                Delete
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
```

### Profile/Settings CRUD
```jsx
// REQUIRED: User can edit their profile information
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(user);
  
  const handleSaveProfile = async () => {
    // Save profile changes
    await updateUserProfile(profileData);
    setIsEditing(false);
  };
  
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <h2>Profile Information</h2>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <Input 
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="Full Name"
              />
              <Input 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="Email"
              />
              <Button type="submit">Save Changes</Button>
            </form>
          ) : (
            <div>
              <p>Name: {profileData.name}</p>
              <p>Email: {profileData.email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🎭 Interaction Patterns

### Loading States (REQUIRED)
```jsx
// REQUIRED: Loading states for all async operations
const LoadingCard = () => (
  <Card>
    <CardContent>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
  </Card>
);

// Use in all pages
{isLoading ? <LoadingCard /> : <ActualContent />}
```

### Empty States (REQUIRED)
```jsx
// REQUIRED: Empty states for all lists/collections
const EmptyNotebook = () => (
  <div className="text-center py-12">
    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
    <p className="text-muted-foreground mb-4">
      Create your first note to get started
    </p>
    <Button onClick={handleCreateNote}>
      <Plus className="mr-2" />
      Create First Note
    </Button>
  </div>
);
```

### Pull-to-Refresh (Mobile)
```jsx
// REQUIRED: Pull-to-refresh on mobile feeds
const FeedPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLatestPosts();
    setIsRefreshing(false);
  };
  
  return (
    <div className="touch-action-pan-y">
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {/* Feed content */}
    </div>
  );
};
```

### Swipe Actions (Mobile)
```jsx
// REQUIRED: Swipe-to-delete on mobile lists
const SwipeableNoteCard = ({ note, onDelete }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions background */}
      <div className="absolute right-0 top-0 bottom-0 bg-destructive flex items-center px-4">
        <Trash2 className="h-5 w-5 text-white" />
      </div>
      
      {/* Main card content */}
      <Card className="relative bg-background">
        <CardContent>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🗂️ Complete File Structure

Generate this exact structure with ALL files:

```
src/
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Layout components
│   │   ├── app-shell.tsx
│   │   ├── desktop-header.tsx   # REQUIRED: Desktop navigation
│   │   ├── mobile-bottom-nav.tsx
│   │   └── breadcrumbs.tsx
│   ├── forms/                   # Form components
│   │   ├── create-note-form.tsx
│   │   ├── create-post-form.tsx
│   │   ├── edit-profile-form.tsx
│   │   └── search-form.tsx
│   ├── cards/                   # Card variations
│   │   ├── note-card.tsx        # With edit/delete actions
│   │   ├── post-card.tsx        # With role-based actions
│   │   └── user-card.tsx
│   ├── interactive/             # Interactive components
│   │   ├── floating-action-button.tsx
│   │   ├── swipeable-card.tsx
│   │   ├── pull-to-refresh.tsx
│   │   └── bottom-sheet.tsx
│   └── pages/                   # All pages
│       ├── auth/
│       │   ├── login-page.tsx
│       │   ├── register-page.tsx
│       │   ├── forgot-password-page.tsx
│       │   └── onboarding-page.tsx
│       ├── main/
│       │   ├── feed-page.tsx    # With create/edit/delete
│       │   ├── chat-page.tsx    # With sticky input
│       │   ├── notebook-page.tsx # With FAB and CRUD
│       │   ├── profile-page.tsx # With edit functionality
│       │   ├── settings-page.tsx
│       │   └── notifications-page.tsx
│       ├── student/
│       │   ├── class-detail-page.tsx
│       │   ├── assignment-page.tsx
│       │   └── progress-page.tsx
│       ├── teacher/
│       │   ├── class-management-page.tsx
│       │   ├── create-assignment-page.tsx
│       │   └── analytics-page.tsx
│       └── parent/
│           ├── children-page.tsx
│           ├── school-compare-page.tsx
│           └── communication-page.tsx
├── hooks/                       # Custom hooks
│   ├── use-mobile.tsx
│   ├── use-crud.tsx             # Generic CRUD operations
│   ├── use-infinite-scroll.tsx
│   └── use-swipe-actions.tsx
├── stores/                      # Zustand stores
│   ├── auth-store.ts
│   ├── notes-store.ts           # With CRUD operations
│   ├── posts-store.ts           # With CRUD operations
│   ├── ui-store.ts
│   └── user-store.ts
├── services/                    # API services
│   ├── notes-service.ts         # Full CRUD
│   ├── posts-service.ts         # Full CRUD
│   ├── auth-service.ts
│   └── user-service.ts
└── types/                       # TypeScript types
    ├── auth.ts
    ├── notes.ts
    ├── posts.ts
    └── user.ts
```

## 📱 PWA Configuration

### manifest.json (REQUIRED)
```json
{
  "name": "[Your App Name]",
  "short_name": "[Short Name]",
  "description": "[App Description]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#[Your Primary Color]",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Required Icon Files
Create these exact files:
- `/public/icons/icon-192.png` (192x192)
- `/public/icons/icon-512.png` (512x512)
- `/public/apple-touch-icon.png` (180x180)
- `/public/favicon.ico` (32x32)

## 🚀 Implementation Checklist

### Phase 1: Core Foundation
- [ ] Set up project with TypeScript + Tailwind + shadcn/ui
- [ ] Implement color system with CSS variables
- [ ] Create desktop header navigation with search
- [ ] Create mobile bottom navigation
- [ ] Implement basic routing

### Phase 2: Essential Pages
- [ ] Authentication flow (login/register/onboarding)
- [ ] Feed page with filtering and creation
- [ ] Chat page with sticky bottom input
- [ ] Notebook page with floating action button
- [ ] Profile/Settings page with editing

### Phase 3: CRUD Operations
- [ ] Notes: Create, Read, Update, Delete
- [ ] Posts: Create, Read, Update, Delete (teachers)
- [ ] Profile: Read, Update
- [ ] Search: Universal search functionality

### Phase 4: Interactions & Polish
- [ ] Loading states for all async operations
- [ ] Empty states for all collections
- [ ] Pull-to-refresh on mobile
- [ ] Swipe actions for mobile lists
- [ ] Error handling and toast notifications

### Phase 5: PWA & Performance
- [ ] Add manifest.json and icons
- [ ] Implement service worker
- [ ] Optimize for performance
- [ ] Test on actual mobile devices

This comprehensive prompt addresses all the critical gaps identified and will generate a complete, functional application with proper desktop navigation, CRUD operations, and mobile-optimized interactions.
