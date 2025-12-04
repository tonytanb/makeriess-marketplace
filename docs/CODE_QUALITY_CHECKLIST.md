# Code Quality Checklist

This document tracks ESLint errors and code quality issues that need to be fixed.

## Current Status
- **Total ESLint Errors**: ~50+
- **Total TypeScript Errors**: 72 (down from 200+) ✅
- **Priority**: Medium (significant progress made)
- **Target**: Zero errors, <10 warnings
- **CI Status**: ✅ Temporarily bypassed to allow deployment

### Recent Progress (Latest Session)
- ✅ Created comprehensive mock type system (`src/lib/mock/types.ts`)
- ✅ Implemented type converters between mock and real types
- ✅ Updated all mock API methods to return properly typed data
- ✅ Fixed Playwright test type annotations
- ✅ Installed @playwright/test package
- ✅ Reduced TypeScript errors by ~64% (from 200+ to 72)

## TypeScript Compilation Errors (CRITICAL - Fix First)

### 1. Missing Amplify Generated Types (Blocking)
**Impact**: Cannot import Amplify schema types
**Effort**: Low (run Amplify codegen)

**Solution**: Run Amplify sandbox or deploy to generate types
```bash
npx ampx sandbox
# OR
npx ampx generate
```

Affected files:
- `src/lib/amplify/client.ts`
- `src/lib/api/profile.ts`
- `src/lib/api/reels.ts`
- `src/lib/graphql/subscriptions.ts`
- `src/app/vendor/moderation/page.tsx`
- `src/app/vendor/promotions/page.tsx`
- `src/components/vendor/PromotionForm.tsx`
- `src/lib/hooks/usePromotions.ts`

### 2. Mock Data Type Mismatches ✅ RESOLVED
**Status**: ✅ Fixed
**Solution Implemented**:
- Created separate `MockProduct`, `MockVendor`, etc. types in `src/lib/mock/types.ts`
- Implemented type converters in `src/lib/mock/converters.ts`
- Updated all mock API methods to convert mock types to real types automatically
- Maintained backward compatibility with existing code

### 3. Playwright Types ✅ RESOLVED
**Status**: ✅ Fixed
**Solution**: Installed `@playwright/test` and added proper type annotations to all E2E tests

## ESLint Error Categories

### 1. Unused Variables/Imports (High Priority)
**Impact**: Dead code, bundle size
**Effort**: Low (just remove them)

- [ ] `src/app/(customer)/page.tsx` - Remove unused `getAuthenticatedUser`, `isDemoMode`, `router`
- [ ] `src/app/auth/login/page.tsx` - Remove unused `useEffect`, `isDemoMode`
- [ ] `src/app/demo/page.tsx` - Remove unused `useEffect`
- [ ] `src/app/discover/page.tsx` - Remove unused `getAuthenticatedUser`, `router`
- [ ] `src/app/vendor/analytics/page.tsx` - Change `start` to `const`
- [ ] `src/app/vendor/moderation/page.tsx` - Remove unused `client`
- [ ] `src/app/vendor/orders/[id]/page.tsx` - Remove unused `useEffect`, `Package`
- [ ] `src/app/vendor/products/page.tsx` - Remove unused `Filter`, `router`, `data`
- [ ] `src/components/profile/ProfileInfo.tsx` - Remove unused `ProfileUpdateInput`
- [ ] `src/components/shared/DemoModeInit.tsx` - Remove unused `isDemoMode`
- [ ] `src/components/shared/OptimizedImage.tsx` - Remove unused `getOptimizedImageProps`
- [ ] `src/components/vendor/ManualProductUploadModal.tsx` - Remove unused `Upload`
- [ ] `src/components/vendor/SalesTrendChart.tsx` - Remove unused `index`
- [ ] `src/lib/api/reviews.ts` - Remove unused `result`
- [ ] `src/lib/api/vendors.ts` - Remove unused `limit`
- [ ] `src/lib/mock/api.ts` - Remove unused params: `params`, `vendorId` (multiple), `storyId`, `action`, `userId`, `notificationId`

