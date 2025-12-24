import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

export const EspionageReportSchema = defineMongooseModel({
  name: 'EspionageReport',
  schema: {
    attacker: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    defender: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    coordinates: {
      galaxy: { type: Number, required: true },
      system: { type: Number, required: true },
      position: { type: Number, required: true },
    },
    resources: {
      tinhThach: { type: Number },
      nangLuongVuTru: { type: Number },
      honThach: { type: Number },
      dienNang: { type: Number },
    },
    ships: [{
      type: { type: String },
      count: { type: Number },
    }],
    defenses: [{
      type: { type: String },
      count: { type: Number },
    }],
    buildings: [{
      type: { type: String },
      level: { type: Number },
    }],
    researches: [{
      type: { type: String },
      level: { type: Number },
    }],
    levelDifference: { type: Number, required: true },
    counterEspionageChance: { type: Number, default: 0 },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 7, // Expires in 7 days
    },
  },
})
