import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export interface ITimetable extends Document {
  grade: string;
  section: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  subject: string;
  teacher: mongoose.Types.ObjectId | IUser;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "09:45"
}

const timetableSchema = new Schema<ITimetable>(
  {
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    dayOfWeek: {
      type: String,
      enum: Object.values(DayOfWeek),
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overlapping periods for the same class
timetableSchema.index({ grade: 1, section: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);