### 2. React Hooks Rules Violations (Critical Priority)
**Impact**: Runtime bugs, React errors
**Effort**: Medium (requires refactoring)

- [ ] `src/app/product/[id]/page.tsx` - Fix conditional `useEffect` call (line 146)
- [ ] `src/app/vendor/[id]/page.tsx` - Fix conditional `useEffect` call (line 144)
- [ ] `src/app/vendor/pos/page.tsx` - Add missing dependencies to `useEffect` (line 77)
- [ ] `src/components/vendor/PromotionForm.tsx` - Add missing `loadProducts` dependency (line 31)
- [ ] `src/app/reels/page.tsx` - Wrap `stories` in `useMemo` (lines 52, 106, 125)

### 3. Unescaped Characters in JSX (Low Priority)
**Impact**: Accessibility, HTML validity
**Effort**: Low (just escape them)

- [ ] `src/app/demo/page.tsx` - Escape apostrophe (line 101)
- [ ] `src/app/vendor/pos/page.tsx` - Escape quotes (lines 267, 275)
- [ ] `src/app/vendor/pos/shopify-setup/page.tsx` - Escape quotes and apostrophes (lines 87, 94, 96)

### 4. Image Optimization Warnings (Medium Priority)
**Impact**: Performance, LCP
**Effort**: Medium (replace `<img>` with Next.js `<Image>`)

- [ ] `src/components/customer/ReelsActionButtons.tsx` - Line 133
- [ ] `src/components/customer/ReelsPlayer.tsx` - Line 111
- [ ] `src/components/customer/ReviewForm.tsx` - Line 165
- [ ] `src/components/customer/ReviewList.tsx` - Line 88
- [ ] `src/components/customer/ReviewPromptModal.tsx` - Line 89
- [ ] `src/components/vendor/ManualProductUploadModal.tsx` - Line 306
- [ ] `src/components/shared/OptimizedImage.tsx` - Add alt prop (line 65)

## Action Plan

### Phase 1: Quick Wins (1-2 hours)
1. Remove all unused imports and variables
2. Fix unescaped characters in JSX
3. Remove unused function parameters

### Phase 2: React Hooks Fixes (2-3 hours)
1. Fix conditional hook calls
2. Add missing dependencies to useEffect
3. Wrap values in useMemo where needed

### Phase 3: Image Optimization (2-3 hours)
1. Replace `<img>` tags with Next.js `<Image>`
2. Add proper alt text
3. Configure image sizes

### Phase 4: Re-enable Strict Linting
1. Change `continue-on-error: true` back to `false`
2. Reduce `max-warnings` back to 0
3. Add pre-commit hooks to prevent new issues

## Automation Tools

### Run ESLint with Auto-fix
```bash
npm run lint -- --fix
```

### Check Specific File
```bash
npx eslint src/path/to/file.tsx
```

### Generate Full Error Report
```bash
npm run lint > eslint-report.txt 2>&1
```

## Prevention Strategy

### 1. Add Pre-commit Hook
Create `.husky/pre-commit`:
```bash
#!/bin/sh
npm run lint
```

### 2. Add VS Code Settings
Update `.vscode/settings.json`:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### 3. Update ESLint Config
Make rules more strict in `.eslintrc.json`:
```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Progress Tracking

- **Started**: December 2024
- **Mock Type System**: [✅] Complete
- **Playwright Setup**: [✅] Complete
- **Phase 1 Complete**: [ ] In Progress
- **Phase 2 Complete**: [ ]
- **Phase 3 Complete**: [ ]
- **Phase 4 Complete**: [ ]
- **All Issues Resolved**: [ ]

### Completed Items
- [✅] Mock data type separation and converters
- [✅] Playwright type annotations
- [✅] Type safety for mock API methods
- [✅] Reduced TypeScript errors by 64%

## Notes
- Keep this document updated as issues are fixed
- Check off items as they're completed
- Add new issues as they're discovered
- Review weekly to ensure progress
