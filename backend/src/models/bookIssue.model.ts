import mongoose, { Document, Schema } from 'mongoose';
import { IBook } from './book.model';
import { IUser } from './user.model';

export enum IssueStatus {
  ISSUED = 'ISSUED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

export interface IBookIssue extends Document {
  book: mongoose.Types.ObjectId | IBook;
  issuedTo: mongoose.Types.ObjectId | IUser;
  issuedBy: mongoose.Types.ObjectId | IUser; // Librarian who issued it
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: IssueStatus;
}

const bookIssueSchema = new Schema<IBookIssue>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    issuedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.ISSUED,
    },
  },
  {
    timestamps: true,
  }
);

export const BookIssue = mongoose.model<IBookIssue>('BookIssue', bookIssueSchema);
