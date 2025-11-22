import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@/shims/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function NewReceipt() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // form data
  const [formData, setFormData] = useState({
    supplier: "",
    warehouse: "",
    items: [],
  });

  // temp adding item
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    orderedQty: "",
  });

  // fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      const json = await res.json();
      return json.products || [];
    },
  });

  // create receipt mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/receipts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receipts"]);
      navigate("/receipts");
    },
  });

  // add item
  const handleAddItem = () => {
    if (!currentItem.productId || !currentItem.orderedQty) return;

    const product = products.find((p) => p.id === currentItem.productId || p._id === currentItem.productId);

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: currentItem.productId,
          orderedQty: Number(currentItem.orderedQty),
          productName: product?.name || "",
          sku: product?.sku || "",
        },
      ],
    });

    setCurrentItem({ productId: "", orderedQty: "" });
  };

  // remove item
  const removeItem = (i) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== i),
    });
  };

  // submit receipt
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      supplierId: formData.supplier,
      warehouseId: formData.warehouse,
      items: formData.items.map((it) => ({
        productId: it.productId,
        orderedQty: it.orderedQty,
      })),
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create Receipt</h1>
      <p className="text-slate-600">Create a new goods receipt document</p>

      <Card>
        <CardContent className="space-y-6 py-6">

          {/* Supplier & Warehouse */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Supplier *</Label>
              <Input
                placeholder="Enter Supplier Name/ID"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div>
              <Label>Warehouse *</Label>
              <Input
                placeholder="Enter Warehouse ID"
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <Label>Items</Label>

            <div className="flex gap-4 items-center">
              <Select
                value={currentItem.productId}
                onValueChange={(v) => setCurrentItem({ ...currentItem, productId: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id || p._id} value={p.id || p._id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Qty"
                className="w-24"
                value={currentItem.orderedQty}
                onChange={(e) => setCurrentItem({ ...currentItem, orderedQty: e.target.value })}
              />

              <Button onClick={handleAddItem} variant="outline">
                Add
              </Button>
            </div>

            {formData.items.length > 0 && (
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
                  {formData.items.map((it, i) => (
                    <TableRow key={i}>
                      <TableCell>{it.productName}</TableCell>
                      <TableCell>{it.sku}</TableCell>
                      <TableCell>{it.orderedQty}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => removeItem(i)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/receipts")}>
              Cancel
            </Button>

            <Button onClick={handleSubmit} variant="primary">
              Create Receipt
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
