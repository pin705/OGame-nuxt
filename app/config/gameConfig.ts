// ========================================
// THÔN PHỆ TINH KHÔNG - Game Configuration
// ========================================

import {
  BuildingType,
  ResearchType,
  ShipType,
  DefenseType,
  type BuildingConfig,
  type ResearchConfig,
  type ShipConfig,
  type DefenseConfig,
} from '~/types/game'

// ============ Building Configurations ============

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  // Resource Buildings
  [BuildingType.MO_TINH_THACH]: {
    type: BuildingType.MO_TINH_THACH,
    name: 'Mỏ Tinh Thạch',
    description: 'Khai thác Tinh Thạch từ lòng hành tinh. Đây là nguồn tài nguyên cơ bản nhất.',
    baseCost: { tinhThach: 60, nangLuongVuTru: 15, honThach: 0 },
    costFactor: 1.5,
    energyConsumption: 10,
  },
  [BuildingType.MAY_HAP_THU_NANG_LUONG]: {
    type: BuildingType.MAY_HAP_THU_NANG_LUONG,
    name: 'Máy Hấp Thụ Năng Lượng',
    description: 'Thu thập Năng Lượng Vũ Trụ từ bức xạ của các ngôi sao.',
    baseCost: { tinhThach: 48, nangLuongVuTru: 24, honThach: 0 },
    costFactor: 1.6,
    energyConsumption: 10,
  },
  [BuildingType.DEN_HON_THACH]: {
    type: BuildingType.DEN_HON_THACH,
    name: 'Đền Hồn Thạch',
    description: 'Tinh luyện Hồn Thạch - nguồn năng lượng tinh thần quý hiếm.',
    baseCost: { tinhThach: 225, nangLuongVuTru: 75, honThach: 0 },
    costFactor: 1.5,
    energyConsumption: 20,
    requirements: {
      buildings: [
        { type: BuildingType.MO_TINH_THACH, level: 10 },
        { type: BuildingType.MAY_HAP_THU_NANG_LUONG, level: 10 },
      ],
    },
  },
  [BuildingType.LO_NANG_LUONG]: {
    type: BuildingType.LO_NANG_LUONG,
    name: 'Lò Năng Lượng',
    description: 'Cung cấp Điện Năng cho các công trình và hoạt động trên hành tinh.',
    baseCost: { tinhThach: 75, nangLuongVuTru: 30, honThach: 0 },
    costFactor: 1.5,
    energyProduction: 20,
  },

  // Storage Buildings
  [BuildingType.KHO_TINH_THACH]: {
    type: BuildingType.KHO_TINH_THACH,
    name: 'Kho Tinh Thạch',
    description: 'Tăng sức chứa Tinh Thạch trên hành tinh.',
    baseCost: { tinhThach: 1000, nangLuongVuTru: 0, honThach: 0 },
    costFactor: 2,
  },
  [BuildingType.KHO_NANG_LUONG_VU_TRU]: {
    type: BuildingType.KHO_NANG_LUONG_VU_TRU,
    name: 'Kho Năng Lượng Vũ Trụ',
    description: 'Tăng sức chứa Năng Lượng Vũ Trụ trên hành tinh.',
    baseCost: { tinhThach: 1000, nangLuongVuTru: 500, honThach: 0 },
    costFactor: 2,
  },
  [BuildingType.KHO_HON_THACH]: {
    type: BuildingType.KHO_HON_THACH,
    name: 'Kho Hồn Thạch',
    description: 'Tăng sức chứa Hồn Thạch trên hành tinh.',
    baseCost: { tinhThach: 1000, nangLuongVuTru: 1000, honThach: 0 },
    costFactor: 2,
  },

  // Functional Buildings
  [BuildingType.TRUNG_TAM_CHI_HUY]: {
    type: BuildingType.TRUNG_TAM_CHI_HUY,
    name: 'Trung Tâm Chỉ Huy',
    description: 'Mở khóa các tính năng quản lý và điều khiển hạm đội.',
    baseCost: { tinhThach: 400, nangLuongVuTru: 200, honThach: 100 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 1 }],
    },
  },
  [BuildingType.XUONG_DONG_TAU]: {
    type: BuildingType.XUONG_DONG_TAU,
    name: 'Xưởng Đóng Tàu',
    description: 'Cho phép xây dựng các loại tàu chiến và tàu vận tải.',
    baseCost: { tinhThach: 400, nangLuongVuTru: 200, honThach: 100 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.NHA_MAY_ROBOT, level: 2 }],
    },
  },
  [BuildingType.VIEN_NGHIEN_CUU]: {
    type: BuildingType.VIEN_NGHIEN_CUU,
    name: 'Viện Nghiên Cứu',
    description: 'Mở khóa và nghiên cứu các công nghệ mới.',
    baseCost: { tinhThach: 200, nangLuongVuTru: 400, honThach: 200 },
    costFactor: 2,
  },
  [BuildingType.NHA_MAY_ROBOT]: {
    type: BuildingType.NHA_MAY_ROBOT,
    name: 'Nhà Máy Robot',
    description: 'Tăng tốc độ xây dựng công trình trên hành tinh.',
    baseCost: { tinhThach: 400, nangLuongVuTru: 120, honThach: 200 },
    costFactor: 2,
  },
  [BuildingType.NHA_MAY_NANITE]: {
    type: BuildingType.NHA_MAY_NANITE,
    name: 'Nhà Máy Nanite',
    description: 'Công nghệ nano tiên tiến giúp tăng tốc độ xây dựng gấp bội.',
    baseCost: { tinhThach: 1000000, nangLuongVuTru: 500000, honThach: 100000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.NHA_MAY_ROBOT, level: 10 }],
      researches: [{ type: ResearchType.CONG_NGHE_MAY_TINH, level: 10 }],
    },
  },
  [BuildingType.PHAO_DAI_PHONG_THU]: {
    type: BuildingType.PHAO_DAI_PHONG_THU,
    name: 'Pháo Đài Phòng Thủ',
    description: 'Cho phép xây dựng các công trình phòng thủ.',
    baseCost: { tinhThach: 1000, nangLuongVuTru: 500, honThach: 0 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 1 }],
    },
  },
  [BuildingType.LO_NHIET_HACH]: {
    type: BuildingType.LO_NHIET_HACH,
    name: 'Lò Nhiệt Hạch',
    description: 'Nguồn năng lượng mạnh mẽ từ phản ứng nhiệt hạch, tiêu thụ Hồn Thạch.',
    baseCost: { tinhThach: 900, nangLuongVuTru: 360, honThach: 180 },
    costFactor: 1.8,
    energyProduction: 50,
    requirements: {
      buildings: [{ type: BuildingType.DEN_HON_THACH, level: 5 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 3 }],
    },
  },
  [BuildingType.SILO_TEN_LUA]: {
    type: BuildingType.SILO_TEN_LUA,
    name: 'Silo Tên Lửa',
    description: 'Lưu trữ tên lửa liên hành tinh và tên lửa đánh chặn.',
    baseCost: { tinhThach: 20000, nangLuongVuTru: 20000, honThach: 1000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 1 }],
    },
  },
  [BuildingType.CANG_VU_TRU]: {
    type: BuildingType.CANG_VU_TRU,
    name: 'Cảng Vũ Trụ',
    description: 'Cho phép sửa chữa tàu chiến bị hư hại.',
    baseCost: { tinhThach: 200, nangLuongVuTru: 0, honThach: 50 },
    costFactor: 5,
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 4 }],
    },
  },
  [BuildingType.MANG_CAM_BIEN]: {
    type: BuildingType.MANG_CAM_BIEN,
    name: 'Mạng Cảm Biến',
    description: 'Cho phép dò tìm hoạt động của hạm đội trên các hành tinh khác.',
    baseCost: { tinhThach: 20000, nangLuongVuTru: 40000, honThach: 20000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 5 }],
    },
  },
  [BuildingType.CONG_NHAY]: {
    type: BuildingType.CONG_NHAY,
    name: 'Cổng Nhảy',
    description: 'Cho phép dịch chuyển tức thời hạm đội giữa các mặt trăng.',
    baseCost: { tinhThach: 2000000, nangLuongVuTru: 4000000, honThach: 2000000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 8 }],
      researches: [{ type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 7 }],
    },
  },
}

