import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ExamsDashboard() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ['academic-exams'],
    queryFn: async () => {
      const res = await api.get('/academic/exams');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newExam: any) => {
      const res = await api.post('/academic/exams', newExam);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Exam created successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['academic-exams'] });
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'UPCOMING': return <Badge variant="secondary">Upcoming</Badge>;
      case 'ONGOING': return <Badge className="bg-blue-500">Ongoing</Badge>;
      case 'COMPLETED': return <Badge className="bg-green-600">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Schedule New Exam</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Examination</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Exam Name</Label>
                <Input 
                  placeholder="e.g. Term 1 Finals" 
                  value={formData.name}
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={formData.description}
                  onChange={(e: any) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e: any) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e: any) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Create Exam'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading exams...</p>
          ) : exams?.length === 0 ? (
            <p className="text-muted-foreground">No upcoming exams scheduled.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam: any) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">
                      {exam.name}
                      <div className="text-xs text-muted-foreground">{exam.description}</div>
                    </TableCell>
                    <TableCell>{new Date(exam.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(exam.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
