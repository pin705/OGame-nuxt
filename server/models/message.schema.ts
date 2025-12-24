import { defineMongooseModel } from '#nuxt/mongoose'

export const MessageSchema = defineMongooseModel({
  name: 'Message',
  schema: {
    sender: {
      type: 'ObjectId',
      ref: 'Player',
      default: null, // null means System
    },
    recipient: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    type: {
      type: 'string',
      enum: ['PLAYER', 'ESPIONAGE', 'COMBAT', 'SYSTEM', 'ALLIANCE', 'EXPEDITION'],
      default: 'PLAYER',
    },
    subject: {
      type: 'string',
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: 'string',
      required: true,
      maxlength: 5000,
    },
    isRead: {
      type: 'boolean',
      default: false,
    },
    relatedId: {
      type: 'ObjectId', // Reference to BattleReport, EspionageReport, etc.
    },
  },
  options: {
    timestamps: true,
  },
})
