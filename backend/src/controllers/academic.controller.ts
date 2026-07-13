import { Request, Response, NextFunction } from 'express';
import { Exam } from '../models/exam.model';
import { ExamResult } from '../models/examResult.model';
import { Timetable } from '../models/timetable.model';
import { AppError } from '../middlewares/error.middleware';

// ==========================
// EXAMS
// ==========================

// Create Exam
export const createExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// Get Exams
export const getExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exams = await Exam.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
};

// ==========================
// EXAM RESULTS
// ==========================

// Add or Update Result
export const saveResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exam, student, subject, marksObtained, maxMarks, grade, remarks } = req.body;
    
    // Upsert to handle both creation and updates
    const result = await ExamResult.findOneAndUpdate(
      { exam, student, subject },
      { marksObtained, maxMarks, grade, remarks },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Get Results (Filtered by exam and/or student)
export const getResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { examId, studentId } = req.query;
    const filter: any = {};
    if (examId) filter.exam = examId;
    if (studentId) filter.student = studentId;

    const results = await ExamResult.find(filter)
      .populate('exam', 'name startDate')
      .populate({
        path: 'student',
        select: 'admissionNumber currentGrade section user',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        },
      });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// ==========================
// TIMETABLE
// ==========================

// Create Timetable Slot
export const createTimetableSlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slot = await Timetable.create(req.body);
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    next(error);
  }
};

// Get Timetable (Filtered by grade and section)
export const getTimetable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { grade, section } = req.query;
    if (!grade || !section) {
      return next(new AppError('Please provide both grade and section parameters', 400));
    }

    const schedule = await Timetable.find({ 
      grade: String(grade), 
      section: String(section) 
    })
      .populate('teacher', 'firstName lastName')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
