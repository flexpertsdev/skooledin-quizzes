/**
 * Responsive Layout Patterns Guide
 * 
 * Purpose: Comprehensive guide for structuring common page layouts with proper dvh, mobile breakpoints, and desktop scaling
 * 
 * Current challenges:
 * - AI builders often use nested flex/grid layouts that break on mobile
 * - Improper viewport height calculations causing mobile layout issues
 * - Lack of understanding about mobile-first responsive patterns
 * - Overuse of min-h-screen instead of proper dynamic viewport height
 * - Complex nested class calculations that fail across breakpoints
 * - Poor understanding of when to use different layout components
 * 
 * Implementation needs:
 * - Clear patterns for common page types (settings, forms, maps, e-commerce, etc.)
 * - Proper dvh implementation for mobile browsers
 * - Component choice guidance (modals vs bottom sheets vs drawers)
 * - Mobile-first examples with progressive enhancement
 * - Solutions for common AI builder layout mistakes
 * 
 * v1 Created (2025-06-05):
 * - Complete layout pattern library for mobile-first responsive design
 * - Covers all major page types with working examples
 * - Addresses common AI builder mistakes and solutions
 */

# Responsive Layout Patterns Guide

This comprehensive guide provides battle-tested layout patterns for common page types, designed mobile-first with proper viewport handling and progressive desktop enhancement. Each pattern avoids common AI builder mistakes and provides clear, maintainable solutions.

## Essential Mobile Layout Foundation

### Dynamic Viewport Height (DVH) Solution

The biggest mobile layout issue is browser chrome (address bars, tab bars) that appears/disappears, breaking `min-h-screen` layouts.

**Required JavaScript** (add to your main layout):
```javascript
function setDynamicVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setDynamicVH);
window.addEventListener('orientationchange', setDynamicVH);
setDynamicVH();
```

**Tailwind Configuration** (add to tailwind.config.js):
```javascript
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.h-dvh': { height: 'calc(var(--vh, 1vh) * 100)' },
        '.min-h-dvh': { 'min-height': 'calc(var(--vh, 1vh) * 100)' },
        '.max-h-dvh': { 'max-height': 'calc(var(--vh, 1vh) * 100)' },
      });
    }),
  ],
}
```

**Usage**: Replace every `min-h-screen` with `min-h-dvh`.

## Complete Page Layout Patterns

### 1. Settings Pages

```jsx
export function SettingsPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center">
          <button className="md:hidden mr-3">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold">Settings</h1>
        </div>
      </header>

      {/* Main Content - Always Centered */}
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <div className="space-y-6">
          
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">John Doe</p>
                  <p className="text-sm text-muted-foreground truncate">john@example.com</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Group */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Setting Item Pattern */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Mobile Bottom Spacing */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
```

### 2. Multi-Step Forms

