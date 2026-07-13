import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ClassTimetable() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [searchGrade, setSearchGrade] = useState('10');
  const [searchSection, setSearchSection] = useState('A');
  
  const [formData, setFormData] = useState({
    grade: '10',
    section: 'A',
    dayOfWeek: 'MONDAY',
    periodNumber: '1',
    subject: '',
    teacher: '',
    startTime: '09:00',
    endTime: '09:45',
  });

  const { data: timetable, isLoading } = useQuery({
    queryKey: ['academic-timetable', searchGrade, searchSection],
    queryFn: async () => {
      const res = await api.get(`/academic/timetable?grade=${searchGrade}&section=${searchSection}`);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/academic/timetable', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Timetable slot saved successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['academic-timetable'] });
      // Keep grade/section selected
      setFormData({...formData, subject: '', teacher: ''});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save timetable slot');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      periodNumber: Number(formData.periodNumber),
    });
  };

  const getSlot = (day: string, period: number) => {
    return timetable?.find((t: any) => t.dayOfWeek === day && t.periodNumber === period);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Class Timetable</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Add Timetable Slot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Schedule Slot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Input 
                    value={formData.grade}
                    onChange={(e: any) => setFormData({...formData, grade: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input 
                    value={formData.section}
                    onChange={(e: any) => setFormData({...formData, section: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select 
                    value={formData.dayOfWeek} 
                    onValueChange={(val: any) => setFormData({...formData, dayOfWeek: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Period No.</Label>
                  <Input 
                    type="number"
                    min="1" max="10"
                    value={formData.periodNumber}
                    onChange={(e: any) => setFormData({...formData, periodNumber: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  value={formData.subject}
                  onChange={(e: any) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Teacher (User ID)</Label>
                <Input 
                  value={formData.teacher}
                  onChange={(e: any) => setFormData({...formData, teacher: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">Paste User ObjectId here for now.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time"
                    value={formData.startTime}
                    onChange={(e: any) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time"
                    value={formData.endTime}
                    onChange={(e: any) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Slot'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Timetable For</CardTitle>
            <Input 
              className="w-24" 
              placeholder="Grade" 
              value={searchGrade} 
              onChange={(e: any) => setSearchGrade(e.target.value)} 
            />
            <Input 
              className="w-24" 
              placeholder="Section" 
              value={searchSection} 
              onChange={(e: any) => setSearchSection(e.target.value)} 
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p>Loading schedule...</p>
          ) : (
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2 text-sm font-semibold text-center mb-2">
                <div className="p-2 border rounded bg-muted">Period</div>
                {DAYS.map(d => (
                  <div key={d} className="p-2 border rounded bg-muted">{d.substring(0,3)}</div>
                ))}
              </div>
              
              {PERIODS.map(period => (
                <div key={period} className="grid grid-cols-6 gap-2 text-sm text-center mb-2">
                  <div className="p-2 border rounded flex items-center justify-center font-semibold bg-muted/30">
                    P{period}
                  </div>
                  {DAYS.map(day => {
                    const slot = getSlot(day, period);
                    return (
                      <div key={`${day}-${period}`} className={`p-2 border rounded flex flex-col items-center justify-center min-h-[80px] ${slot ? 'bg-primary/5 border-primary/20' : 'bg-secondary/10'}`}>
                        {slot ? (
                          <>
                            <div className="font-bold">{slot.subject}</div>
                            <div className="text-xs text-muted-foreground">{slot.startTime} - {slot.endTime}</div>
                            <div className="text-xs mt-1 truncate max-w-[120px]">{slot.teacher?.firstName} {slot.teacher?.lastName}</div>
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">Free</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
