import { defineMongooseModel } from '#nuxt/mongoose'

export const BattleReportSchema = defineMongooseModel({
  name: 'BattleReport',
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
    attackerPlanet: {
      galaxy: { type: 'number', required: true },
      system: { type: 'number', required: true },
      position: { type: 'number', required: true },
    },
    defenderPlanet: {
      galaxy: { type: 'number', required: true },
      system: { type: 'number', required: true },
      position: { type: 'number', required: true },
    },
    result: {
      attackerWins: { type: 'boolean', required: true },
      defenderWins: { type: 'boolean', required: true },
      draw: { type: 'boolean', required: true },
      rounds: { type: 'number', required: true },
    },
    attackerFleet: [{
      type: { type: 'string', required: true },
      initial: { type: 'number', required: true },
      lost: { type: 'number', required: true },
      remaining: { type: 'number', required: true },
    }],
    defenderFleet: [{
      type: { type: 'string', required: true },
      initial: { type: 'number', required: true },
      lost: { type: 'number', required: true },
      remaining: { type: 'number', required: true },
    }],
    defenderDefenses: [{
      type: { type: 'string', required: true },
      initial: { type: 'number', required: true },
      lost: { type: 'number', required: true },
      remaining: { type: 'number', required: true },
    }],
    loot: {
      tinhThach: { type: 'number', default: 0 },
      nangLuongVuTru: { type: 'number', default: 0 },
      honThach: { type: 'number', default: 0 },
    },
    debrisField: {
      tinhThach: { type: 'number', default: 0 },
      nangLuongVuTru: { type: 'number', default: 0 },
    },
    battleTime: {
      type: 'Date',
      required: true,
    },
    isRead: {
      attacker: { type: 'boolean', default: false },
      defender: { type: 'boolean', default: false },
    },
  },
  options: {
    timestamps: true,
  },
})
