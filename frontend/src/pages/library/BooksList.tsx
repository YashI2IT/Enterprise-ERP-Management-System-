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

export default function BooksList() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: '',
    shelfLocation: '',
  });

  const { data: books, isLoading } = useQuery({
    queryKey: ['library-books', searchTerm],
    queryFn: async () => {
      const res = await api.get(`/library/books${searchTerm ? `?search=${searchTerm}` : ''}`);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newBook: any) => {
      const res = await api.post('/library/books', newBook);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book added successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      setFormData({
        title: '', author: '', isbn: '', category: '', totalCopies: '', shelfLocation: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add book');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      totalCopies: Number(formData.totalCopies),
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Book Catalog</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Add New Book</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={formData.title}
                  onChange={(e: any) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input 
                  value={formData.author}
                  onChange={(e: any) => setFormData({...formData, author: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ISBN</Label>
                  <Input 
                    value={formData.isbn}
                    onChange={(e: any) => setFormData({...formData, isbn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={formData.category}
                    onChange={(e: any) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Copies</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e: any) => setFormData({...formData, totalCopies: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shelf Location</Label>
                  <Input 
                    value={formData.shelfLocation}
                    onChange={(e: any) => setFormData({...formData, shelfLocation: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Book'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catalog</CardTitle>
            <Input 
              placeholder="Search title, author, ISBN..." 
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading books...</p>
          ) : books?.length === 0 ? (
            <p className="text-muted-foreground">No books found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead className="text-right">Available/Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book: any) => (
                  <TableRow key={book._id}>
                    <TableCell className="font-medium">
                      {book.title}
                      <div className="text-xs text-muted-foreground">ISBN: {book.isbn || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell>{book.shelfLocation}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${book.availableCopies === 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {book.availableCopies}
                      </span>
                      <span className="text-muted-foreground"> / {book.totalCopies}</span>
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
