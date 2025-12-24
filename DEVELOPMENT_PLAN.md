# 🌌 Thôn Phệ Tinh Không - Game Development Plan

> **Clone OGame với cốt truyện từ tiểu thuyết "Thôn Phệ Tinh Không" (Swallowed Star)**

## 📖 Tổng Quan

### Concept
Game chiến lược không gian thời gian thực dựa trên OGame, kết hợp với thế giới quan của Thôn Phệ Tinh Không:
- **Bối cảnh**: Trái Đất sau Đại Niết Bàn, nhân loại tiến hóa thành Chiến Sĩ & Tinh Thần Niệm Sư
- **Mục tiêu**: Xây dựng căn cứ, phát triển lực lượng, chinh phục vũ trụ
- **Gameplay**: Quản lý tài nguyên, nghiên cứu công nghệ, xây dựng hạm đội, chiến đấu

### Tech Stack
- **Frontend**: Nuxt 4, Tailwind CSS, Vue 3
- **Backend**: Nuxt Server Routes, Nitro
- **Database**: MongoDB với nuxt-mongoose
- **Auth**: nuxt-auth-utils
- **Real-time**: WebSocket/SSE (future)

---

## 🎯 MVP Features (Phase 1)

### 1. Hệ thống Người dùng
- [ ] Đăng ký/Đăng nhập
- [ ] Profile người chơi (Chiến Sĩ)
- [ ] Cấp độ & Kinh nghiệm

### 2. Hệ thống Hành Tinh
- [ ] Mỗi người chơi có 1 hành tinh mẫu tinh ban đầu
- [ ] Hiển thị tổng quan hành tinh
- [ ] Slot xây dựng công trình

### 3. Hệ thống Tài Nguyên
- [ ] **Tinh Thạch** (tương đương Metal) - Khoáng sản vũ trụ
- [ ] **Năng Lượng Vũ Trụ** (tương đương Crystal) - Năng lượng tinh thuần
- [ ] **Hồn Thạch** (tương đương Deuterium) - Năng lượng tinh thần
- [ ] **Điện Năng** - Năng lượng vận hành
- [ ] Sản xuất tài nguyên theo thời gian thực

### 4. Hệ thống Công Trình
- [ ] **Mỏ Tinh Thạch** - Khai thác khoáng sản
- [ ] **Máy Hấp Thụ Năng Lượng** - Thu thập năng lượng vũ trụ
- [ ] **Đền Hồn Thạch** - Tinh luyện hồn thạch
- [ ] **Lò Năng Lượng** - Cung cấp điện năng
- [ ] **Kho Chứa** - Lưu trữ tài nguyên
- [ ] **Trung Tâm Chỉ Huy** - Mở khóa tính năng

### 5. Hệ thống Nghiên Cứu
- [ ] **Viện Nghiên Cứu** (công trình)
- [ ] Các công nghệ cơ bản:
  - Công nghệ Năng lượng
  - Công nghệ Giáp
  - Công nghệ Vũ khí
  - Công nghệ Động cơ

### 6. Hệ thống Chiến Hạm (Basic)
- [ ] **Xưởng Đóng Tàu** (công trình)
- [ ] Các loại tàu cơ bản:
  - Tiểu Chiến Hạm (Light Fighter)
  - Vận Tải Hạm (Cargo Ship)
  - Trinh Sát Hạm (Probe)

---

## 📅 Development Phases

### Phase 1: MVP Core (Tuần 1-2)
- [x] Setup project structure
- [ ] Database models
- [ ] Authentication
- [ ] Basic UI layout
- [ ] Resource system
- [ ] Building system

### Phase 2: Gameplay (Tuần 3-4)
- [ ] Research system
- [ ] Shipyard system
- [ ] Fleet movement
- [ ] Basic combat

### Phase 3: Multiplayer (Tuần 5-6)
- [ ] Galaxy view
- [ ] Player interaction
- [ ] Alliance system
- [ ] Messages

### Phase 4: Polish (Tuần 7-8)
- [ ] Animations
- [ ] Sound effects
- [ ] Mobile responsive
- [ ] Performance optimization

---

## 🎨 Design System

### Color Palette (Swallowed Star Theme)
```css
/* Primary - Cosmic Blue */
--primary: #0ea5e9;
--primary-dark: #0284c7;

/* Secondary - Soul Purple */
--secondary: #8b5cf6;
--secondary-dark: #7c3aed;

/* Accent - Energy Gold */
--accent: #f59e0b;
--accent-dark: #d97706;

/* Background - Space Dark */
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--bg-tertiary: #334155;

/* Text */
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-muted: #64748b;

/* Status Colors */
--success: #22c55e;
--warning: #eab308;
--danger: #ef4444;
--info: #3b82f6;
```

### Typography
- **Headers**: Orbitron / Exo 2 (Sci-fi feel)
- **Body**: Inter / Roboto (Readability)
- **Numbers**: Roboto Mono (Consistency)

