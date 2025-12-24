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
    startTime: {
      type: 'Date',
      required: true,
    },
    endTime: {
      type: 'Date',
      required: true,
    },
    status: {
      type: 'string',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'IN_PROGRESS',
    },
  },
  options: {
    timestamps: true,
  },
})
