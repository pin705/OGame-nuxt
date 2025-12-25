import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

export const BuildQueueSchema = defineMongooseModel({
  name: 'BuildQueue',
  schema: {
    planet: {
      type: Schema.Types.ObjectId,
      ref: 'Planet',
      required: true,
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    queueType: {
      type: String,
      enum: ['BUILDING', 'RESEARCH', 'SHIP', 'DEFENSE'],
      required: true,
    },
    itemType: {
      type: String,
      required: true,
    },
    targetLevel: {
      type: Number,
      min: 1,
    },
    count: {
      type: Number,
      min: 1,
    },
    // Queue position for ordering (1, 2, 3)
    queuePosition: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    // Cost stored for refund if cancelled
    cost: {
      tinhThach: { type: Number, default: 0 },
      nangLuongVuTru: { type: Number, default: 0 },
      honThach: { type: Number, default: 0 },
    },
    // Duration in seconds
    durationSeconds: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  options: {
    timestamps: true,
  },
})
