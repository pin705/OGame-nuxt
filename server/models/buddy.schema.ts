import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

/**
 * Buddy Schema - Chiến Hữu (Friends/Buddies system)
 * Allow players to add friends and share bonuses
 */
export const BuddySchema = defineMongooseModel({
  name: 'Buddy',
  schema: {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'],
      default: 'PENDING',
    },
    message: {
      type: String,
      maxlength: 200,
    },
    createdAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
  },
  options: {
    timestamps: true,
  },
})

// Index for efficient queries
// BuddySchema.index({ requester: 1, recipient: 1 }, { unique: true })
