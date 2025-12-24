# Thôn Phệ Tinh Không

> Game chiến lược không gian clone OGame với cốt truyện từ tiểu thuyết "Thôn Phệ Tinh Không" (Swallowed Star)

## 🌌 Giới thiệu

Thôn Phệ Tinh Không là game chiến lược không gian thời gian thực, nơi bạn xây dựng đế chế, phát triển công nghệ, và chinh phục thiên hà. Trở thành Vũ Trụ Cấp Chiến Sĩ hùng mạnh nhất!

## ✨ Tính năng

- 🏗️ **Xây dựng căn cứ** - Khai thác tài nguyên, xây dựng công trình
- 🔬 **Nghiên cứu công nghệ** - Nâng cấp vũ khí, giáp, động cơ
- 🚀 **Chế tạo hạm đội** - Từ Tiểu Chiến Hạm đến Tử Thần Tinh
- ⚔️ **Chiến đấu PvP** - Tấn công, cướp bóc, chinh phục
- 🌍 **Thuộc địa hóa** - Mở rộng lãnh thổ trên nhiều hành tinh
- 👥 **Liên minh** - Hợp tác cùng đồng minh

## 🛠️ Tech Stack

- **Framework**: Nuxt 4 (Vue 3, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: MongoDB với nuxt-mongoose
- **Icons**: Nuxt Icon (@nuxt/icon)

## 🚀 Bắt đầu

### Yêu cầu
- Node.js >= 20
- MongoDB (local hoặc Atlas)
- pnpm (khuyến nghị)

### Cài đặt

```bash
# Clone repository
git clone https://github.com/yourusername/thon-phe-tinh-khong.git
cd thon-phe-tinh-khong

# Cài đặt dependencies
pnpm install

# Copy file env mẫu
cp .env.example .env

# Chỉnh sửa .env với thông tin MongoDB của bạn
# MONGODB_URI=mongodb://localhost:27017/thon-phe-tinh-khong

# Chạy development server
pnpm dev
```

### Build Production

```bash
# Build
pnpm build

# Preview
pnpm preview
```

## 📁 Cấu trúc dự án

```
├── app/
│   ├── assets/css/          # Styles (Tailwind)
│   ├── components/          # Vue components
│   │   ├── game/            # Game-specific components
│   │   └── ui/              # Reusable UI components
│   ├── composables/         # Vue composables
│   ├── config/              # Game configuration
│   ├── layouts/             # Nuxt layouts
│   ├── pages/               # App pages
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── server/
│   ├── api/                 # API routes
│   ├── models/              # Mongoose schemas
│   └── utils/               # Server utilities
└── DEVELOPMENT_PLAN.md      # Roadmap chi tiết
```

## 🎮 Hệ thống game

### Tài nguyên
- **Tinh Thạch** - Khoáng sản cơ bản
- **Năng Lượng Vũ Trụ** - Năng lượng tinh thuần
- **Hồn Thạch** - Năng lượng tinh thần quý hiếm
- **Điện Năng** - Vận hành công trình

### Cấp độ người chơi
1. Chiến Binh Sơ Cấp (Lv 1-10)
2. Chiến Tướng (Lv 11-20)
3. Đại Tướng (Lv 21-30)
4. Nguyên Soái (Lv 31-40)
5. Đại Đế (Lv 41-50)
6. Vũ Trụ Cấp (Lv 51+)

## 📖 Tài liệu

- [Kế hoạch phát triển](./DEVELOPMENT_PLAN.md)
- [Hướng dẫn đóng góp](./.github/CONTRIBUTING.md)

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Xin hãy đọc hướng dẫn đóng góp trước khi tạo PR.

## 📄 License

MIT License - Xem file [LICENSE](./LICENSE) để biết thêm chi tiết.

## 🙏 Credits

- Inspired by [OGame](https://ogame.org)
- Storyline from "Thôn Phệ Tinh Không" (吞噬星空) by I Eat Tomatoes
- Built with ❤️ using [Nuxt](https://nuxt.com)
