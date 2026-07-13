import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export enum HostelType {
  BOYS = 'BOYS',
  GIRLS = 'GIRLS',
  STAFF = 'STAFF',
}

export interface IHostel extends Document {
  name: string;
  type: HostelType;
  capacity: number; // Total beds across all rooms
  warden?: mongoose.Types.ObjectId | IUser;
  address: string;
}

const hostelSchema = new Schema<IHostel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(HostelType),
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    warden: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Hostel = mongoose.model<IHostel>('Hostel', hostelSchema);
