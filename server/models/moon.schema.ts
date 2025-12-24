import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

/**
 * Moon Schema - Mặt Trăng
 * Moons are created from debris fields after large battles
 * or through Dark Matter purchase
 */
export const MoonSchema = defineMongooseModel({
  name: 'Moon',
  schema: {
    name: {
      type: String,
      default: 'Mặt Trăng',
      maxlength: 30,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    parentPlanet: {
      type: Schema.Types.ObjectId,
      ref: 'Planet',
      required: true,
    },
    coordinates: {
      galaxy: { type: Number, required: true, min: 1, max: 9 },
      system: { type: Number, required: true, min: 1, max: 499 },
      position: { type: Number, required: true, min: 1, max: 15 },
    },
    
    // Size determines max fields (smaller than planet)
    diameter: { type: Number, default: 8366 }, // km
    temperature: { type: Number, default: -40 },
    usedFields: { type: Number, default: 0 },
    maxFields: { type: Number, default: 1 }, // Increases with diameter
    
    // Resources (no production, just storage)
    resources: {
      tinhThach: { type: Number, default: 0 },
      nangLuongVuTru: { type: Number, default: 0 },
      honThach: { type: Number, default: 0 },
    },
    
    // Moon-specific buildings
    buildings: [{
      type: { type: String },
      level: { type: Number, default: 0 },
    }],
    
    // Ships stationed on moon
    ships: [{
      type: { type: String },
      count: { type: Number, default: 0 },
    }],
    
    // Defenses on moon
    defenses: [{
      type: { type: String },
      count: { type: Number, default: 0 },
    }],
    
    // Moon facilities
    hasLunarBase: { type: Boolean, default: false }, // Căn Cứ Mặt Trăng
    hasSensorPhalanx: { type: Boolean, default: false }, // Cảm Biến Phalanx
    hasJumpGate: { type: Boolean, default: false }, // Cổng Nhảy
    
    createdAt: { type: Date, default: Date.now },
    lastResourceUpdate: { type: Date, default: Date.now },
  },
  options: {
    timestamps: true,
  },
})

// Moon building types
export const MOON_BUILDINGS = {
  CAN_CU_MAT_TRANG: {
    type: 'CAN_CU_MAT_TRANG',
    name: 'Căn Cứ Mặt Trăng',
    description: 'Mở rộng không gian sử dụng trên mặt trăng. Mỗi cấp thêm 3 ô.',
    baseCost: { tinhThach: 20000, nangLuongVuTru: 40000, honThach: 20000 },
    costFactor: 2,
    fieldsPerLevel: 3,
  },
  CAM_BIEN_PHALANX: {
    type: 'CAM_BIEN_PHALANX',
    name: 'Cảm Biến Phalanx',
    description: 'Dò tìm hạm đội trong các hệ sao lân cận.',
    baseCost: { tinhThach: 20000, nangLuongVuTru: 40000, honThach: 20000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: 'CAN_CU_MAT_TRANG', level: 1 }],
    },
  },
  CONG_NHAY: {
    type: 'CONG_NHAY',
    name: 'Cổng Nhảy',
    description: 'Di chuyển tức thời hạm đội giữa các mặt trăng có cổng nhảy.',
    baseCost: { tinhThach: 2000000, nangLuongVuTru: 4000000, honThach: 2000000 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: 'CAN_CU_MAT_TRANG', level: 1 }],
      researches: [{ type: 'CONG_NGHE_SIEU_KHONG_GIAN', level: 7 }],
    },
  },
  XUONG_DONG_TAU: {
    type: 'XUONG_DONG_TAU',
    name: 'Xưởng Đóng Tàu',
    description: 'Cho phép đóng tàu trên mặt trăng.',
    baseCost: { tinhThach: 400, nangLuongVuTru: 200, honThach: 100 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: 'CAN_CU_MAT_TRANG', level: 1 }],
    },
  },
  NHA_MAY_ROBOT: {
    type: 'NHA_MAY_ROBOT',
    name: 'Nhà Máy Robot',
    description: 'Tăng tốc độ xây dựng trên mặt trăng.',
    baseCost: { tinhThach: 400, nangLuongVuTru: 120, honThach: 200 },
    costFactor: 2,
    requirements: {
      buildings: [{ type: 'CAN_CU_MAT_TRANG', level: 1 }],
    },
  },
}
