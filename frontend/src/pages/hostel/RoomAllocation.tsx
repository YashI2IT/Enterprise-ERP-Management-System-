import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { BedDouble, UserPlus, LogOut } from 'lucide-react';

export default function RoomAllocation() {
  const queryClient = useQueryClient();
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [studentIdToAllocate, setStudentIdToAllocate] = useState('');

  const [roomData, setRoomData] = useState({
    hostel: '',
    roomNumber: '',
    capacity: '2',
    type: 'NON_AC',
    rentPerMonth: '5000',
  });

  const { data: hostels } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      return res.data.data;
    },
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['hostel-rooms'],
    queryFn: async () => {
      const res = await api.get('/hostels/rooms');
      return res.data.data;
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/hostels/rooms', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Room created successfully');
      setIsAddRoomOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      setRoomData({ ...roomData, roomNumber: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create room');
    },
  });

  const allocateMutation = useMutation({
    mutationFn: async (data: { roomId: string, studentId: string }) => {
      const res = await api.post('/hostels/rooms/allocate', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Student allocated to room');
      setIsAllocateOpen(false);
      setStudentIdToAllocate('');
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to allocate student');
    },
  });

  const vacateMutation = useMutation({
    mutationFn: async (data: { roomId: string, studentId: string }) => {
      const res = await api.post('/hostels/rooms/vacate', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Student vacated from room');
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to vacate student');
    },
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    createRoomMutation.mutate({
      ...roomData,
      capacity: Number(roomData.capacity),
      rentPerMonth: Number(roomData.rentPerMonth),
    });
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    allocateMutation.mutate({ roomId: selectedRoom._id, studentId: studentIdToAllocate });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Room Allocation</h1>
        
        <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
          <DialogTrigger>
            <Button variant="outline">Add New Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Hostel Building</Label>
                <Select 
                  value={roomData.hostel} 
                  onValueChange={(val: any) => setRoomData({...roomData, hostel: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Select Hostel" /></SelectTrigger>
                  <SelectContent>
                    {hostels?.map((h: any) => (
                      <SelectItem key={h._id} value={h._id}>{h.name} ({h.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input 
                    value={roomData.roomNumber}
                    onChange={(e: any) => setRoomData({...roomData, roomNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (Beds)</Label>
                  <Input 
                    type="number" min="1"
                    value={roomData.capacity}
                    onChange={(e: any) => setRoomData({...roomData, capacity: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={roomData.type} 
                    onValueChange={(val: any) => setRoomData({...roomData, type: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NON_AC">Non-AC</SelectItem>
                      <SelectItem value="AC">AC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rent Per Month (₹)</Label>
                  <Input 
                    type="number" min="0"
                    value={roomData.rentPerMonth}
                    onChange={(e: any) => setRoomData({...roomData, rentPerMonth: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending ? 'Saving...' : 'Add Room'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Student to Room {selectedRoom?.roomNumber}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAllocate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Student Profile ID</Label>
              <Input 
                placeholder="Paste Student ObjectId here" 
                value={studentIdToAllocate}
                onChange={(e: any) => setStudentIdToAllocate(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Ensure student is not already allocated to a room.</p>
            </div>
            <Button type="submit" className="w-full" disabled={allocateMutation.isPending}>
              {allocateMutation.isPending ? 'Allocating...' : 'Allocate Room'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {roomsLoading ? (
        <p>Loading rooms...</p>
      ) : rooms?.length === 0 ? (
        <p className="text-muted-foreground">No rooms found. Add rooms to begin allocation.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms?.map((room: any) => (
            <Card key={room._id} className={room.occupants.length >= room.capacity ? 'border-red-200 bg-red-50/10' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BedDouble className="h-5 w-5 text-primary" />
                      Room {room.roomNumber}
                    </CardTitle>
                    <CardDescription>{room.hostel?.name}</CardDescription>
                  </div>
                  <Badge variant={room.occupants.length >= room.capacity ? 'destructive' : 'secondary'}>
                    {room.occupants.length} / {room.capacity} Full
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Type: {room.type}</span>
                  <span>Rent: ₹{room.rentPerMonth}/mo</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Occupants:</p>
                  {room.occupants.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Room is empty</p>
                  ) : (
                    <ul className="space-y-2">
                      {room.occupants.map((occ: any) => (
                        <li key={occ._id} className="text-sm flex justify-between items-center bg-muted/50 p-2 rounded">
                          <span>
                            {occ.user?.firstName} {occ.user?.lastName} <span className="text-xs text-muted-foreground">({occ.admissionNumber})</span>
                          </span>
                          <Button 
                            variant="ghost" size="icon" className="h-6 w-6 text-red-500"
                            onClick={() => vacateMutation.mutate({ roomId: room._id, studentId: occ._id })}
                            disabled={vacateMutation.isPending}
                          >
                            <LogOut className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={room.occupants.length >= room.capacity}
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsAllocateOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Allocate Student
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
