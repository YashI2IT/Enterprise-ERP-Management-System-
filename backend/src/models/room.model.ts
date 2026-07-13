import mongoose, { Document, Schema } from 'mongoose';
import { IHostel } from './hostel.model';
import { IStudentProfile } from './student.model';

export enum RoomType {
  AC = 'AC',
  NON_AC = 'NON_AC',
}

export interface IRoom extends Document {
  hostel: mongoose.Types.ObjectId | IHostel;
  roomNumber: string;
  capacity: number; // Number of beds
  occupants: (mongoose.Types.ObjectId | IStudentProfile)[];
  type: RoomType;
  rentPerMonth: number;
}

const roomSchema = new Schema<IRoom>(
  {
    hostel: {
      type: Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    occupants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StudentProfile',
      },
    ],
    type: {
      type: String,
      enum: Object.values(RoomType),
      default: RoomType.NON_AC,
    },
    rentPerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate room numbers within the same hostel
roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

export const Room = mongoose.model<IRoom>('Room', roomSchema);
