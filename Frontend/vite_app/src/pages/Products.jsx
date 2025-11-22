import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@/shims/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const queryClient = useQueryClient();

  // ---------------- STATE -----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unit: "units",
    currentStock: 0,
    reorderLevel: 10,
  });

  // ---------------- FETCH CATEGORIES -----------------
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories/all");
      const data = await res.json();
      return data.categories;
    },
  });

  // ---------------- FETCH PRODUCTS -----------------
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      return data.products;
    },
  });

  // ---------------- CREATE PRODUCT -----------------
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // ---------------- UPDATE PRODUCT -----------------
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // ---------------- HANDLERS -----------------

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      unit: formData.unit,
      currentStock: formData.currentStock,
      reorderLevel: formData.reorderLevel,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.productId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      categoryId: "",
      unit: "units",
      currentStock: 0,
      reorderLevel: 10,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      unit: product.unit,
      currentStock: product.currentStock,
      reorderLevel: product.reorderLevel,
    });
    setIsDialogOpen(true);
  };

  // ---------------- STOCK STATUS -----------------

  const getStockStatus = (product) => {
    if (product.currentStock === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800 border-red-300" };

    if (product.currentStock <= product.reorderLevel)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };

    return { label: "In Stock", color: "bg-green-100 text-green-800 border-green-300" };
  };

  // ---------------- FILTERING -----------------

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || p.categoryId === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // ---------------- UI -----------------

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-slate-500">Manage your product catalog and inventory</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="primary">Add Product</Button>
          </DialogTrigger>

          {/* FORM DIALOG */}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME + SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div>
                  <Label>SKU *</Label>
                  <Input required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                </div>
              </div>

              {/* CATEGORY + UNIT */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="g">Grams</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* STOCK + REORDER */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Initial Stock</Label>
                  <Input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Reorder Level</Label>
                  <Input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" variant="primary">
                  {editingProduct ? "Update" : "Create"} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* PRODUCT LIST TABLE */}
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            {/* SEARCH */}
            <div className="relative flex-1">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* CATEGORY FILTER */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </SelectItem>
                ))}
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
                  [...Array(5)].map((_, i) => (
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
                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product);

                    return (
                      <TableRow key={product.productId}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>
                          {categories.find(c => c.categoryId === product.categoryId)?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {product.currentStock} {product.unit}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${status.color} border`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
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