```jsx
export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  return (
    <div className="min-h-dvh bg-background">
      {/* Progress Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Progress */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
          {/* Desktop Title */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">Create Your Profile</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-muted/50 p-6">
          <nav className="space-y-4">
            {[
              { step: 1, title: 'Basic Info', description: 'Name and email' },
              { step: 2, title: 'Profile', description: 'Photo and bio' },
              { step: 3, title: 'Preferences', description: 'Settings' },
              { step: 4, title: 'Review', description: 'Confirm details' }
            ].map((item) => (
              <div
                key={item.step}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg",
                  currentStep === item.step
                    ? "bg-primary text-primary-foreground"
                    : currentStep > item.step
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  currentStep >= item.step ? "bg-background text-foreground" : "bg-muted"
                )}>
                  {currentStep > item.step ? <Check className="w-3 h-3" /> : item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm opacity-75">{item.description}</p>
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Form */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-lg">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl md:text-2xl">
                  Step {currentStep} Title
                </CardTitle>
                <CardDescription>Step description</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step-specific content */}
                <div className="space-y-4">
                  <Input placeholder="Enter information..." />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Navigation */}
          <div className="sticky bottom-0 bg-background border-t p-4">
            <div className="container mx-auto max-w-lg flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              >
                {currentStep === totalSteps ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 3. One Question Per Page Forms

```jsx
export function SingleQuestionForm() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 8;

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentQuestion} / {totalQuestions}
        </span>
        <Button variant="ghost" size="sm">Skip</Button>
      </header>

      {/* Progress */}
      <Progress value={(currentQuestion / totalQuestions) * 100} className="h-1" />

      {/* Question Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 md:space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              What's your primary goal?
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              This helps us personalize your experience
            </p>
          </div>

          {/* Large Touch-Friendly Options */}
          <div className="space-y-3">
            {[
              { id: 'fitness', label: 'Get fit and healthy', icon: Activity },
              { id: 'weight', label: 'Lose weight', icon: TrendingDown },
              { id: 'strength', label: 'Build strength', icon: Zap },
              { id: 'maintenance', label: 'Maintain current health', icon: Heart }
            ].map((option) => (
              <button
                key={option.id}
                className="w-full p-4 md:p-6 border rounded-lg text-left hover:bg-muted/50 transition-colors flex items-center space-x-4 min-h-[60px]"
                onClick={() => handleAnswer(option.id)}
              >
                <option.icon className="h-6 w-6 text-primary" />
                <span className="text-lg font-medium">{option.label}</span>
                <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="p-4">
        <Button 
          className="w-full h-12 text-lg"
          onClick={() => setCurrentQuestion(currentQuestion + 1)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
```

### 4. Interactive Maps (Airbnb/Uber Style)

```jsx
export function InteractiveMapPage() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  return (
    <div className="h-dvh bg-background relative overflow-hidden">
      
      {/* Search Header */}
      <header className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="bg-background/95 backdrop-blur border rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 p-3">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <Input 
                placeholder="Where to?"
                className="border-0 bg-transparent focus-visible:ring-0 text-lg"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="h-full w-full">
        <div className="h-full w-full bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Map Component</p>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 bottom-4 md:bottom-24 z-30">
        <div className="flex flex-col space-y-2">
          <Button size="icon" variant="secondary" className="shadow-lg">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="shadow-lg">
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="shadow-lg">
            <Locate className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block absolute left-0 top-0 bottom-0 w-96 bg-background border-r z-30 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Nearby Places</h2>
            <p className="text-muted-foreground">12 locations found</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">Location {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">2.3 km away</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$25</p>
                      <p className="text-xs text-muted-foreground">per hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Sheet */}
      <BottomSheet isOpen={isBottomSheetOpen} onOpenChange={setIsBottomSheetOpen} className="md:hidden">
        <BottomSheetHeader>
          <BottomSheetTitle>Nearby Places</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">Location {i + 1}</h3>
                <p className="text-sm text-muted-foreground">2.3 km away</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$25</p>
              </div>
            </div>
          ))}
        </BottomSheetContent>
      </BottomSheet>

      {/* Mobile List Toggle */}
      <Button 
        className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 shadow-lg"
        onClick={() => setIsBottomSheetOpen(true)}
      >
        <List className="h-4 w-4 mr-2" />View List
      </Button>

    </div>
  );
}
```

## Common AI Builder Mistakes & Solutions

### ❌ Mistake 1: Nested Flex Calculations

**Problem**: AI creates deeply nested flex containers:

```jsx
// DON'T DO THIS
<div className="flex flex-col h-screen">
  <div className="flex-1 flex">
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-between">
          {/* Content gets lost */}
        </div>
      </div>
    </div>
  </div>
</div>
```

**Solution**: Use simple, predictable layouts:

```jsx
// DO THIS INSTEAD
<div className="min-h-dvh flex flex-col">
  <header className="border-b p-4">{/* Header */}</header>
  <main className="flex-1 overflow-y-auto p-4">{/* Main */}</main>
  <footer className="border-t p-4">{/* Footer */}</footer>
</div>
```

### ❌ Mistake 2: Wrong Viewport Height Usage

**Problem**: Using `min-h-screen` on mobile:

```jsx
// DON'T DO THIS
<div className="min-h-screen"> {/* Breaks on mobile browsers */}
```

**Solution**: Always use dynamic viewport height:

```jsx
// DO THIS INSTEAD
<div className="min-h-dvh">
```

### ❌ Mistake 3: Overcomplicating Responsive Breakpoints

**Problem**: Complex responsive patterns:

```jsx
// DON'T DO THIS
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-4">
```

**Solution**: Keep it simple:

```jsx
// DO THIS INSTEAD
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### ❌ Mistake 4: Small Touch Targets

