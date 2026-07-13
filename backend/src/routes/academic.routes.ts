import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';
import {
  createExam,
  getExams,
  saveResult,
  getResults,
  createTimetableSlot,
  getTimetable
} from '../controllers/academic.controller';

const router = express.Router();

router.use(protect);

// Exams
router.post('/exams', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL), createExam);
router.get('/exams', getExams);

// Results
router.post('/results', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER), saveResult);
router.get('/results', getResults);

// Timetable
router.post('/timetable', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL), createTimetableSlot);
router.get('/timetable', getTimetable);

export default router;
