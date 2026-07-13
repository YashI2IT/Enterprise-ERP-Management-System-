import { Request, Response, NextFunction } from 'express';
import { Hostel } from '../models/hostel.model';
import { Room } from '../models/room.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// ==========================
// HOSTELS
// ==========================

export const createHostel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json({ success: true, data: hostel });
  } catch (error) {
    next(error);
  }
};

export const getHostels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostels = await Hostel.find().populate('warden', 'firstName lastName');
    res.status(200).json({ success: true, data: hostels });
  } catch (error) {
    next(error);
  }
};

// ==========================
// ROOMS
// ==========================

export const addRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hostelId } = req.query;
    const filter: any = {};
    if (hostelId) filter.hostel = hostelId;

    const rooms = await Room.find(filter)
      .populate('hostel', 'name type')
      .populate({
        path: 'occupants',
        select: 'admissionNumber user',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        },
      })
      .sort({ roomNumber: 1 });

    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const allocateRoom = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, studentId } = req.body;

    const room = await Room.findById(roomId).session(session);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (room.occupants.length >= room.capacity) {
      throw new AppError('This room is already at full capacity', 400);
    }

    // Check if student is already in a room
    const existingRoom = await Room.findOne({ occupants: studentId }).session(session);
    if (existingRoom) {
      throw new AppError(`Student is already allocated to Room ${existingRoom.roomNumber}`, 400);
    }

    room.occupants.push(studentId);
    await room.save({ session });

    await session.commitTransaction();

    res.status(200).json({ 
      success: true, 
      message: 'Student allocated to room successfully',
      data: room 
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const vacateRoom = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, studentId } = req.body;

    const room = await Room.findById(roomId).session(session);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (!room.occupants.includes(studentId)) {
      throw new AppError('Student is not an occupant of this room', 400);
    }

    room.occupants = room.occupants.filter((id) => id.toString() !== studentId.toString());
    await room.save({ session });

    await session.commitTransaction();

    res.status(200).json({ 
      success: true, 
      message: 'Student vacated from room successfully',
      data: room 
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
