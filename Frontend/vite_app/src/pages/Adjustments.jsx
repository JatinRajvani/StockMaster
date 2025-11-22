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
import { Plus, Trash2, CheckCircle, ClipboardList } from '@/components/icons';
import { Skeleton } from "@/components/ui/skeleton";

export default function Adjustments() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    adjustment_number: '',
    warehouse: '',
    adjustment_type: 'physical_count',
    status: 'draft',
    adjustment_date: new Date().toISOString().split('T')[0],
    items: [],
    notes: '',
  });
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    recorded_quantity: 0,
    counted_quantity: 0,
  });

  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ['adjustments'],
    queryFn: () => base44.entities.Adjustment.list('-updated_date'),
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
    mutationFn: (data) => base44.entities.Adjustment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adjustments']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (adjustment) => {
      await base44.entities.Adjustment.update(adjustment.id, { status: 'done' });
      
      for (const item of adjustment.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const newStock = Math.max(0, (product.current_stock || 0) + item.difference);
          await base44.entities.Product.update(product.id, {
            current_stock: newStock,
          });
          
          await base44.entities.MoveHistory.create({
            operation_type: 'adjustment',
            reference_number: adjustment.adjustment_number,
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity: Math.abs(item.difference),
            unit: product.unit_of_measure,
            from_location: item.difference < 0 ? adjustment.warehouse : 'Adjustment',
            to_location: item.difference > 0 ? adjustment.warehouse : 'Adjustment',
            operation_date: adjustment.adjustment_date,
            performed_by: 'Current User',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adjustments']);
      queryClient.invalidateQueries(['products']);
    },
  });

  const handleAddItem = () => {
    if (!currentItem.product_id) return;
    
    const product = products.find(p => p.id === currentItem.product_id);
    if (!product) return;

    const difference = currentItem.counted_quantity - currentItem.recorded_quantity;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          recorded_quantity: currentItem.recorded_quantity,
          counted_quantity: currentItem.counted_quantity,
          difference: difference,
          unit: product.unit_of_measure,
        },
      ],
    });
    setCurrentItem({ product_id: '', recorded_quantity: 0, counted_quantity: 0 });
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
      adjustment_number: '',
      warehouse: '',
      adjustment_type: 'physical_count',
      status: 'draft',
      adjustment_date: new Date().toISOString().split('T')[0],
      items: [],
      notes: '',
    });
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800 border-slate-300',
    done: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stock Adjustments</h1>
          <p className="text-slate-500 mt-1">Fix mismatches between recorded and physical stock</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adjustment #</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Type</TableHead>
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
              ) : adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No adjustments found. Create your first stock adjustment.
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono font-medium">{adjustment.adjustment_number}</TableCell>
                    <TableCell>{adjustment.warehouse}</TableCell>
                    <TableCell className="capitalize">{(adjustment.adjustment_type || '').replace(/_/g, ' ')}</TableCell>
                    <TableCell>{new Date(adjustment.adjustment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{adjustment.items?.length || 0} items</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[adjustment.status]} border`}>
                        {adjustment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {adjustment.status !== 'done' && (
                        <Button
                          size="sm"
                          onClick={() => validateMutation.mutate(adjustment)}
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
            <DialogTitle>Create New Adjustment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adjustment_number">Adjustment Number *</Label>
                <Input
                  id="adjustment_number"
                  value={formData.adjustment_number}
                  onChange={(e) => setFormData({ ...formData, adjustment_number: e.target.value })}
                  placeholder="ADJ-001"
                  required
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adjustment_type">Adjustment Type</Label>
                <Select value={formData.adjustment_type} onValueChange={(value) => setFormData({ ...formData, adjustment_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical_count">Physical Count</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustment_date">Adjustment Date *</Label>
                <Input
                  id="adjustment_date"
                  type="date"
                  value={formData.adjustment_date}
                  onChange={(e) => setFormData({ ...formData, adjustment_date: e.target.value })}
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
                  placeholder="Recorded"
                  value={currentItem.recorded_quantity || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, recorded_quantity: parseFloat(e.target.value) || 0 })}
                  className="w-28"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Counted"
                  value={currentItem.counted_quantity || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, counted_quantity: parseFloat(e.target.value) || 0 })}
                  className="w-28"
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
                        <TableHead>Recorded</TableHead>
                        <TableHead>Counted</TableHead>
                        <TableHead>Difference</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell>{item.recorded_quantity}</TableCell>
                          <TableCell>{item.counted_quantity}</TableCell>
                          <TableCell>
                            <span className={item.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.difference > 0 ? '+' : ''}{item.difference}
                            </span>
                          </TableCell>
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
                Create Adjustment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}