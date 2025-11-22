import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@/shims/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Warehouse as WarehouseIcon } from '@/components/icons';
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    type: 'main_warehouse',
    is_active: true,
  });

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Warehouse.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Warehouse.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      location: '',
      type: 'main_warehouse',
      is_active: true,
    });
    setEditingWarehouse(null);
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location || '',
      type: warehouse.type,
      is_active: warehouse.is_active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage warehouses and system configuration</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl">Warehouses</CardTitle>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No warehouses found. Add your first warehouse to get started.
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell className="font-mono text-sm">{warehouse.code}</TableCell>
                    <TableCell className="text-slate-600">{warehouse.location || '-'}</TableCell>
                    <TableCell className="capitalize">{(warehouse.type || '').replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={warehouse.is_active ? 'bg-green-100 text-green-800 border-green-300' : 'bg-slate-100 text-slate-800 border-slate-300'}>
                        {warehouse.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(warehouse)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Warehouse Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Physical address or location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_warehouse">Main Warehouse</SelectItem>
                  <SelectItem value="production_floor">Production Floor</SelectItem>
                  <SelectItem value="retail_store">Retail Store</SelectItem>
                  <SelectItem value="storage_rack">Storage Rack</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600">
                {editingWarehouse ? 'Update' : 'Create'} Warehouse
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}