### UI Components Style
- Glass morphism effects
- Neon glow accents
- Hexagonal patterns
- Star field backgrounds
- Animated energy particles

---

## 📁 Project Structure

```
OGame-nuxt/
├── .github/
│   └── copilot-instructions.md
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css
│   ├── components/
│   │   ├── game/
│   │   │   ├── ResourceBar.vue
│   │   │   ├── BuildingCard.vue
│   │   │   ├── PlanetView.vue
│   │   │   └── ...
│   │   ├── ui/
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   └── ...
│   │   └── layout/
│   │       ├── Navbar.vue
│   │       ├── Sidebar.vue
│   │       └── ...
│   ├── composables/
│   │   ├── useResources.ts
│   │   ├── useBuildings.ts
│   │   └── useAuth.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   └── game.vue
│   └── pages/
│       ├── index.vue
│       ├── login.vue
│       ├── register.vue
│       └── game/
│           ├── overview.vue
│           ├── buildings.vue
│           ├── research.vue
│           ├── shipyard.vue
│           ├── fleet.vue
│           └── galaxy.vue
├── server/
│   ├── api/
│   │   ├── auth/
│   │   ├── player/
│   │   ├── planet/
│   │   ├── building/
│   │   ├── research/
│   │   └── fleet/
│   ├── models/
│   │   ├── player.schema.ts
│   │   ├── planet.schema.ts
│   │   ├── building.schema.ts
│   │   └── ...
│   ├── utils/
│   │   ├── gameFormulas.ts
│   │   └── resourceCalculator.ts
│   └── plugins/
│       └── mongoose.ts
├── nuxt.config.ts
├── tailwind.config.ts
├── package.json
└── DEVELOPMENT_PLAN.md
```

---

## 🔧 Game Formulas

### Resource Production
```typescript
// Tinh Thạch production per hour
metalProduction = 30 * level * 1.1^level

// Năng Lượng Vũ Trụ production per hour
crystalProduction = 20 * level * 1.1^level

// Hồn Thạch production per hour
deuteriumProduction = 10 * level * 1.1^level * (1.36 - 0.004 * planetTemp)

// Điện Năng production
energyProduction = 20 * level * 1.1^level
```

### Building Costs
```typescript
// Base cost multiplied by factor per level
cost = baseCost * factor^(level - 1)

// Build time in seconds
buildTime = (metalCost + crystalCost) / (2500 * (1 + roboticsLevel)) * 3600
```

### Combat Power (Swallowed Star inspired)
```typescript
// Chiến Lực tổng hợp
combatPower = (attack * 0.4 + defense * 0.3 + speed * 0.2 + cargo * 0.1) * techMultiplier
```

---

## 🎮 Game Lore Integration

### Warrior Ranks (Player Levels)
1. **Chiến Binh Sơ Cấp** (Lv 1-10)
2. **Chiến Tướng** (Lv 11-20)
3. **Đại Tướng** (Lv 21-30)
4. **Nguyên Soái** (Lv 31-40)
5. **Đại Đế** (Lv 41-50)
6. **Vũ Trụ Cấp** (Lv 51+)

### Building Themes
- Các công trình mang tên và thiết kế từ thế giới Thôn Phệ Tinh Không
- Hệ thống "Nội Thế Giới" cho người chơi cấp cao
- Vũ khí hệ Black Dragon (weapon upgrade)

### Fleet Names
- **Tiểu Chiến Hạm** → Hắc Long Fighter
- **Đại Chiến Hạm** → Dạ Đế Cruiser
- **Mẫu Hạm** → Hồng Hoang Carrier
- **Phi Thuyền Tử Thần** → Death Star equivalent

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Player
- `GET /api/player/profile`
- `PUT /api/player/profile`
- `GET /api/player/resources`

### Planet
- `GET /api/planet/:id`
- `GET /api/planet/:id/buildings`
- `POST /api/planet/:id/build`

### Buildings
- `GET /api/building/list`
- `POST /api/building/upgrade`
- `DELETE /api/building/cancel`

### Research
- `GET /api/research/list`
- `POST /api/research/start`

### Fleet
- `GET /api/fleet/ships`
- `POST /api/fleet/build`
- `POST /api/fleet/send`

---

## ✅ Definition of Done (MVP)

1. ✅ User can register and login
2. ✅ User has a home planet with resources
3. ✅ Resources accumulate over time
4. ✅ User can build and upgrade buildings
5. ✅ User can research technologies
6. ✅ User can build ships
7. ✅ Basic responsive UI with space theme
8. ✅ Data persists in MongoDB

---

## 🚀 Future Features (Post-MVP)

- [ ] Alliance system
- [ ] Real-time combat
- [ ] Marketplace/Trading
- [ ] Events & Quests
- [ ] Achievements
- [ ] Leaderboards
- [ ] Mobile app (Capacitor)
- [ ] Sound & Music
- [ ] Tutorials
- [ ] Admin dashboard
