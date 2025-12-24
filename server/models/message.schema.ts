import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

export const MessageSchema = defineMongooseModel({
  name: 'Message',
  schema: {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      default: null, // null means System
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    type: {
      type: String,
      enum: ['PLAYER', 'ESPIONAGE', 'COMBAT', 'SYSTEM', 'ALLIANCE', 'EXPEDITION'],
      default: 'PLAYER',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: Schema.Types.ObjectId, // Reference to BattleReport, EspionageReport, etc.
    },
  },
  options: {
    timestamps: true,
  },
})