// ============ Research Configurations ============

export const RESEARCHES: Record<ResearchType, ResearchConfig> = {
  [ResearchType.CONG_NGHE_NANG_LUONG]: {
    type: ResearchType.CONG_NGHE_NANG_LUONG,
    name: 'Công Nghệ Năng Lượng',
    description: 'Tăng hiệu suất sản xuất năng lượng.',
    baseCost: { tinhThach: 0, nangLuongVuTru: 800, honThach: 400 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 1 }],
    },
  },
  [ResearchType.CONG_NGHE_KHAI_THAC]: {
    type: ResearchType.CONG_NGHE_KHAI_THAC,
    name: 'Công Nghệ Khai Thác',
    description: 'Tăng hiệu suất khai thác tài nguyên.',
    baseCost: { tinhThach: 800, nangLuongVuTru: 400, honThach: 0 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 1 }],
    },
  },
  [ResearchType.CONG_NGHE_VU_KHI]: {
    type: ResearchType.CONG_NGHE_VU_KHI,
    name: 'Công Nghệ Vũ Khí',
    description: 'Tăng sức tấn công của tàu chiến.',
    baseCost: { tinhThach: 800, nangLuongVuTru: 200, honThach: 0 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 4 }],
    },
  },
  [ResearchType.CONG_NGHE_GIAP]: {
    type: ResearchType.CONG_NGHE_GIAP,
    name: 'Công Nghệ Giáp',
    description: 'Tăng độ bền của tàu chiến.',
    baseCost: { tinhThach: 1000, nangLuongVuTru: 0, honThach: 0 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 2 }],
    },
  },
  [ResearchType.CONG_NGHE_KHIEN]: {
    type: ResearchType.CONG_NGHE_KHIEN,
    name: 'Công Nghệ Khiên',
    description: 'Tăng khả năng chống đỡ của tàu chiến.',
    baseCost: { tinhThach: 200, nangLuongVuTru: 600, honThach: 0 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 6 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 3 }],
    },
  },
  [ResearchType.DONG_CO_DOT_CHAY]: {
    type: ResearchType.DONG_CO_DOT_CHAY,
    name: 'Động Cơ Đốt Cháy',
    description: 'Công nghệ động cơ cơ bản cho tàu chiến.',
    baseCost: { tinhThach: 400, nangLuongVuTru: 0, honThach: 600 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 1 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 1 }],
    },
  },
  [ResearchType.DONG_CO_XUNG]: {
    type: ResearchType.DONG_CO_XUNG,
    name: 'Động Cơ Xung',
    description: 'Động cơ nhanh hơn cho tàu chiến cấp trung.',
    baseCost: { tinhThach: 2000, nangLuongVuTru: 4000, honThach: 600 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 2 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 1 }],
    },
  },
  [ResearchType.DONG_CO_SIEU_KHONG_GIAN]: {
    type: ResearchType.DONG_CO_SIEU_KHONG_GIAN,
    name: 'Động Cơ Siêu Không Gian',
    description: 'Động cơ tối tân cho các tàu chiến cao cấp.',
    baseCost: { tinhThach: 10000, nangLuongVuTru: 20000, honThach: 6000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 7 }],
      researches: [{ type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN, level: 3 }],
    },
  },
  [ResearchType.CONG_NGHE_GIAN_DIEP]: {
    type: ResearchType.CONG_NGHE_GIAN_DIEP,
    name: 'Công Nghệ Gián Điệp',
    description: 'Nâng cao khả năng do thám và chống do thám.',
    baseCost: { tinhThach: 200, nangLuongVuTru: 1000, honThach: 200 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 3 }],
    },
  },
  [ResearchType.CONG_NGHE_MAY_TINH]: {
    type: ResearchType.CONG_NGHE_MAY_TINH,
    name: 'Công Nghệ Máy Tính',
    description: 'Tăng số hạm đội có thể triển khai cùng lúc.',
    baseCost: { tinhThach: 0, nangLuongVuTru: 400, honThach: 600 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 1 }],
    },
  },
  [ResearchType.CONG_NGHE_SIEU_KHONG_GIAN]: {
    type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN,
    name: 'Công Nghệ Siêu Không Gian',
    description: 'Mở khóa khả năng di chuyển siêu không gian.',
    baseCost: { tinhThach: 0, nangLuongVuTru: 4000, honThach: 2000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 7 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 5 }],
    },
  },
  [ResearchType.CONG_NGHE_TRONG_LUC]: {
    type: ResearchType.CONG_NGHE_TRONG_LUC,
    name: 'Công Nghệ Trọng Lực',
    description: 'Nghiên cứu trọng lực cho phép chế tạo Tử Thần Tinh.',
    baseCost: { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 },
    costFactor: 3,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 12 }],
    },
  },
  [ResearchType.CONG_NGHE_LASER]: {
    type: ResearchType.CONG_NGHE_LASER,
    name: 'Công Nghệ Laser',
    description: 'Nền tảng cho các vũ khí laser tiên tiến.',
    baseCost: { tinhThach: 200, nangLuongVuTru: 100, honThach: 0 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 1 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 2 }],
    },
  },
  [ResearchType.CONG_NGHE_ION]: {
    type: ResearchType.CONG_NGHE_ION,
    name: 'Công Nghệ Ion',
    description: 'Công nghệ ion cho vũ khí và khiên phòng thủ.',
    baseCost: { tinhThach: 1000, nangLuongVuTru: 300, honThach: 100 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 4 }],
      researches: [{ type: ResearchType.CONG_NGHE_LASER, level: 5 }],
    },
  },
  [ResearchType.CONG_NGHE_PLASMA]: {
    type: ResearchType.CONG_NGHE_PLASMA,
    name: 'Công Nghệ Plasma',
    description: 'Công nghệ plasma mạnh mẽ cho vũ khí hạng nặng.',
    baseCost: { tinhThach: 2000, nangLuongVuTru: 4000, honThach: 1000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 4 }],
      researches: [
        { type: ResearchType.CONG_NGHE_ION, level: 5 },
        { type: ResearchType.CONG_NGHE_NANG_LUONG, level: 8 },
      ],
    },
  },
  [ResearchType.LIEN_MANG_NGHIEN_CUU]: {
    type: ResearchType.LIEN_MANG_NGHIEN_CUU,
    name: 'Liên Mạng Nghiên Cứu',
    description: 'Kết nối các viện nghiên cứu trên nhiều hành tinh.',
    baseCost: { tinhThach: 240000, nangLuongVuTru: 400000, honThach: 160000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 10 }],
      researches: [
        { type: ResearchType.CONG_NGHE_MAY_TINH, level: 8 },
        { type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN, level: 8 },
      ],
    },
  },
  [ResearchType.THUOC_DIA_HOC]: {
    type: ResearchType.THUOC_DIA_HOC,
    name: 'Thuộc Địa Học',
    description: 'Cho phép khám phá và thuộc địa hóa nhiều hành tinh hơn.',
    baseCost: { tinhThach: 4000, nangLuongVuTru: 8000, honThach: 4000 },
    costFactor: 1.75,
    requirements: {
      buildings: [{ type: BuildingType.VIEN_NGHIEN_CUU, level: 3 }],
      researches: [{ type: ResearchType.DONG_CO_XUNG, level: 3 }],
    },
  },
}

