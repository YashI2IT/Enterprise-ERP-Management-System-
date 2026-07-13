import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, AlertCircle, Library } from 'lucide-react';

export default function LibraryDashboard() {
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const res = await api.get('/library/books');
      return res.data.data;
    },
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['library-issues'],
    queryFn: async () => {
      const res = await api.get('/library/issues');
      return res.data.data;
    },
  });

  if (booksLoading || issuesLoading) return <div className="p-6">Loading dashboard data...</div>;

  let totalBooks = 0;
  let totalCopies = 0;
  let borrowedCopies = 0;
  
  books?.forEach((b: any) => {
    totalBooks++;
    totalCopies += b.totalCopies;
    borrowedCopies += (b.totalCopies - b.availableCopies);
  });

  const overdueIssues = issues?.filter((i: any) => i.status === 'OVERDUE' || (i.status === 'ISSUED' && new Date(i.dueDate) < new Date()))?.length || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Library Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Titles</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Copies</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCopies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{borrowedCopies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueIssues}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
