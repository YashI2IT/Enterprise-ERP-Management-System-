import mongoose, { Document, Schema } from 'mongoose';

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export interface IExam extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: ExamStatus;
}

const examSchema = new Schema<IExam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ExamStatus),
      default: ExamStatus.UPCOMING,
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model<IExam>('Exam', examSchema);
