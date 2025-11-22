import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
import { Plus, Trash2, CheckCircle, TruckIcon } from '@/components/icons';
import { Skeleton } from "@/components/ui/skeleton";

export default function Deliveries() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    delivery_number: '',
    customer: '',
    warehouse: '',
    status: 'draft',
    delivery_date: new Date().toISOString().split('T')[0],
    items: [],
    notes: '',
  });
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantity: 0,
  });

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => base44.entities.Delivery.list('-updated_date'),
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
    mutationFn: (data) => base44.entities.Delivery.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['deliveries']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (delivery) => {
      await base44.entities.Delivery.update(delivery.id, { status: 'done' });
      
      for (const item of delivery.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await base44.entities.Product.update(product.id, {
            current_stock: Math.max(0, (product.current_stock || 0) - item.quantity),
          });
          
          await base44.entities.MoveHistory.create({
            operation_type: 'delivery',
            reference_number: delivery.delivery_number,
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unit: product.unit_of_measure,
            from_location: delivery.warehouse,
            to_location: 'Customer',
            operation_date: delivery.delivery_date,
            performed_by: 'Current User',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deliveries']);
      queryClient.invalidateQueries(['products']);
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
      delivery_number: '',
      customer: '',
      warehouse: '',
      status: 'draft',
      delivery_date: new Date().toISOString().split('T')[0],
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
          <h1 className="text-3xl font-bold text-slate-900">Deliveries</h1>
          <p className="text-slate-500 mt-1">Manage outgoing stock to customers</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Delivery
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No deliveries found. Create your first delivery order.
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-medium">{delivery.delivery_number}</TableCell>
                    <TableCell>{delivery.customer}</TableCell>
                    <TableCell>{delivery.warehouse}</TableCell>
                    <TableCell>{new Date(delivery.delivery_date).toLocaleDateString()}</TableCell>
                    <TableCell>{delivery.items?.length || 0} items</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[delivery.status]} border`}>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {delivery.status !== 'done' && (
                        <Button
                          size="sm"
                          onClick={() => validateMutation.mutate(delivery)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
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
            <DialogTitle>Create New Delivery</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_number">Delivery Number *</Label>
                <Input
                  id="delivery_number"
                  value={formData.delivery_number}
                  onChange={(e) => setFormData({ ...formData, delivery_number: e.target.value })}
                  placeholder="DEL-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="Customer name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select value={formData.warehouse} onValueChange={(value) => setFormData({ ...formData, warehouse: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date *</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  required
                />
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
                  <Plus className="w-4 h-4" />
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
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
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
              <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600">
                Create Delivery
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}