import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';
import {
  createHostel,
  getHostels,
  addRoom,
  getRooms,
  allocateRoom,
  vacateRoom
} from '../controllers/hostel.controller';

const router = express.Router();

router.use(protect);

// Hostels
router.post('/', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), createHostel);
router.get('/', getHostels);

// Rooms
router.post('/rooms', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), addRoom);
router.get('/rooms', getRooms);

// Allocation
router.post('/rooms/allocate', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN), allocateRoom);
router.post('/rooms/vacate', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN), vacateRoom);

export default router;
