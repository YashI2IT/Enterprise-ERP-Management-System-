import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Building, Users, Bed, Shield } from 'lucide-react';

export default function HostelDashboard() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'BOYS',
    capacity: '',
    address: '',
    warden: '',
  });

  const { data: hostels, isLoading: hostelsLoading } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/hostels', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Hostel created successfully');
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      setFormData({ name: '', type: 'BOYS', capacity: '', address: '', warden: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create hostel');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      capacity: Number(formData.capacity),
    });
  };

  if (hostelsLoading) return <div className="p-6">Loading...</div>;

  let totalCapacity = 0;
  hostels?.forEach((h: any) => totalCapacity += h.capacity);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Hostel Overview</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>Add Hostel Building</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Hostel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Hostel Name</Label>
                <Input 
                  placeholder="e.g. Boys Hostel A" 
                  value={formData.name}
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val: any) => setFormData({...formData, type: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOYS">Boys</SelectItem>
                      <SelectItem value="GIRLS">Girls</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total Capacity (Beds)</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e: any) => setFormData({...formData, capacity: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Warden (User ID)</Label>
                <Input 
                  placeholder="Optional: Paste User ID"
                  value={formData.warden}
                  onChange={(e: any) => setFormData({...formData, warden: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Address / Location details</Label>
                <Input 
                  value={formData.address}
                  onChange={(e: any) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Create Hostel'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostels?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity (Beds)</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Info</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mt-2">See Room Allocation for details</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hostel Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          {hostels?.length === 0 ? (
            <p className="text-muted-foreground">No hostels established.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Warden</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostels?.map((h: any) => (
                  <TableRow key={h._id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      {h.name}
                    </TableCell>
                    <TableCell>{h.type}</TableCell>
                    <TableCell>
                      {h.warden ? (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {h.warden.firstName} {h.warden.lastName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{h.capacity}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{h.address}</TableCell>
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
