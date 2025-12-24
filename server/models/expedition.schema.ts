import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

/**
 * Expedition Schema - Thám Hiểm
 * OGame-style expedition missions to the unknown
 */
export const ExpeditionSchema = defineMongooseModel({
  name: 'Expedition',
  schema: {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    originPlanet: {
      type: Schema.Types.ObjectId,
      ref: 'Planet',
      required: true,
    },
    
    // Fleet sent on expedition
    ships: [{
      type: { type: String },
      count: { type: Number },
    }],
    
    // Coordinates (position 16 = expedition zone)
    destination: {
      galaxy: { type: Number, required: true },
      system: { type: Number, required: true },
      position: { type: Number, default: 16 }, // Expedition slot
    },
    
    // Status
    status: {
      type: String,
      enum: ['TRAVELING', 'EXPLORING', 'RETURNING', 'COMPLETED', 'LOST'],
      default: 'TRAVELING',
    },
    
    // Timing
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    explorationEndTime: { type: Date }, // When exploration phase ends
    returnTime: { type: Date }, // Expected return time
    
    // Results (filled after exploration)
    result: {
      type: {
        type: String,
        enum: [
          'NOTHING',        // Không tìm thấy gì
          'RESOURCES',      // Tìm thấy tài nguyên
          'FLEET',          // Tìm thấy tàu bị bỏ
          'ALIEN_ATTACK',   // Bị tấn công bởi người ngoài hành tinh
          'PIRATES',        // Gặp cướp biển vũ trụ
          'DARK_MATTER',    // Tìm thấy Hắc Ám Vật Chất
          'ARTIFACT',       // Tìm thấy cổ vật
          'DELAY',          // Bị chậm trễ
          'EARLY_RETURN',   // Về sớm
          'LOST',           // Mất liên lạc vĩnh viễn
          'BLACK_HOLE',     // Rơi vào hố đen
          'MERCHANT',       // Gặp thương nhân
        ],
      },
      resources: {
        tinhThach: { type: Number, default: 0 },
        nangLuongVuTru: { type: Number, default: 0 },
        honThach: { type: Number, default: 0 },
      },
      shipsFound: [{
        type: { type: String },
        count: { type: Number },
      }],
      shipsLost: [{
        type: { type: String },
        count: { type: Number },
      }],
      darkMatter: { type: Number, default: 0 },
      description: { type: String },
    },
    
    createdAt: { type: Date, default: Date.now },
  },
  options: {
    timestamps: true,
  },
})

/**
 * Calculate expedition result based on fleet power and luck
 */
export function calculateExpeditionResult(ships: any[], playerLevel: number): any {
  const totalPower = ships.reduce((sum, ship) => {
    const shipPower: Record<string, number> = {
      TIEU_CHIEN_HAM: 10,
      TRUNG_CHIEN_HAM: 25,
      TUAN_DUONG_HAM: 100,
      THIET_GIAP_HAM: 250,
      HAC_LONG_HAM: 300,
      VAN_TAI_NHO: 5,
      VAN_TAI_LON: 25,
      TAU_THUOC_DIA: 30,
      TAU_DO_THAM: 1,
      TAU_TAI_CHE: 15,
      MAU_HAM: 500,
      DA_DE_HAM: 1000,
      TU_THAN_TINH: 50000,
    }
    return sum + (shipPower[ship.type] || 0) * ship.count
  }, 0)

  const roll = Math.random() * 100
  
  // Outcome probabilities (%)
  // Better fleet = better outcomes
  if (roll < 30) {
    return { type: 'NOTHING', description: 'Cuộc thám hiểm không tìm thấy gì đặc biệt.' }
  } else if (roll < 50) {
    const multiplier = Math.min(totalPower / 100, 50)
    return {
      type: 'RESOURCES',
      resources: {
        tinhThach: Math.floor(Math.random() * 10000 * multiplier),
        nangLuongVuTru: Math.floor(Math.random() * 5000 * multiplier),
        honThach: Math.floor(Math.random() * 2000 * multiplier),
      },
      description: 'Hạm đội đã tìm thấy một mỏ tài nguyên bị bỏ hoang!',
    }
  } else if (roll < 60) {
    const possibleShips = ['TIEU_CHIEN_HAM', 'TRUNG_CHIEN_HAM', 'VAN_TAI_NHO']
    const foundShip = possibleShips[Math.floor(Math.random() * possibleShips.length)]
    return {
      type: 'FLEET',
      shipsFound: [{ type: foundShip, count: Math.floor(Math.random() * 5) + 1 }],
      description: 'Hạm đội phát hiện một số tàu bị bỏ và đã sửa chữa chúng!',
    }
  } else if (roll < 70) {
    return {
      type: 'DARK_MATTER',
      darkMatter: Math.floor(Math.random() * 100) + 10,
      description: 'Hạm đội đã thu thập được Hắc Ám Vật Chất trong vùng không gian sâu!',
    }
  } else if (roll < 80) {
    return { type: 'DELAY', description: 'Hạm đội gặp bão từ và bị chậm trễ.' }
  } else if (roll < 85) {
    return { type: 'EARLY_RETURN', description: 'Hạm đội quay về sớm hơn dự kiến.' }
  } else if (roll < 92) {
    // Alien attack - lose some ships
    const lostShips = ships.slice(0, Math.ceil(ships.length * 0.3)).map(s => ({
      type: s.type,
      count: Math.floor(s.count * 0.2),
    }))
    return {
      type: 'ALIEN_ATTACK',
      shipsLost: lostShips,
      description: 'Hạm đội bị người ngoài hành tinh tấn công! Một số tàu đã bị phá hủy.',
    }
  } else if (roll < 97) {
    // Pirates - lose resources
    return {
      type: 'PIRATES',
      description: 'Hạm đội bị cướp biển vũ trụ tấn công! Một số tài nguyên bị cướp.',
    }
  } else if (roll < 99) {
    return {
      type: 'MERCHANT',
      description: 'Hạm đội gặp một thương nhân vũ trụ và có cơ hội giao dịch!',
    }
  } else {
    // Black hole - lose everything (rare)
    return {
      type: 'BLACK_HOLE',
      shipsLost: ships.map(s => ({ type: s.type, count: s.count })),
      description: 'Hạm đội đã rơi vào một hố đen và mất liên lạc vĩnh viễn!',
    }
  }
}
