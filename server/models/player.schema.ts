import { defineMongooseModel } from '#nuxt/mongoose'

export const PlayerSchema = defineMongooseModel({
  name: 'Player',
  schema: {
    username: {
      type: 'string',
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: 'string',
      required: true,
    },
    level: {
      type: 'number',
      default: 1,
      min: 1,
    },
    experience: {
      type: 'number',
      default: 0,
      min: 0,
    },
    rank: {
      type: 'string',
      enum: [
        'CHIEN_BINH_SO_CAP',
        'CHIEN_TUONG',
        'DAI_TUONG',
        'NGUYEN_SOAI',
        'DAI_DE',
        'VU_TRU_CAP',
      ],
      default: 'CHIEN_BINH_SO_CAP',
    },
    planets: [{
      type: 'ObjectId',
      ref: 'Planet',
    }],
    homePlanet: {
      type: 'ObjectId',
      ref: 'Planet',
    },
    researches: [{
      type: {
        type: 'string',
        required: true,
      },
      level: {
        type: 'number',
        default: 0,
      },
    }],
    alliance: {
      type: 'ObjectId',
      ref: 'Alliance',
    },
    isOnline: {
      type: 'boolean',
      default: false,
    },
    settings: {
      notifications: {
        type: 'boolean',
        default: true,
      },
      soundEnabled: {
        type: 'boolean',
        default: true,
      },
      language: {
        type: 'string',
        default: 'vi',
      },
    },
    createdAt: {
      type: 'Date',
      default: Date.now,
    },
    lastActive: {
      type: 'Date',
      default: Date.now,
    },
  },
  options: {
    timestamps: true,
  },
})
