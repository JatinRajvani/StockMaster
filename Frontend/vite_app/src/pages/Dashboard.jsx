import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@/shims/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: receipts = [], isLoading: loadingReceipts } = useQuery({
    queryKey: ['receipts'],
    queryFn: () => base44.entities.Receipt.list(),
  });

  const { data: deliveries = [], isLoading: loadingDeliveries } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => base44.entities.Delivery.list(),
  });

  const { data: transfers = [], isLoading: loadingTransfers } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => base44.entities.Transfer.list(),
  });

  // Calculate KPIs
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.current_stock <= p.reorder_point && p.current_stock > 0).length;
  const outOfStockItems = products.filter(p => p.current_stock === 0).length;
  const pendingReceipts = receipts.filter(r => ['draft', 'waiting', 'ready'].includes(r.status)).length;
  const pendingDeliveries = deliveries.filter(d => ['draft', 'waiting', 'ready'].includes(d.status)).length;
  const scheduledTransfers = transfers.filter(t => ['draft', 'waiting', 'ready'].includes(t.status)).length;

  // Get recent operations
  const allOperations = [
    ...receipts.map(r => ({ ...r, type: 'receipt', date: r.receipt_date })),
    ...deliveries.map(d => ({ ...d, type: 'delivery', date: d.delivery_date })),
    ...transfers.map(t => ({ ...t, type: 'transfer', date: t.transfer_date })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const filteredOperations = allOperations.filter(op => {
    const typeMatch = filterType === 'all' || op.type === filterType;
    const statusMatch = filterStatus === 'all' || op.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800 border-slate-300',
    waiting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ready: 'bg-blue-100 text-blue-800 border-blue-300',
    done: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const KPICard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <Card className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {trend && (
          <div className={`flex items-center text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventory Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time overview of your stock operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="Total Products"
          value={totalProducts}
          color="bg-blue-500"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockItems}
          color="bg-yellow-500"
          trend="up"
          trendValue="+2 this week"
        />
        <KPICard
          title="Out of Stock"
          value={outOfStockItems}
          color="bg-red-500"
        />
        <KPICard
          title="Pending Receipts"
          value={pendingReceipts}
          color="bg-green-500"
        />
        <KPICard
          title="Pending Deliveries"
          value={pendingDeliveries}
          color="bg-purple-500"
        />
        <KPICard
          title="Scheduled Transfers"
          value={scheduledTransfers}
          color="bg-orange-500"
        />
      </div>

      {/* Recent Operations */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Recent Operations</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Latest inventory movements and transactions</p>
            </div>
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 group relative overflow-hidden border-2 border-slate-200 hover:border-slate-400 transition-all duration-300 rounded-lg hover:shadow-md">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-2 border-slate-200 shadow-xl">
                  <SelectItem value="all" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">All Types</SelectItem>
                  <SelectItem value="receipt" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Receipts</SelectItem>
                  <SelectItem value="delivery" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Deliveries</SelectItem>
                  <SelectItem value="transfer" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Transfers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 group relative overflow-hidden border-2 border-slate-200 hover:border-slate-400 transition-all duration-300 rounded-lg hover:shadow-md">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-2 border-slate-200 shadow-xl">
                  <SelectItem value="all" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">All Status</SelectItem>
                  <SelectItem value="draft" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Draft</SelectItem>
                  <SelectItem value="waiting" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Waiting</SelectItem>
                  <SelectItem value="ready" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Ready</SelectItem>
                  <SelectItem value="done" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Done</SelectItem>
                  <SelectItem value="cancelled" className="cursor-pointer hover:bg-slate-50 rounded-md transition-colors">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingReceipts || loadingDeliveries || loadingTransfers ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No operations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOperations.map((op, index) => {
                    return (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{op.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {op.receipt_number || op.delivery_number || op.transfer_number}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {op.supplier || op.customer || `${op.from_location} → ${op.to_location}`}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {op.date ? new Date(op.date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusColors[op.status]} border`}>
                            {op.status}
                          </Badge>
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

      <style>{`
        /* Select Dropdown Animations */
        select:focus,
        [role="combobox"]:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        /* Smooth transitions for all interactive elements */
        button, select, [role="combobox"] {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Active state for dropdowns */
        [role="combobox"]:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}