// ============ Ship Configurations ============

export const SHIPS: Record<ShipType, ShipConfig> = {
  [ShipType.TIEU_CHIEN_HAM]: {
    type: ShipType.TIEU_CHIEN_HAM,
    name: 'Tiểu Chiến Hạm',
    description: 'Tàu chiến nhẹ cơ bản, phù hợp cho các chiến dịch nhanh.',
    cost: { tinhThach: 3000, nangLuongVuTru: 1000, honThach: 0 },
    stats: { attack: 50, defense: 40, shield: 10, cargo: 50, speed: 12500, fuelConsumption: 20 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 1 }],
      researches: [{ type: ResearchType.DONG_CO_DOT_CHAY, level: 1 }],
    },
  },
  [ShipType.TRUNG_CHIEN_HAM]: {
    type: ShipType.TRUNG_CHIEN_HAM,
    name: 'Trung Chiến Hạm',
    description: 'Tàu chiến mạnh hơn với hỏa lực và giáp tốt hơn.',
    cost: { tinhThach: 6000, nangLuongVuTru: 4000, honThach: 0 },
    stats: { attack: 150, defense: 100, shield: 25, cargo: 100, speed: 10000, fuelConsumption: 75 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 3 }],
      researches: [
        { type: ResearchType.DONG_CO_XUNG, level: 2 },
        { type: ResearchType.CONG_NGHE_GIAP, level: 2 },
      ],
    },
  },
  [ShipType.TUAN_DUONG_HAM]: {
    type: ShipType.TUAN_DUONG_HAM,
    name: 'Tuần Dương Hạm',
    description: 'Tàu chiến linh hoạt với tốc độ và hỏa lực cân bằng.',
    cost: { tinhThach: 20000, nangLuongVuTru: 7000, honThach: 2000 },
    stats: { attack: 400, defense: 270, shield: 50, cargo: 800, speed: 15000, fuelConsumption: 300 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 5 }],
      researches: [
        { type: ResearchType.DONG_CO_XUNG, level: 4 },
        { type: ResearchType.CONG_NGHE_VU_KHI, level: 2 },
      ],
    },
  },
  [ShipType.THIET_GIAP_HAM]: {
    type: ShipType.THIET_GIAP_HAM,
    name: 'Thiết Giáp Hạm',
    description: 'Tàu chiến hạng nặng với sức tấn công và phòng thủ mạnh.',
    cost: { tinhThach: 45000, nangLuongVuTru: 15000, honThach: 0 },
    stats: { attack: 1000, defense: 600, shield: 200, cargo: 1500, speed: 10000, fuelConsumption: 500 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 7 }],
      researches: [{ type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 4 }],
    },
  },
  [ShipType.HAC_LONG_HAM]: {
    type: ShipType.HAC_LONG_HAM,
    name: 'Hắc Long Hạm',
    description: 'Tàu chiến đặc biệt lấy cảm hứng từ vũ khí Hắc Long của La Phong.',
    cost: { tinhThach: 30000, nangLuongVuTru: 40000, honThach: 15000 },
    stats: { attack: 700, defense: 400, shield: 400, cargo: 750, speed: 10000, fuelConsumption: 250 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 8 }],
      researches: [
        { type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 5 },
        { type: ResearchType.CONG_NGHE_VU_KHI, level: 12 },
      ],
    },
  },
  [ShipType.VAN_TAI_NHO]: {
    type: ShipType.VAN_TAI_NHO,
    name: 'Vận Tải Nhỏ',
    description: 'Tàu vận tải nhỏ cho việc chuyên chở tài nguyên.',
    cost: { tinhThach: 2000, nangLuongVuTru: 2000, honThach: 0 },
    stats: { attack: 5, defense: 10, shield: 10, cargo: 5000, speed: 5000, fuelConsumption: 10 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 2 }],
      researches: [{ type: ResearchType.DONG_CO_DOT_CHAY, level: 2 }],
    },
  },
  [ShipType.VAN_TAI_LON]: {
    type: ShipType.VAN_TAI_LON,
    name: 'Vận Tải Lớn',
    description: 'Tàu vận tải lớn với khả năng chở hàng cao.',
    cost: { tinhThach: 6000, nangLuongVuTru: 6000, honThach: 0 },
    stats: { attack: 5, defense: 25, shield: 25, cargo: 25000, speed: 7500, fuelConsumption: 50 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 4 }],
      researches: [{ type: ResearchType.DONG_CO_DOT_CHAY, level: 6 }],
    },
  },
  [ShipType.TAU_THUOC_DIA]: {
    type: ShipType.TAU_THUOC_DIA,
    name: 'Tàu Thuộc Địa',
    description: 'Tàu đặc biệt để chiếm hữu hành tinh mới.',
    cost: { tinhThach: 10000, nangLuongVuTru: 20000, honThach: 10000 },
    stats: { attack: 0, defense: 100, shield: 100, cargo: 7500, speed: 2500, fuelConsumption: 1000 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 4 }],
      researches: [{ type: ResearchType.DONG_CO_XUNG, level: 3 }],
    },
  },
  [ShipType.TAU_DO_THAM]: {
    type: ShipType.TAU_DO_THAM,
    name: 'Tàu Dò Thám',
    description: 'Tàu nhỏ để thu thập thông tin về hành tinh địch.',
    cost: { tinhThach: 0, nangLuongVuTru: 1000, honThach: 0 },
    stats: { attack: 0, defense: 1, shield: 0, cargo: 5, speed: 100000000, fuelConsumption: 1 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 3 }],
      researches: [
        { type: ResearchType.DONG_CO_DOT_CHAY, level: 3 },
        { type: ResearchType.CONG_NGHE_GIAN_DIEP, level: 2 },
      ],
    },
  },
  [ShipType.TAU_TAI_CHE]: {
    type: ShipType.TAU_TAI_CHE,
    name: 'Tàu Tái Chế',
    description: 'Tàu thu thập xác tàu từ trận chiến.',
    cost: { tinhThach: 10000, nangLuongVuTru: 6000, honThach: 2000 },
    stats: { attack: 1, defense: 16, shield: 10, cargo: 20000, speed: 2000, fuelConsumption: 300 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 4 }],
      researches: [
        { type: ResearchType.DONG_CO_DOT_CHAY, level: 6 },
        { type: ResearchType.CONG_NGHE_KHIEN, level: 2 },
      ],
    },
  },
  [ShipType.MAU_HAM]: {
    type: ShipType.MAU_HAM,
    name: 'Mẫu Hạm',
    description: 'Tàu sân bay có thể mang theo các tàu chiến nhỏ.',
    cost: { tinhThach: 60000, nangLuongVuTru: 50000, honThach: 15000 },
    stats: { attack: 200, defense: 1100, shield: 500, cargo: 1000, speed: 2500, fuelConsumption: 1000 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 9 }],
      researches: [
        { type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 6 },
        { type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN, level: 6 },
      ],
    },
  },
  [ShipType.DA_DE_HAM]: {
    type: ShipType.DA_DE_HAM,
    name: 'Dạ Đế Hạm',
    description: 'Khu trục hạm mạnh mẽ, được đặt theo tên Dạ Đế trong Thôn Phệ Tinh Không.',
    cost: { tinhThach: 5000000, nangLuongVuTru: 4000000, honThach: 1000000 },
    stats: { attack: 2000, defense: 1500, shield: 500, cargo: 2000, speed: 5000, fuelConsumption: 1000 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 12 }],
      researches: [
        { type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 6 },
        { type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN, level: 5 },
      ],
    },
  },
  [ShipType.TU_THAN_TINH]: {
    type: ShipType.TU_THAN_TINH,
    name: 'Tử Thần Tinh',
    description: 'Vũ khí hủy diệt tối thượng, có thể phá hủy cả một hành tinh.',
    cost: { tinhThach: 5000000, nangLuongVuTru: 4000000, honThach: 1000000 },
    stats: { attack: 200000, defense: 900000, shield: 50000, cargo: 1000000, speed: 100, fuelConsumption: 1 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 12 }],
      researches: [
        { type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 7 },
        { type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN, level: 6 },
      ],
    },
  },
}

