import { defineMongooseModel } from '#nuxt/mongoose'

export const FleetSchema = defineMongooseModel({
  name: 'Fleet',
  schema: {
    owner: {
      type: 'ObjectId',
      ref: 'Player',
      required: true,
    },
    ships: [{
      type: {
        type: 'string',
        required: true,
      },
      count: {
        type: 'number',
        required: true,
        min: 1,
      },
    }],
    mission: {
      type: 'string',
      enum: [
        'TAN_CONG',
        'VAN_CHUYEN',
        'TRIEN_KHAI',
        'THUOC_DIA',
        'DO_THAM',
        'TAI_CHE',
      ],
      required: true,
    },
    origin: {
      galaxy: { type: 'number', required: true },
      system: { type: 'number', required: true },
      position: { type: 'number', required: true },
    },
    destination: {
      galaxy: { type: 'number', required: true },
      system: { type: 'number', required: true },
      position: { type: 'number', required: true },
    },
    resources: {
      tinhThach: { type: 'number', default: 0 },
      nangLuongVuTru: { type: 'number', default: 0 },
      honThach: { type: 'number', default: 0 },
    },
    departureTime: {
      type: 'Date',
      required: true,
    },
    arrivalTime: {
      type: 'Date',
      required: true,
    },
    returnTime: {
      type: 'Date',
    },
    status: {
      type: 'string',
      enum: ['DEPARTING', 'ARRIVING', 'RETURNING', 'COMPLETED'],
      default: 'DEPARTING',
    },
    isReturning: {
      type: 'boolean',
      default: false,
    },
  },
  options: {
    timestamps: true,
  },
})
