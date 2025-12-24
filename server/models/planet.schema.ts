import { defineMongooseModel } from '#nuxt/mongoose'

export const PlanetSchema = defineMongooseModel({
  name: 'Planet',
  schema: {
    name: {
      type: 'string',
      required: true,
      trim: true,
      maxlength: 30,
    },
    owner: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    coordinates: {
      galaxy: {
        type: 'number',
        required: true,
        min: 1,
        max: 9,
      },
      system: {
        type: 'number',
        required: true,
        min: 1,
        max: 499,
      },
      position: {
        type: 'number',
        required: true,
        min: 1,
        max: 15,
      },
    },
    resources: {
      tinhThach: {
        type: 'number',
        default: 500,
        min: 0,
      },
      nangLuongVuTru: {
        type: 'number',
        default: 500,
        min: 0,
      },
      honThach: {
        type: 'number',
        default: 0,
        min: 0,
      },
      dienNang: {
        type: 'number',
        default: 0,
      },
    },
    debris: {
      tinhThach: { type: 'number', default: 0, min: 0 },
      nangLuongVuTru: { type: 'number', default: 0, min: 0 },
    },
    buildings: [{
      type: {
        type: 'string',
        required: true,
      },
      level: {
        type: 'number',
        default: 0,
        min: 0,
      },
      isUpgrading: {
        type: 'boolean',
        default: false,
      },
      upgradeEndTime: {
        type: 'Date',
      },
    }],
    ships: [{
      type: {
        type: 'string',
        required: true,
      },
      count: {
        type: 'number',
        default: 0,
        min: 0,
      },
    }],
    defenses: [{
      type: {
        type: 'string',
        required: true,
      },
      count: {
        type: 'number',
        default: 0,
        min: 0,
      },
    }],
    temperature: {
      type: 'number',
      default: 0,
    },
    diameter: {
      type: 'number',
      default: 12000,
      min: 7000,
      max: 20000,
    },
    maxFields: {
      type: 'number',
      default: 163,
    },
    usedFields: {
      type: 'number',
      default: 0,
      min: 0,
    },
    isHomePlanet: {
      type: 'boolean',
      default: false,
    },
    lastResourceUpdate: {
      type: 'Date',
      default: Date.now,
    },
  },
  options: {
    timestamps: true,
  },
})
