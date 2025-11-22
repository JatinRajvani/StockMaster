import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// icons removed from this page
import { Skeleton } from "@/components/ui/skeleton";

export default function MoveHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('move_history') || '[]');
      setHistory(local);
    } catch (e) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.operation_type === filterType;
    return matchesSearch && matchesType;
  });

  const typeColors = {
    receipt: 'bg-green-100 text-green-800 border-green-300',
    delivery: 'bg-purple-100 text-purple-800 border-purple-300',
    transfer: 'bg-blue-100 text-blue-800 border-blue-300',
    adjustment: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Move History</h1>
        <p className="text-slate-500 mt-1">Complete log of all inventory movements</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              {/* decorative icon removed */}
              <Input
                placeholder="Search by product, SKU, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Operation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operations</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="delivery">Deliveries</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No movement history found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => {
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="text-slate-600">
                          {item.operation_date ? new Date(item.operation_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${typeColors[item.operation_type]} border w-fit`}>
                            {item.operation_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.reference_number}</TableCell>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">{item.sku}</TableCell>
                        <TableCell className="font-medium">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-slate-600">{item.from_location || '-'}</TableCell>
                        <TableCell className="text-slate-600">{item.to_location || '-'}</TableCell>
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