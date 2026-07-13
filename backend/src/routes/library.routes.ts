import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';
import {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getIssuedBooks
} from '../controllers/library.controller';

const router = express.Router();

router.use(protect);

// Books
router.post('/books', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), addBook);
router.get('/books', getBooks); // Everyone logged in can view books

// Issue/Return
router.post('/issue', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), issueBook);
router.post('/return/:issueId', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), returnBook);
router.get('/issues', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), getIssuedBooks);

export default router;
