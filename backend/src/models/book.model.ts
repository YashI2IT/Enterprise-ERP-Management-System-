import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allow multiple nulls if isbn is not known
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    shelfLocation: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure availableCopies <= totalCopies
bookSchema.pre('save', async function () {
  if (this.isModified('totalCopies') && this.isNew) {
    this.availableCopies = this.totalCopies;
  }
  
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
});

export const Book = mongoose.model<IBook>('Book', bookSchema);
