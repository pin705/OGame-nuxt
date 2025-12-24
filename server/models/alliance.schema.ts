import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

export const AllianceSchema = defineMongooseModel({
  name: 'Alliance',
  schema: {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    tag: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 8,
      uppercase: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'Player',
    }],
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    applications: [{
      player: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
      },
      message: {
        type: String,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  options: {
    timestamps: true,
  },
})