**Problem**: Buttons too small for mobile:

```jsx
// DON'T DO THIS
<button className="p-1 text-xs"> {/* Too small */}
```

**Solution**: Ensure minimum 44px touch targets:

```jsx
// DO THIS INSTEAD
<Button size="sm" className="min-h-[44px] min-w-[44px]">
```

### ❌ Mistake 5: Content Stretching on Desktop

**Problem**: Content spreads too wide:

```jsx
// DON'T DO THIS
<div className="w-full p-4"> {/* Stretches too wide */}
```

**Solution**: Use proper containers:

```jsx
// DO THIS INSTEAD
<div className="container mx-auto max-w-4xl px-4">
```

## Component Choice Guide

### When to Use Each Overlay Component

**Modal Dialog** - Critical actions, desktop-first:
```jsx
<Dialog>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Delete Account</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Bottom Sheet** - Mobile-first, variable content:
```jsx
<BottomSheet open={isOpen} onOpenChange={setIsOpen}>
  <BottomSheetContent>
    <BottomSheetHeader>
      <BottomSheetTitle>Filter Options</BottomSheetTitle>
    </BottomSheetHeader>
    <div className="space-y-4 py-4">
      {/* Content */}
    </div>
  </BottomSheetContent>
</BottomSheet>
```

### Filter Bottom Sheets

Replace dropdowns with touch-friendly filters:

```jsx
export function FilterBottomSheet({ isOpen, onOpenChange, filters, onFiltersChange }) {
  return (
    <BottomSheet open={isOpen} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-h-[90vh]">
        <BottomSheetHeader>
          <BottomSheetTitle>Filter Results</BottomSheetTitle>
        </BottomSheetHeader>

        <div className="space-y-6 py-4 overflow-y-auto">
          
          {/* Price Range - Big Touch Targets */}
          <div className="space-y-3">
            <h3 className="font-medium">Price Range</h3>
            <div className="grid grid-cols-2 gap-3">
              {['$0-50', '$50-100', '$100-200', '$200+'].map((range) => (
                <Button
                  key={range}
                  variant={filters.priceRange === range ? "default" : "outline"}
                  className="h-12"
                  onClick={() => onFiltersChange({ ...filters, priceRange: range })}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories - Multiple Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Electronics', 'Clothing', 'Books', 'Home'].map((category) => (
                <Button
                  key={category}
                  variant={filters.categories?.includes(category) ? "default" : "outline"}
                  className="h-12"
                  onClick={() => {
                    const newCategories = filters.categories?.includes(category)
                      ? filters.categories.filter(c => c !== category)
                      : [...(filters.categories || []), category];
                    onFiltersChange({ ...filters, categories: newCategories });
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onFiltersChange({})}>
            Clear All
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </div>

      </BottomSheetContent>
    </BottomSheet>
  );
}
```

## Quick Reference

### Essential Classes

```css
/* Use these instead of h-screen */
.h-dvh { height: calc(var(--vh, 1vh) * 100); }
.min-h-dvh { min-height: calc(var(--vh, 1vh) * 100); }

/* Container pattern */
.container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-xl

/* Touch target minimum */
.min-h-[44px] min-w-[44px]

/* Common responsive patterns */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
flex flex-col md:flex-row
space-y-4 md:space-y-0 md:space-x-4
```

### Component Decision Tree

```
Need overlay?
├── Critical action/confirmation → Modal Dialog
├── Mobile-first with variable content → Bottom Sheet  
├── Navigation/tools → Side Drawer
└── Filters on mobile → Filter Bottom Sheet

Need layout?
├── Settings/preferences → Single column with cards
├── Complex form → Multi-step with progress
├── Simple form → One question per page
├── Location-based → Map with overlay
├── Shopping → Product detail layout
├── Communication → Chat layout
├── Data management → File browser
├── Data analysis → Resizable panels
├── Social content → Feed layout
└── Media browsing → Photo gallery
```

This guide provides the foundation for creating responsive, mobile-first layouts that work consistently across all devices while avoiding common AI builder pitfalls. Always prioritize user experience over visual complexity, and test thoroughly on real devices.
