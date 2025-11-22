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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Package, AlertTriangle, CheckCircle2 } from '@/components/icons';
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'other',
    unit_of_measure: 'units',
    current_stock: 0,
    reorder_point: 10,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'other',
      unit_of_measure: 'units',
      current_stock: 0,
      reorder_point: 10,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit_of_measure: product.unit_of_measure,
      current_stock: product.current_stock,
      reorder_point: product.reorder_point,
    });
    setIsDialogOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const name = p.name || ''
    const sku = p.sku || ''
    const category = p.category || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product) => {
    if (product.current_stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle };
    if (product.current_stock <= product.reorder_point) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your product catalog and inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Code *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_materials">Raw Materials</SelectItem>
                      <SelectItem value="finished_goods">Finished Goods</SelectItem>
                      <SelectItem value="components">Components</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="consumables">Consumables</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit of Measure</Label>
                  <Select value={formData.unit_of_measure} onValueChange={(value) => setFormData({ ...formData, unit_of_measure: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="g">Grams</SelectItem>
                      <SelectItem value="lbs">Pounds</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="ml">Milliliters</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="cm">Centimeters</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="pallets">Pallets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Initial Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder_point">Reorder Point</Label>
                  <Input
                    id="reorder_point"
                    type="number"
                    min="0"
                    value={formData.reorder_point}
                    onChange={(e) => setFormData({ ...formData, reorder_point: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600">
                  {editingProduct ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="raw_materials">Raw Materials</SelectItem>
                <SelectItem value="finished_goods">Finished Goods</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="capitalize">{(product.category || '').replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          {product.current_stock} {product.unit_of_measure || ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${status.color} border flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}