// ============ Defense Configurations ============

export const DEFENSES: Record<DefenseType, DefenseConfig> = {
  [DefenseType.BE_PHONG_TEN_LUA]: {
    type: DefenseType.BE_PHONG_TEN_LUA,
    name: 'Bệ Phóng Tên Lửa',
    description: 'Hệ thống phòng thủ cơ bản, rẻ tiền nhưng hiệu quả chống lại số lượng lớn.',
    cost: { tinhThach: 2000, nangLuongVuTru: 0, honThach: 0 },
    stats: { attack: 80, defense: 20, shield: 20 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 1 }],
    },
  },
  [DefenseType.PHAO_LASER_NHO]: {
    type: DefenseType.PHAO_LASER_NHO,
    name: 'Pháo Laser Nhỏ',
    description: 'Vũ khí năng lượng đơn giản, gây sát thương ổn định.',
    cost: { tinhThach: 1500, nangLuongVuTru: 500, honThach: 0 },
    stats: { attack: 100, defense: 25, shield: 25 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 2 }],
      researches: [{ type: ResearchType.CONG_NGHE_NANG_LUONG, level: 1 }],
    },
  },
  [DefenseType.PHAO_LASER_LON]: {
    type: DefenseType.PHAO_LASER_LON,
    name: 'Pháo Laser Lớn',
    description: 'Phiên bản nâng cấp của pháo laser, sức công phá mạnh hơn.',
    cost: { tinhThach: 6000, nangLuongVuTru: 2000, honThach: 0 },
    stats: { attack: 250, defense: 100, shield: 100 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 4 }],
      researches: [
        { type: ResearchType.CONG_NGHE_NANG_LUONG, level: 3 },
        { type: ResearchType.CONG_NGHE_VU_KHI, level: 1 }, // Added requirement
      ],
    },
  },
  [DefenseType.PHAO_GAUSS]: {
    type: DefenseType.PHAO_GAUSS,
    name: 'Pháo Gauss',
    description: 'Sử dụng từ trường để bắn đạn với vận tốc cực lớn.',
    cost: { tinhThach: 20000, nangLuongVuTru: 15000, honThach: 2000 },
    stats: { attack: 1100, defense: 200, shield: 200 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 6 }],
      researches: [
        { type: ResearchType.CONG_NGHE_NANG_LUONG, level: 6 },
        { type: ResearchType.CONG_NGHE_VU_KHI, level: 3 },
        { type: ResearchType.CONG_NGHE_KHIEN, level: 1 },
      ],
    },
  },
  [DefenseType.PHAO_ION]: {
    type: DefenseType.PHAO_ION,
    name: 'Pháo Ion',
    description: 'Bắn chùm ion phá hủy lá chắn của đối phương.',
    cost: { tinhThach: 2000, nangLuongVuTru: 6000, honThach: 0 },
    stats: { attack: 150, defense: 500, shield: 500 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 4 }],
      researches: [{ type: ResearchType.CONG_NGHE_KHIEN, level: 4 }], // Changed requirement
    },
  },
  [DefenseType.PHAO_PLASMA]: {
    type: DefenseType.PHAO_PLASMA,
    name: 'Pháo Plasma',
    description: 'Vũ khí phòng thủ mạnh nhất, sử dụng plasma nhiệt độ cao.',
    cost: { tinhThach: 50000, nangLuongVuTru: 50000, honThach: 30000 },
    stats: { attack: 3000, defense: 300, shield: 300 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 8 }],
      researches: [
        { type: ResearchType.CONG_NGHE_NANG_LUONG, level: 8 },
        { type: ResearchType.CONG_NGHE_VU_KHI, level: 10 }, // Changed requirement
      ],
    },
  },
  [DefenseType.VOM_KHIEN_NHO]: {
    type: DefenseType.VOM_KHIEN_NHO,
    name: 'Vòm Khiên Nhỏ',
    description: 'Lá chắn năng lượng bao phủ hành tinh, chặn sát thương.',
    cost: { tinhThach: 10000, nangLuongVuTru: 10000, honThach: 0 },
    stats: { attack: 1, defense: 2000, shield: 2000 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 1 }],
      researches: [{ type: ResearchType.CONG_NGHE_KHIEN, level: 2 }],
    },
  },
  [DefenseType.VOM_KHIEN_LON]: {
    type: DefenseType.VOM_KHIEN_LON,
    name: 'Vòm Khiên Lớn',
    description: 'Lá chắn năng lượng cực mạnh, bảo vệ toàn diện.',
    cost: { tinhThach: 50000, nangLuongVuTru: 50000, honThach: 0 },
    stats: { attack: 1, defense: 10000, shield: 10000 },
    requirements: {
      buildings: [{ type: BuildingType.XUONG_DONG_TAU, level: 6 }],
      researches: [{ type: ResearchType.CONG_NGHE_KHIEN, level: 6 }],
    },
  },
}

