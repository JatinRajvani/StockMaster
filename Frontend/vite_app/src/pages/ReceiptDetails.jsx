import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@/shims/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ReceiptDetails() {
  const { id } = useParams(); // RC001
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isReceiveDialog, setIsReceiveDialog] = useState(false);
  const [receiveItems, setReceiveItems] = useState([]);

  // Fetch receipt details
  const { data, isLoading } = useQuery({
    queryKey: ["receipt", id],
    queryFn: async () => {
      const res = await fetch(`/api/receipts/${id}`);
      const json = await res.json();
      return json.receipt;
    },
  });

  // validate mutation
  const validateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/receipts/${id}/validate`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receipt", id]);
      queryClient.invalidateQueries(["receipts"]);
    },
  });

  // cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/receipts/${id}/cancel`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receipt", id]);
      queryClient.invalidateQueries(["receipts"]);
    },
  });

  // receive goods mutation
  const receiveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/receipts/${id}/receive`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receipt", id]);
      setIsReceiveDialog(false);
    },
  });

  if (isLoading || !data) return <p className="p-6">Loading...</p>;

  const statusColors = {
    Draft: "bg-slate-100 text-slate-800 border-slate-300",
    Waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Ready: "bg-blue-100 text-blue-800 border-blue-300",
    Done: "bg-green-100 text-green-800 border-green-300",
    Canceled: "bg-red-100 text-red-800 border-red-300",
  };

  // open receive dialog
  const openReceiveDialog = () => {
    // prepare items for receiving
    setReceiveItems(
      data.items.map((it) => ({
        productId: it.productId,
        orderedQty: it.orderedQty,
        receivedQty: 0,
        locationId: "",
      }))
    );
    setIsReceiveDialog(true);
  };

  // submit receiving
  const submitReceiving = () => {
    receiveMutation.mutate({ items: receiveItems });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Receipt {data.receiptId}</h1>
          <p className="text-slate-600">View and manage incoming stock receipt</p>
        </div>

        <Button variant="outline" onClick={() => navigate("/receipts")}>
          Back
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">

          <div className="flex justify-between">
            <div>
              <p><strong>Supplier:</strong> {data.supplierId}</p>
              <p><strong>Warehouse:</strong> {data.warehouseId}</p>
              <p><strong>Date:</strong> {new Date(data.createdAt).toLocaleDateString()}</p>
            </div>

            <Badge className={`${statusColors[data.status]}`}>{data.status}</Badge>
          </div>

        </CardContent>
      </Card>

      {/* ITEMS TABLE */}
      <Card>
        <CardContent className="py-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.items.map((it, i) => (
                <TableRow key={i}>
                  <TableCell>{it.productId}</TableCell>
                  <TableCell>{it.orderedQty}</TableCell>
                  <TableCell>{it.receivedQty || 0}</TableCell>
                  <TableCell>{it.locationId || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">

        {data.status !== "Done" && data.status !== "Canceled" && (
          <>
            <Button onClick={openReceiveDialog} variant="primary">
              Receive Goods
            </Button>

            <Button onClick={() => validateMutation.mutate()} variant="success">
              Validate Receipt
            </Button>

            <Button onClick={() => cancelMutation.mutate()} variant="destructive">
              Cancel Receipt
            </Button>
          </>
        )}

      </div>

      {/* RECEIVE GOODS DIALOG */}
      <Dialog open={isReceiveDialog} onOpenChange={setIsReceiveDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Receive Goods</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Receive Now</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {receiveItems.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{it.productId}</TableCell>
                    <TableCell>{it.orderedQty}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={it.receivedQty}
                        onChange={(e) =>
                          (receiveItems[idx].receivedQty = Number(e.target.value)) &
                          setReceiveItems([...receiveItems])
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Location ID"
                        value={it.locationId}
                        onChange={(e) =>
                          (receiveItems[idx].locationId = e.target.value) &
                          setReceiveItems([...receiveItems])
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsReceiveDialog(false)}>Cancel</Button>
            <Button onClick={submitReceiving} variant="primary">Submit</Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}
    