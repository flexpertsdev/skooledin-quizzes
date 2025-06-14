# CLAUDE.md - skooledin-quizzes Project

## Project Overview
Educational quiz and worksheet application with AI-powered processing.

## Technology Stack
- **Frontend**: React 18.3, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Functions)
- **AI Integration**: OpenAI API for worksheet processing
- **Deployment**: Netlify

## Deployment Information

### GitHub Repository
- **URL**: https://github.com/flexpertsdev/skooledin-quizzes
- **Created**: 2025-06-14

### Netlify Deployment
- **Live URL**: https://skooledin-quizzes.netlify.app
- **Admin URL**: https://app.netlify.com/projects/skooledin-quizzes
- **Project ID**: c1babd8e-0072-4218-a47c-f55cd4646074
- **Deploy ID**: 684cd5ada49b72b9e53d083e

## Applied AI Guides
The following AI guides have been imported and applied to this project (located in `.ai-guides/`):
- **atomic-design-components-guide.md** - Component organization patterns
- **design-system-prompt-guide-v2.md** - Design system implementation
- **responsive-layout-patterns-guide.md** - Mobile-first responsive patterns
- **supabase-migration-guide.md** - Supabase integration best practices

## Audit Status
- **Audit Date**: 2025-06-14
- **Audit Report**: See `AI-AUDIT-REPORT.md` for comprehensive analysis
- **Priority Issues**: 
  - Mobile viewport fixes (min-h-screen → min-h-dvh)
  - Atomic design structure implementation
  - Service layer abstraction for Supabase
  - Mobile touch targets (44px minimum)
  - Responsive breakpoint patterns

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Implementation Roadmap

### Phase 1: Critical Mobile Fixes (Week 1)
- [ ] Fix all viewport height issues
- [ ] Implement dynamic viewport solution
- [ ] Create service layer abstractions
- [ ] Fix touch target sizes

### Phase 2: Architecture (Week 2)
- [ ] Reorganize into atomic design structure
- [ ] Implement proper state management (Zustand)
- [ ] Add responsive breakpoints

### Phase 3: User Experience (Week 3)
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Accessibility improvements

### Phase 4: Enhancement (Week 4)
- [ ] Add PWA capabilities
- [ ] Performance optimizations
- [ ] Testing infrastructure

## Quick Wins (Do Today)
1. Replace all `min-h-screen` with `min-h-dvh`
2. Add `min-h-[44px]` to all buttons
3. Create service interface for Supabase calls
4. Add responsive grid patterns

## Notes
- Bundle size warning: Main chunk is over 1MB - consider code splitting
- Browserslist data is outdated - run `npx update-browserslist-db@latest`
- No tests currently implemented
- Supabase functions need environment configuration

---

*Generated with Claude Code on 2025-06-14*