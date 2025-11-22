import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobileNumber: "" });

  const openEdit = () => {
    if (!user) return;
    setEditForm({ name: user.username || "", email: user.email || "", mobileNumber: user.mobileNumber || "" });
    setIsEditOpen(true);
  };
  const saveEdit = async (e) => {
    e?.preventDefault?.();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return navigate('/auth');
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: editForm.name, mobileNumber: editForm.mobileNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Update failed');
      setUser(data);
      setIsEditOpen(false);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/auth');
          return;
        }
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load profile');
        setUser(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
    } catch (e) {}
    navigate('/auth');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {error && (
        <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {loading && (
        <div className="p-4">Loading profile...</div>
      )}
      {!loading && user && (
        <div>
          {/* Header */}
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{user.username || 'User'}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center rounded-full bg-white/70 border border-amber-200 px-3 py-1 text-slate-700">ID: {String(user.id)}</span>
                      <span className="inline-flex items-center rounded-full bg-white/70 border border-slate-200 px-3 py-1 text-slate-700">Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={openEdit}>Edit Profile</Button>
                  <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
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
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Mobile:</strong> {user.mobileNumber || '-'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-700">
                <p><strong>User ID:</strong> {String(user.id)}</p>
                <p><strong>Account Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</p>
                <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card className="shadow-sm mt-6">
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
                  <h3 className="text-2xl font-bold text-amber-600">{user.activitySummary?.receipts ?? 0}</h3>
                  <p className="text-slate-600 text-sm">Receipts Created</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
                  <h3 className="text-2xl font-bold text-amber-600">{user.activitySummary?.deliveries ?? 0}</h3>
                  <p className="text-slate-600 text-sm">Deliveries Completed</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
                  <h3 className="text-2xl font-bold text-amber-600">{user.activitySummary?.transfers ?? 0}</h3>
                  <p className="text-slate-600 text-sm">Internal Transfers</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition transform hover:shadow-md hover:-translate-y-0.5">
                  <h3 className="text-2xl font-bold text-amber-600">{user.activitySummary?.adjustments ?? 0}</h3>
                  <p className="text-slate-600 text-sm">Adjustments Made</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <Label htmlFor="name">Username</Label>
              <Input id="name" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editForm.email} disabled />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" value={editForm.mobileNumber} onChange={(e)=>setEditForm({...editForm, mobileNumber: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Profile;
