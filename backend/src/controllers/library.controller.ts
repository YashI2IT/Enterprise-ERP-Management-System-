import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Book } from '../models/book.model';
import { BookIssue, IssueStatus } from '../models/bookIssue.model';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. Add new Book
export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Books
export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Issue a Book
export const issueBook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookId, userId, dueDate } = req.body;

    const book = await Book.findById(bookId).session(session);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.availableCopies <= 0) {
      throw new AppError('No copies of this book are currently available', 400);
    }

    // Check if user already has this book issued and not returned
    const existingIssue = await BookIssue.findOne({
      book: bookId,
      issuedTo: userId,
      status: { $ne: IssueStatus.RETURNED }
    }).session(session);

    if (existingIssue) {
      throw new AppError('This user already has an active issue for this book', 400);
    }

    const issue = await BookIssue.create([{
      book: bookId,
      issuedTo: userId,
      issuedBy: req.user._id,
      dueDate: new Date(dueDate),
      status: IssueStatus.ISSUED,
    }], { session });

    // Decrement available copies
    book.availableCopies -= 1;
    await book.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: issue[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// 4. Return a Book
export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { issueId } = req.params;

    const issue = await BookIssue.findById(issueId).session(session);
    if (!issue) {
      throw new AppError('Book issue record not found', 404);
    }

    if (issue.status === IssueStatus.RETURNED) {
      throw new AppError('This book is already marked as returned', 400);
    }

    const book = await Book.findById(issue.book).session(session);
    if (!book) {
      throw new AppError('Book associated with this issue not found', 404);
    }

    // Update Issue status
    issue.status = IssueStatus.RETURNED;
    issue.returnDate = new Date();
    await issue.save({ session });

    // Increment available copies
    book.availableCopies += 1;
    await book.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: issue,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// 5. Get Issued Books
export const getIssuedBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, userId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.issuedTo = userId;

    const issues = await BookIssue.find(filter)
      .populate('book', 'title author isbn')
      .populate('issuedTo', 'firstName lastName email role')
      .populate('issuedBy', 'firstName lastName')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};
