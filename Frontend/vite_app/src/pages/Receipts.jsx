// src/pages/Receipts.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@/shims/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Receipts page — fully integrated with your backend API routes:
 * - GET  /api/receipts
 * - POST /api/receipts/create
 * - POST /api/receipts/:id/validate
 *
 * Behavior/Mapping notes:
 * - Create payload uses: { supplierId, warehouseId, items: [{ productId, orderedQty }] }
 * - The UI shows product name/sku for convenience but sends only productId & orderedQty.
 * - Supplier and Warehouse are plain inputs (strings) per your choice.
 */

export default function Receipts() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // dialog + form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier: "", // will be sent as supplierId (string)
    warehouse: "", // will be sent as warehouseId (string)
    items: [], // UI items: { productId, orderedQty, product_name, sku }
  });

  // temporary item being added
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    orderedQty: 0,
  });

  // ---- Queries ----
  // receipts
  const { data: receipts = [], isLoading: loadingReceipts } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      const res = await fetch("/api/receipts");
      if (!res.ok) throw new Error("Failed to fetch receipts");
      const json = await res.json();
      // controllers return { message, receipts }
      return Array.isArray(json.receipts) ? json.receipts : [];
    },
  });

  // products (for selecting product while adding items)
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // assume backend has /api/products; if different, update this URL
      const res = await fetch("/api/products");
      if (!res.ok) {
        // return empty list gracefully if endpoint missing
        return [];
      }
      const json = await res.json();
      // normalize product id keys (support _id, id, productId)
      return (json.products || json || []).map((p) => ({
        ...p,
        _id: p._id || p.id || p.productId || p._id,
        id: p._id || p.id || p.productId || p._id,
        name: p.name || p.product_name || p.productName || "Unnamed",
        sku: p.sku || p.SKU || "",
        unit: p.unit || p.unit_of_measure || "",
      }));
    },
  });

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/receipts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Create failed" }));
        throw new Error(err.message || "Failed to create receipt");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receipts"]);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (receipt) => {
      // backend expects :id = receiptId (e.g., RC001)
      const id = receipt.receiptId || receipt.receiptId || receipt.id;
      const res = await fetch(`/api/receipts/${encodeURIComponent(id)}/validate`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Validate failed" }));
        throw new Error(err.message || "Failed to validate receipt");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receipts"]);
      // Optionally refresh stock/products if you have endpoints for that
      queryClient.invalidateQueries(["products"]);
    },
  });

  // ---- Helpers ----
  const resetForm = () => {
    setFormData({
      supplier: "",
      warehouse: "",
      items: [],
    });
    setCurrentItem({ productId: "", orderedQty: 0 });
  };

  // Add current item (UI) to formData.items
  const handleAddItem = () => {
    if (!currentItem.productId) return;
    if (!currentItem.orderedQty || Number(currentItem.orderedQty) <= 0) return;

    const productObj = products.find((p) => (p.id || p._id) === currentItem.productId);
    const itemForUI = {
      productId: currentItem.productId,
      orderedQty: Number(currentItem.orderedQty),
      product_name: productObj?.name || "",
      sku: productObj?.sku || "",
      unit: productObj?.unit || "",
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, itemForUI],
    }));
    setCurrentItem({ productId: "", orderedQty: 0 });
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Submit create receipt (map UI fields to backend payload)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate basic fields
    if (!formData.supplier || !formData.warehouse) {
      alert("Supplier and Warehouse are required");
      return;
    }
    if (!Array.isArray(formData.items) || formData.items.length === 0) {
      alert("Add at least one item");
      return;
    }

    const payload = {
      supplierId: formData.supplier, // free text stored as supplierId per your choice
      warehouseId: formData.warehouse, // free text stored as warehouseId
      items: formData.items.map((it) => ({
        productId: it.productId,
        orderedQty: Number(it.orderedQty),
      })),
    };

    createMutation.mutate(payload);
  };

  // human-friendly mapping for status -> badge classes (tailwind-ish)
  const statusColors = {
    Draft: "bg-slate-100 text-slate-800 border-slate-300",
    Waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Ready: "bg-blue-100 text-blue-800 border-blue-300",
    Done: "bg-green-100 text-green-800 border-green-300",
    Canceled: "bg-red-100 text-red-800 border-red-300",
    draft: "bg-slate-100 text-slate-800 border-slate-300",
    waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ready: "bg-blue-100 text-blue-800 border-blue-300",
    done: "bg-green-100 text-green-800 border-green-300",
    canceled: "bg-red-100 text-red-800 border-red-300",
  };

  // normalize receipts for display (some controllers may return different key names)
  const normalizedReceipts = useMemo(() => {
    return (receipts || []).map((r) => ({
      ...r,
      receiptId: r.receiptId || r.receipt_id || r._id || r.id,
      supplierId: r.supplierId || r.supplier || "",
      warehouseId: r.warehouseId || r.warehouse || "",
      status: r.status || r.status_text || "Draft",
      items: r.items || [],
      createdAt: r.createdAt || r.created_at,
    }));
  }, [receipts]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Receipts</h1>
          <p className="text-slate-500 mt-1">Manage incoming stock from suppliers</p>
        </div>
        <Button onClick={() => navigate("/receipts/new")} variant="primary">
  New Receipt
</Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Id</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingReceipts ? (
                Array.from({ length: 5 }).map((_, i) => (
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
              ) : normalizedReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No receipts found. Create your first receipt to start tracking incoming stock.
                  </TableCell>
                </TableRow>
              ) : (
                normalizedReceipts.map((receipt) => (
                 <TableRow
  key={receipt.receiptId}
  className="hover:bg-slate-50 cursor-pointer"
  onClick={() => navigate(`/receipts/${receipt.receiptId}`)}
>
                    <TableCell className="font-mono font-medium">{receipt.receiptId}</TableCell>
                    <TableCell>{receipt.supplierId}</TableCell>
                    <TableCell>{receipt.warehouseId}</TableCell>
                    <TableCell>
                      {receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell>{(receipt.items || []).length} items</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[receipt.status] || "bg-slate-100 text-slate-800"} border`}>
                        {String(receipt.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {String(receipt.status).toLowerCase() !== "done" && (
                        <Button size="sm" onClick={() => validateMutation.mutate(receipt)} variant="success">
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

      {/* Create Receipt Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Receipt</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name or ID (free text)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse (ID) *</Label>
                <Input
                  id="warehouse"
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  placeholder="Warehouse ID (e.g., WH001) or name"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Items</Label>
              <div className="flex gap-3 items-center">
                <Select
                  value={currentItem.productId}
                  onValueChange={(value) => setCurrentItem((c) => ({ ...c, productId: value }))}
                  className="flex-1"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingProducts ? "Loading products..." : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <SelectItem value="">No products</SelectItem>
                    ) : (
                      products.map((p) => (
                        <SelectItem key={p.id || p._id} value={p.id || p._id}>
                          {p.name} {p.sku ? `(${p.sku})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="0"
                  placeholder="Ordered Qty"
                  value={currentItem.orderedQty || ""}
                  onChange={(e) => setCurrentItem((c) => ({ ...c, orderedQty: parseFloat(e.target.value) || 0 }))}
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
                        <TableHead>Qty</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((it, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{it.product_name || it.productId}</TableCell>
                          <TableCell className="font-mono text-sm">{it.sku || "-"}</TableCell>
                          <TableCell>{it.orderedQty} {it.unit || ""}</TableCell>
                          <TableCell>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveItem(idx)}>
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
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? "Creating..." : "Create Receipt"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
