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

export default function BookIssues() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [issueData, setIssueData] = useState({
    bookId: '',
    userId: '', // Ideally a searchable dropdown for users
    dueDate: '',
  });

  const { data: issues, isLoading } = useQuery({
    queryKey: ['library-issues'],
    queryFn: async () => {
      const res = await api.get('/library/issues');
      return res.data.data;
    },
  });

  const { data: books } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const res = await api.get('/library/books');
      return res.data.data;
    },
  });

  const issueMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/library/issue', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book issued successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['library-issues'] });
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      setIssueData({ bookId: '', userId: '', dueDate: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const res = await api.post(`/library/return/${issueId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book returned successfully');
      queryClient.invalidateQueries({ queryKey: ['library-issues'] });
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to return book');
    },
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    issueMutation.mutate(issueData);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'RETURNED') return <Badge className="bg-gray-500">Returned</Badge>;
    if (new Date(dueDate) < new Date()) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge className="bg-blue-500">Issued</Badge>;
  };

  const filteredIssues = issues?.filter((issue: any) => 
    issue.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.issuedTo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Issue & Return</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Issue Book</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleIssue} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Book</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={issueData.bookId}
                  onChange={(e: any) => setIssueData({...issueData, bookId: e.target.value})}
                  required
                >
                  <option value="">-- Select Book --</option>
                  {books?.filter((b: any) => b.availableCopies > 0).map((b: any) => (
                    <option key={b._id} value={b._id}>{b.title} (Available: {b.availableCopies})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input 
                  placeholder="Paste User Object ID here (temporary)" 
                  value={issueData.userId}
                  onChange={(e: any) => setIssueData({...issueData, userId: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">In production, this would be a searchable dropdown.</p>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  value={issueData.dueDate}
                  onChange={(e: any) => setIssueData({...issueData, dueDate: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={issueMutation.isPending}>
                {issueMutation.isPending ? 'Processing...' : 'Issue Book'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active & Past Issues</CardTitle>
            <Input 
              placeholder="Search book or user..." 
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading issues...</p>
          ) : filteredIssues.length === 0 ? (
            <p className="text-muted-foreground">No records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue: any) => (
                  <TableRow key={issue._id}>
                    <TableCell className="font-medium">
                      {issue.book?.title}
                    </TableCell>
                    <TableCell>
                      {issue.issuedTo?.firstName} {issue.issuedTo?.lastName}
                      <div className="text-xs text-muted-foreground">{issue.issuedTo?.role}</div>
                    </TableCell>
                    <TableCell>{new Date(issue.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(issue.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(issue.status, issue.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      {issue.status !== 'RETURNED' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => returnMutation.mutate(issue._id)}
                          disabled={returnMutation.isPending}
                        >
                          Return
                        </Button>
                      )}
                    </TableCell>
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
