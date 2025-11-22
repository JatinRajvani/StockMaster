import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
// icons removed from this page
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@/shims/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// icons inlined above; removed shared icons import
import { Skeleton } from "@/components/ui/skeleton";

export default function Transfers() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    transfer_number: '',
    from_location: '',
    to_location: '',
    status: 'draft',
    transfer_date: new Date().toISOString().split('T')[0],
    items: [],
    notes: '',
  });
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantity: 0,
  });

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => base44.entities.Transfer.list('-updated_date'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transfer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (transfer) => {
      await base44.entities.Transfer.update(transfer.id, { status: 'done' });
      
      for (const item of transfer.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await base44.entities.MoveHistory.create({
            operation_type: 'transfer',
            reference_number: transfer.transfer_number,
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unit: product.unit_of_measure,
            from_location: transfer.from_location,
            to_location: transfer.to_location,
            operation_date: transfer.transfer_date,
            performed_by: 'Current User',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers']);
    },
  });

  const handleAddItem = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0) return;
    
    const product = products.find(p => p.id === currentItem.product_id);
    if (!product) return;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          quantity: currentItem.quantity,
          unit: product.unit_of_measure,
        },
      ],
    });
    setCurrentItem({ product_id: '', quantity: 0 });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      transfer_number: '',
      from_location: '',
      to_location: '',
      status: 'draft',
      transfer_date: new Date().toISOString().split('T')[0],
      items: [],
      notes: '',
    });
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800 border-slate-300',
    waiting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ready: 'bg-blue-100 text-blue-800 border-blue-300',
    done: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Internal Transfers</h1>
          <p className="text-slate-500 mt-1">Move stock between locations</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          variant="primary"
        >
          New Transfer
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No transfers found. Create your first internal transfer.
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-medium">{transfer.transfer_number}</TableCell>
                    <TableCell>{transfer.from_location}</TableCell>
                    <TableCell>{transfer.to_location}</TableCell>
                    <TableCell>{new Date(transfer.transfer_date).toLocaleDateString()}</TableCell>
                    <TableCell>{transfer.items?.length || 0} items</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[transfer.status]} border`}>
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {transfer.status !== 'done' && (
                        <Button
                          size="sm"
                          onClick={() => validateMutation.mutate(transfer)}
                          variant="success"
                        >
                          Validate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Transfer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer_number">Transfer Number *</Label>
                <Input
                  id="transfer_number"
                  value={formData.transfer_number}
                  onChange={(e) => setFormData({ ...formData, transfer_number: e.target.value })}
                  placeholder="TRN-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer_date">Transfer Date *</Label>
                <Input
                  id="transfer_date"
                  type="date"
                  value={formData.transfer_date}
                  onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_location">From Location *</Label>
                <Select value={formData.from_location} onValueChange={(value) => setFormData({ ...formData, from_location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_location">To Location *</Label>
                <Select value={formData.to_location} onValueChange={(value) => setFormData({ ...formData, to_location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Items</Label>
              <div className="flex gap-3">
                <Select value={currentItem.product_id} onValueChange={(value) => setCurrentItem({ ...currentItem, product_id: value })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={currentItem.quantity || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-32"
                />
                <Button type="button" onClick={handleAddItem} variant="outline">
                  Add
                </Button>
              </div>

              {formData.items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Transfer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}