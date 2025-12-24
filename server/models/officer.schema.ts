import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

/**
 * Officer Schema - Thủ Lĩnh (Officers/Commander system)
 * Based on OGame's officer system with Thôn Phệ Tinh Không theme
 */
export const OfficerSchema = defineMongooseModel({
  name: 'Officer',
  schema: {
    player: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      unique: true,
    },
    
    // Chỉ Huy Trưởng (Commander) - Basic premium
    chiHuyTruong: {
      active: { type: Boolean, default: false },
      expiresAt: { type: Date },
      // Bonus: +2 fleet slots, queue building, enhanced overview
    },
    
    // Đô Đốc (Admiral) - Fleet bonus
    doDoc: {
      active: { type: Boolean, default: false },
      expiresAt: { type: Date },
      // Bonus: +2 fleet slots, fleet control center
    },
    
    // Kỹ Sư Trưởng (Engineer) - Defense bonus  
    kySuTruong: {
      active: { type: Boolean, default: false },
      expiresAt: { type: Date },
      // Bonus: +10% energy, -50% defense rebuild time
    },
    
    // Địa Chất Gia (Geologist) - Mining bonus
    diaChatGia: {
      active: { type: Boolean, default: false },
      expiresAt: { type: Date },
      // Bonus: +10% mining production
    },
    
    // Nhà Kỹ Thuật (Technocrat) - Research bonus
    nhaKyThuat: {
      active: { type: Boolean, default: false },
      expiresAt: { type: Date },
      // Bonus: +2 spy probes, +25% espionage tech
    },
    
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  options: {
    timestamps: true,
  },
})
