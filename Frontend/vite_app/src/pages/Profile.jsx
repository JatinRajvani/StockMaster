import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function Profile() {
  const [user, setUser] = useState({
    name: "Prem Kambaliya",
    email: "prem@example.com",
    phone: "+91 98765 43210",
    userId: "USR-001245",
    createdAt: "2024-10-12",
    lastLogin: "2025-01-20 08:45 AM",
    photo: "https://i.pravatar.cc/150?img=12", 
  });

  const [activity] = useState({
    receipts: 18,
    deliveries: 12,
    transfers: 7,
    adjustments: 3,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  const openEdit = () => {
    setEditForm({ name: user.name, email: user.email, phone: user.phone });
    setIsEditOpen(true);
  };
  const saveEdit = (e) => {
    e?.preventDefault?.();
    setUser((prev) => ({ ...prev, ...editForm }));
    setIsEditOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <Card className="overflow-hidden shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img
                src={user.photo}
                alt="Profile"
                className="w-24 h-24 rounded-full ring-4 ring-amber-200 shadow-md"
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center rounded-full bg-white/70 border border-amber-200 px-3 py-1 text-slate-700">ID: {user.userId}</span>
                  <span className="inline-flex items-center rounded-full bg-white/70 border border-slate-200 px-3 py-1 text-slate-700">Last login: {user.lastLogin}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={openEdit}>Edit Profile</Button>
              <Button variant="destructive">Log Out</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p><strong>User ID:</strong> {user.userId}</p>
            <p><strong>Account Created:</strong> {user.createdAt}</p>
            <p><strong>Last Login:</strong> {user.lastLogin}</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editForm.email} onChange={(e)=>setEditForm({...editForm, email: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={editForm.phone} onChange={(e)=>setEditForm({...editForm, phone: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activity Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
              <h3 className="text-2xl font-bold text-amber-600">{activity.receipts}</h3>
              <p className="text-slate-600 text-sm">Receipts Created</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
              <h3 className="text-2xl font-bold text-amber-600">{activity.deliveries}</h3>
              <p className="text-slate-600 text-sm">Deliveries Completed</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
              <h3 className="text-2xl font-bold text-amber-600">{activity.transfers}</h3>
              <p className="text-slate-600 text-sm">Internal Transfers</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
              <h3 className="text-2xl font-bold text-amber-600">{activity.adjustments}</h3>
              <p className="text-slate-600 text-sm">Adjustments Made</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions removed as moved to header */}
    </div>
  );
}

export default Profile;
