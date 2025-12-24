# 🤖 Copilot Instructions - Thôn Phệ Tinh Không Game

## Project Overview
This is a space strategy game inspired by OGame, with storyline elements from the Chinese web novel "Thôn Phệ Tinh Không" (Swallowed Star). The game is built with Nuxt 4, nuxt-mongoose, and Tailwind CSS.

## Tech Stack
- **Framework**: Nuxt 4 (Vue 3, Composition API, TypeScript)
- **Styling**: Tailwind CSS with custom space-themed design system
- **Database**: MongoDB with nuxt-mongoose module
- **Authentication**: nuxt-auth-utils or custom JWT
- **State Management**: Vue composables and Pinia if needed
- Icon cho game phải tự custom svg icon để sử dụng icon phải phù hợp với chủ đề vũ trụ. phù hợp với tính huống cho game
- không sử dụng icon sẵn icon emoji icon unicode, icon nhựa 

## Code Style Guidelines
"Refer to style.md to build a vue component for the Planet Dashboard. Ensure it uses the color palette and glassmorphism style defined there."

### TypeScript
- Use strict TypeScript with proper type definitions
- Define interfaces for all data structures
- Use `defineProps` and `defineEmits` with TypeScript generics
- Prefer `const` over `let`, avoid `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Vue Components
- Use `<script setup lang="ts">` for all components
- Follow single-file component structure: `<script>`, `<template>`, `<style>`
- Use Composition API exclusively
- Name components with PascalCase
- Use `defineExpose` sparingly

### File Naming
- Components: PascalCase (e.g., `ResourceBar.vue`)
- Pages: kebab-case (e.g., `game-overview.vue`)
- Composables: camelCase with `use` prefix (e.g., `useResources.ts`)
- Server models: kebab-case with `.schema.ts` suffix (e.g., `player.schema.ts`)

## Game-Specific Terminology

### Resources (Vietnamese names used in-game)
- **Tinh Thạch** = Metal (primary resource)
- **Năng Lượng Vũ Trụ** = Crystal (secondary resource)  
- **Hồn Thạch** = Deuterium (rare resource)
- **Điện Năng** = Energy (power for buildings)

### Buildings
- **Mỏ Tinh Thạch** = Metal Mine
- **Máy Hấp Thụ Năng Lượng** = Crystal Mine
- **Đền Hồn Thạch** = Deuterium Synthesizer
- **Lò Năng Lượng** = Solar Plant / Power Plant
- **Kho Chứa** = Storage
- **Trung Tâm Chỉ Huy** = Command Center
- **Xưởng Đóng Tàu** = Shipyard
- **Viện Nghiên Cứu** = Research Lab

### Player Ranks
1. Chiến Binh Sơ Cấp (Lv 1-10)
2. Chiến Tướng (Lv 11-20)
3. Đại Tướng (Lv 21-30)
4. Nguyên Soái (Lv 31-40)
5. Đại Đế (Lv 41-50)
6. Vũ Trụ Cấp (Lv 51+)

## Design System

### Colors
```css
/* Use these CSS variables defined in main.css */
--color-primary: #0ea5e9;      /* Cosmic Blue */
--color-secondary: #8b5cf6;    /* Soul Purple */
--color-accent: #f59e0b;       /* Energy Gold */
--color-bg-primary: #0f172a;   /* Space Dark */
--color-bg-secondary: #1e293b;
--color-bg-tertiary: #334155;
```

### UI Patterns
- Glass morphism for cards and panels
- Neon glow effects for interactive elements
- Hexagonal patterns for backgrounds
- Animated star field backgrounds
- Progress bars with gradient fills

## API Structure

### Route Conventions
- `GET /api/[resource]` - List all
- `GET /api/[resource]/[id]` - Get one
- `POST /api/[resource]` - Create
- `PUT /api/[resource]/[id]` - Update
- `DELETE /api/[resource]/[id]` - Delete

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Game Formulas

### Resource Production (per hour)
```typescript
metalProduction = 30 * level * Math.pow(1.1, level);
crystalProduction = 20 * level * Math.pow(1.1, level);
deuteriumProduction = 10 * level * Math.pow(1.1, level) * (1.36 - 0.004 * planetTemp);
energyProduction = 20 * level * Math.pow(1.1, level);
```

### Building Costs
```typescript
cost = baseCost * Math.pow(factor, level - 1);
buildTime = (metalCost + crystalCost) / (2500 * (1 + roboticsLevel)) * 3600; // seconds
```

## Database Schemas

### Player Schema Fields
- `username`, `email`, `passwordHash`
- `level`, `experience`
- `rank` (enum based on level)
- `planets[]` (references)
- `createdAt`, `lastActive`

### Planet Schema Fields
- `name`, `coordinates` (galaxy, system, position)
- `owner` (reference to Player)
- `resources` (metal, crystal, deuterium, energy)
- `buildings` (array of building levels)
- `temperature`, `diameter`
- `lastResourceUpdate`

### Building Schema Fields
- `type` (enum)
- `level`
- `planet` (reference)
- `isUpgrading`, `upgradeEndTime`

## Component Patterns

### Resource Display
```vue
<ResourceBar 
  :metal="resources.metal" 
  :crystal="resources.crystal"
  :deuterium="resources.deuterium"
  :energy="resources.energy"
/>
```

### Building Card
```vue
<BuildingCard
  :building="building"
  :can-upgrade="canUpgrade"
  @upgrade="handleUpgrade"
/>
```

## Testing Approach
- Use Vitest for unit tests
- Test composables and utility functions
- Test API endpoints with mock database
- E2E tests with Playwright (future)

## Performance Guidelines
- Use `<Suspense>` for async components
- Implement virtual scrolling for long lists
- Cache resource calculations
- Use WebSocket for real-time updates (future)
- Lazy load galaxy view data

## Security Considerations
- Validate all user inputs on server
- Use rate limiting on API endpoints
- Sanitize database queries
- Never trust client-side game calculations
- Implement action verification on server

## Git Workflow
- Main branch: production-ready code
- Feature branches: `feature/[name]`
- Bug fixes: `fix/[name]`
- Commit messages: Conventional Commits format

## Common Tasks

### Adding a New Building Type
1. Add to building enum in types
2. Add base stats in game config
3. Create or update building card component
4. Add server-side validation
5. Update production formulas if needed

### Adding a New Resource
1. Add to resource types
2. Update planet schema
3. Update ResourceBar component
4. Add production/consumption logic
5. Update all relevant API endpoints

## Useful Commands
```bash
# Development
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```
