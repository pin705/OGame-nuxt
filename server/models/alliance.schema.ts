import { defineMongooseModel } from '#nuxt/mongoose'

export const AllianceSchema = defineMongooseModel({
  name: 'Alliance',
  schema: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    tag: {
      type: 'string',
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 8,
      uppercase: true,
    },
    owner: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    members: [{
      type: 'ObjectId',
      ref: 'Player',
    }],
    description: {
      type: 'string',
      default: '',
      maxlength: 1000,
    },
    applications: [{
      player: {
        type: 'ObjectId',
        ref: 'Player',
      },
      message: {
        type: 'string',
        maxlength: 500,
      },
      createdAt: {
        type: 'Date',
        default: Date.now,
      },
    }],
    createdAt: {
      type: 'Date',
      default: Date.now,
    },
  },
  options: {
    timestamps: true,
  },
})
