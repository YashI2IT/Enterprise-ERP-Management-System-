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

export default function ExamResults() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    exam: '',
    student: '',
    subject: '',
    marksObtained: '',
    maxMarks: '100',
    grade: '',
    remarks: '',
  });

  const { data: exams } = useQuery({
    queryKey: ['academic-exams'],
    queryFn: async () => {
      const res = await api.get('/academic/exams');
      return res.data.data;
    },
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['academic-results'],
    queryFn: async () => {
      const res = await api.get('/academic/results');
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/academic/results', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Result saved successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['academic-results'] });
      setFormData({...formData, student: '', marksObtained: '', grade: '', remarks: ''}); // Keep exam/subject
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save result');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      marksObtained: Number(formData.marksObtained),
      maxMarks: Number(formData.maxMarks),
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Enter Result</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter/Update Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Exam</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.exam}
                  onChange={(e: any) => setFormData({...formData, exam: e.target.value})}
                  required
                >
                  <option value="">-- Select Exam --</option>
                  {exams?.map((ex: any) => (
                    <option key={ex._id} value={ex._id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Student Profile ID</Label>
                <Input 
                  placeholder="Paste Student Profile ID" 
                  value={formData.student}
                  onChange={(e: any) => setFormData({...formData, student: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  placeholder="e.g. Mathematics" 
                  value={formData.subject}
                  onChange={(e: any) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marks Obtained</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={formData.marksObtained}
                    onChange={(e: any) => setFormData({...formData, marksObtained: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Marks</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e: any) => setFormData({...formData, maxMarks: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grade (Optional)</Label>
                  <Input 
                    value={formData.grade}
                    onChange={(e: any) => setFormData({...formData, grade: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remarks (Optional)</Label>
                  <Input 
                    value={formData.remarks}
                    onChange={(e: any) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Result'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results Repository</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading results...</p>
          ) : results?.length === 0 ? (
            <p className="text-muted-foreground">No results published yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((res: any) => (
                  <TableRow key={res._id}>
                    <TableCell className="font-medium">{res.exam?.name}</TableCell>
                    <TableCell>
                      {res.student?.user?.firstName} {res.student?.user?.lastName}
                      <div className="text-xs text-muted-foreground">{res.student?.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{res.subject}</TableCell>
                    <TableCell className="font-semibold">
                      {res.marksObtained} / {res.maxMarks}
                    </TableCell>
                    <TableCell>{res.grade || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{res.remarks || '-'}</TableCell>
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
