import mongoose, { Document, Schema } from 'mongoose';
import { IExam } from './exam.model';
import { IStudentProfile } from './student.model';

export interface IExamResult extends Document {
  exam: mongoose.Types.ObjectId | IExam;
  student: mongoose.Types.ObjectId | IStudentProfile;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

const examResultSchema = new Schema<IExamResult>(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    grade: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student only has one result per subject per exam
examResultSchema.index({ exam: 1, student: 1, subject: 1 }, { unique: true });

export const ExamResult = mongoose.model<IExamResult>('ExamResult', examResultSchema);