// ============ Game Constants ============

export const GAME_CONFIG = {
  // Universe settings
  GALAXIES: 9,
  SYSTEMS_PER_GALAXY: 499,
  PLANETS_PER_SYSTEM: 15,
  
  // Starting resources - đủ để xây 2-3 buildings đầu tiên
  STARTING_RESOURCES: {
    tinhThach: 5000,
    nangLuongVuTru: 3000,
    honThach: 1000,
    dienNang: 0,
  },
  
  // Base production (per hour at level 0) - 20x speed
  BASE_PRODUCTION: {
    tinhThach: 300,
    nangLuongVuTru: 150,
    honThach: 50,
    dienNang: 0,
  },
  
  // Storage capacity base
  BASE_STORAGE: {
    tinhThach: 100000,
    nangLuongVuTru: 100000,
    honThach: 50000,
  },
  
  // Game speed multiplier (higher = faster game) - 20x cho gameplay nhanh hơn
  GAME_SPEED: 20,
  
  // Build speed multiplier (higher = slower builds, but we divide by GAME_SPEED)
  BUILD_SPEED_BASE: 10000,
  
  // Experience points per action
  XP_PER_BUILD: 10,
  XP_PER_RESEARCH: 25,
  XP_PER_SHIP: 5,
  XP_PER_BATTLE_WIN: 100,
  
  // Level requirements
  LEVEL_XP_BASE: 1000,
  LEVEL_XP_FACTOR: 1.5,
}

// ============ Rank Definitions ============

export const RANKS = {
  CHIEN_BINH_SO_CAP: { name: 'Chiến Binh Sơ Cấp', minLevel: 1, maxLevel: 10 },
  CHIEN_TUONG: { name: 'Chiến Tướng', minLevel: 11, maxLevel: 20 },
  DAI_TUONG: { name: 'Đại Tướng', minLevel: 21, maxLevel: 30 },
  NGUYEN_SOAI: { name: 'Nguyên Soái', minLevel: 31, maxLevel: 40 },
  DAI_DE: { name: 'Đại Đế', minLevel: 41, maxLevel: 50 },
  VU_TRU_CAP: { name: 'Vũ Trụ Cấp', minLevel: 51, maxLevel: Infinity },
}
