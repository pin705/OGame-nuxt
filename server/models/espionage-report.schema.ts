import { defineMongooseModel } from '#nuxt/mongoose'

export const EspionageReportSchema = defineMongooseModel({
  name: 'EspionageReport',
  schema: {
    attacker: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    defender: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    coordinates: {
      galaxy: { type: 'number', required: true },
      system: { type: 'number', required: true },
      position: { type: 'number', required: true },
    },
    resources: {
      tinhThach: { type: 'number' },
      nangLuongVuTru: { type: 'number' },
      honThach: { type: 'number' },
      dienNang: { type: 'number' },
    },
    ships: [{
      type: { type: 'string' },
      count: { type: 'number' },
    }],
    defenses: [{
      type: { type: 'string' },
      count: { type: 'number' },
    }],
    buildings: [{
      type: { type: 'string' },
      level: { type: 'number' },
    }],
    researches: [{
      type: { type: 'string' },
      level: { type: 'number' },
    }],
    levelDifference: { type: 'number', required: true },
    counterEspionageChance: { type: 'number', default: 0 },
    createdAt: {
      type: 'Date',
      default: Date.now,
      expires: 60 * 60 * 24 * 7, // Expires in 7 days
    },
  },
})
