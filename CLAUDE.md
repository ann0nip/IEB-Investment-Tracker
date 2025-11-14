# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IEB+ Investment Tracker is a Next.js 16 application for tracking investment portfolios including CEDEARs (Argentine stock market certificates), corporate bonds, and sovereign bonds. The application uses localStorage for client-side data persistence.

## Development Commands

**Package Manager**: This project uses **Yarn 1.22.22** as the official package manager. Do not mix npm, pnpm, or other package managers.

### Start Development Server
```bash
yarn dev
```
Opens development server at http://localhost:3000

### Build for Production
```bash
yarn build
```
Creates optimized production build with TypeScript type checking.

### Start Production Server
```bash
yarn start
```
Note: This runs both `yarn build` and starts the production server sequentially.

### Code Quality (Biome)
```bash
# Lint only
yarn lint

# Lint and auto-fix
yarn lint:fix

# Format code
yarn format

# Check all (lint + format)
yarn check

# Check and auto-fix all
yarn check:fix
```

**Note**: This project uses [Biome](https://biomejs.dev) instead of ESLint and Prettier for better performance and simpler configuration.

## Architecture

### Tech Stack
- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x with strict mode enabled
- **Styling**: Tailwind CSS 4.1.9 with shadcn/ui components
- **UI Components**: Radix UI primitives
- **Charts**: Recharts 2.15.4
- **Forms**: React Hook Form 7.60.0 with Zod validation
- **Analytics**: Vercel Analytics

### Project Structure

```
app/
  ├── layout.tsx          # Root layout with Vercel Analytics integration
  ├── page.tsx            # Main investment tracker application (client component)
  └── globals.css         # Global Tailwind styles

components/
  ├── ui/                 # shadcn/ui component library
  │   ├── button.tsx
  │   ├── card.tsx
  │   ├── input.tsx
  │   ├── select.tsx
  │   ├── table.tsx
  │   └── badge.tsx
  └── theme-provider.tsx  # Next-themes provider

lib/
  └── utils.ts            # Utility functions (cn helper for Tailwind)

public/                   # Static assets (icons, images)
```

### Key Configuration

**Path Aliases** (tsconfig.json):
- `@/*` maps to root directory
- Example: `@/components/ui/button` → `/components/ui/button.tsx`

**shadcn/ui Configuration** (components.json):
- Style: "new-york"
- Base color: "neutral"
- Icon library: Lucide React
- CSS variables enabled

**Next.js Configuration** (next.config.mjs):
- TypeScript type checking is enabled (for better code quality)
- Images are unoptimized (for static export compatibility)

**Biome Configuration** (biome.json):
- All-in-one toolchain for linting and formatting
- Faster alternative to ESLint + Prettier
- Configured with recommended rules
- Auto-organize imports enabled
- Git integration for VCS-aware linting

**Package Manager** (package.json):
- Official package manager: Yarn 1.22.22
- Node.js version required: >= 22.0.0
- `packageManager` field enforces Yarn usage
- `engines` field documents version requirements

**Environment** (.nvmrc):
- Node.js version: 22
- Use with `nvm use` to ensure correct Node version

**Code Quality**:
- `biome.json` - Linting and formatting configuration (all-in-one)
- `.gitignore` - Git exclusions (build artifacts, dependencies, IDE files)

### Data Architecture

**State Management**:
- Client-side state using React useState/useEffect
- No external state management library (Redux, Zustand, etc.)
- localStorage for persistence

**Data Models**:

```typescript
type Asset = {
  id: number
  category: string        // e.g., "Equities Growth (CEDEARs)", "Fixed Income Corporativo"
  ticker: string         // e.g., "AMZN", "YPFDD"
  percent: number        // Initial allocation percentage
  months: Record<string, { amount: number; qty: number }>  // Cumulative monthly data
}

type Operation = {
  date: string          // Format: "DD/MM/YYYY"
  ticker: string
  amount: number        // Investment amount in USD
  qty: number          // Quantity of shares/bonds
}
```

**localStorage Keys**:
- `investmentAssets` - Asset array with monthly accumulations
- `investmentOperations` - Operation history
- `investmentCurrentValues` - Current market values by ticker

### Core Calculations

The main page (app/page.tsx) implements several financial calculations:

1. **Cumulative Investment**: Sum of all monthly amounts per asset
2. **Average Price**: Total amount / Total quantity
3. **Dynamic Percentage**: Asset cumulative / Total portfolio investment
4. **Gain/Loss**: ((Current Value - Invested) / Invested) * 100

All calculations are performed client-side in real-time.

### Component Library

This project uses shadcn/ui, a copy-paste component library built on Radix UI and Tailwind CSS. Components are located in `components/ui/` and can be customized directly.

To add new shadcn/ui components (if needed):
```bash
npx shadcn-ui@latest add [component-name]
```

### Styling Approach

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Used for theming (see globals.css)
- **cn() Utility**: Combines clsx and tailwind-merge for conditional classes
  - Location: `lib/utils.ts:4`
  - Usage: `cn("base-class", condition && "conditional-class")`

### Important Notes

1. **Client Component**: The main app (app/page.tsx) uses `'use client'` directive because it requires browser APIs (localStorage) and interactive state.

2. **Date Format**: Dates use DD/MM/YYYY format throughout the application. When working with dates, maintain this format for consistency.

3. **Build Configuration**: TypeScript type checking is now enabled. The build will fail if there are type errors, ensuring better code quality.

4. **No Backend**: This is a fully client-side application. All data is stored in localStorage. There are no API routes or database connections.

5. **i18n**: The application is in Spanish (lang="es" in layout.tsx). UI text, labels, and metadata should be in Spanish.

## Working with This Codebase

### Adding New Assets
Add to the `initialAssets` array in app/page.tsx:28-48

### Modifying Calculations
Core calculation functions are in app/page.tsx:125-152

### Styling Changes
- Use Tailwind utilities directly in JSX
- Global styles: app/globals.css
- Component-specific: Inline className props

### Type Safety
- All components use TypeScript
- Asset and Operation types defined in app/page.tsx:12-25
- Strict mode enabled in tsconfig.json

## Project Health Checklist

✅ **Configuration Files Present:**
- `.gitignore` - Git exclusions
- `biome.json` - Linting and formatting (Biome)
- `.npmrc` - NPM configuration
- `.nvmrc` - Node version specification (v22)
- `README.md` - Project documentation
- `CLAUDE.md` - AI assistant guidance
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - shadcn/ui configuration
- `package.json` - Dependencies and scripts

✅ **Package Manager:**
- Using Yarn 1.22.22 exclusively
- Single lock file (yarn.lock)
- Package manager enforcement via `packageManager` field

✅ **Build System:**
- TypeScript type checking enabled
- Biome for linting and formatting
- Next.js 16 compatible configuration

✅ **Code Quality:**
- Biome configured with recommended rules
- Auto-format on save (if IDE configured)
- Import organization enabled
