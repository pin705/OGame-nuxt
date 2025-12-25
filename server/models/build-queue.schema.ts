import { defineMongooseModel } from '#nuxt/mongoose'

export const BuildQueueSchema = defineMongooseModel({
  name: 'BuildQueue',
  schema: {
    planet: {
      type: 'ObjectId',
      ref: 'Planet',
      required: true,
    },
    player: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    queueType: {
      type: 'string',
      enum: ['BUILDING', 'RESEARCH', 'SHIP', 'DEFENSE'],
      required: true,
    },
    itemType: {
      type: 'string',
      required: true,
    },
    targetLevel: {
      type: 'number',
      min: 1,
    },
    count: {
      type: 'number',
      min: 1,
    },
    // Queue position for ordering (1, 2, 3, 4, 5, 6)
    queuePosition: {
      type: 'number',
      default: 1,
      min: 1,
      max: 6,
    },
    // Cost stored for refund if cancelled
    cost: {
      tinhThach: { type: 'number', default: 0 },
      nangLuongVuTru: { type: 'number', default: 0 },
      honThach: { type: 'number', default: 0 },
    },
    // Duration in seconds
    durationSeconds: {
      type: 'number',
      default: 0,
    },
    startTime: {
      type: 'Date',
    },
    endTime: {
      type: 'Date',
    },
    status: {
      type: 'string',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  options: {
    timestamps: true,
  },
})
