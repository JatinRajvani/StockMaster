import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@/shims/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function WarehouseDetails() {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [locationForm, setLocationForm] = useState({
    name: "",
    type: "rack"
  });

  // Fetch warehouse details
  const { data: warehouse, isLoading: wLoading } = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/warehouses/${warehouseId}`);
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch warehouse");
      return {
        warehouseId: json.warehouse.warehouseId,
        name: json.warehouse.name,
        code: json.warehouse.warehouseId,
        location: json.warehouse.address,
        type: json.warehouse.type,
        is_active: json.warehouse.is_active ?? true
      };
    },
    enabled: !!warehouseId,
  });

  // Fetch ALL locations
  const { data: allLocations = [], isLoading: locLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/locations/all");
      const json = await res.json();
      return json.locations || [];
    }
  });

  // Filter warehouse-specific locations
  const warehouseLocations = allLocations.filter(
    (loc) => loc.warehouseId === warehouseId
  );

  // Handle creating a new location
  async function handleCreateLocation(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/locations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseId,
        name: locationForm.name,
        type: locationForm.type,
      }),
    });

    if (!res.ok) {
      alert("Failed to create location");
      return;
    }

    setLocationForm({ name: "", type: "rack" });

    // Refresh the locations list
    queryClient.invalidateQueries(["locations"]);
  }

  // Handle DELETE location
  async function handleDeleteLocation(locationId) {
    if (!confirm(`Delete location ${locationId}?`)) return;

    const res = await fetch(`http://localhost:5000/api/locations/${locationId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.message || "Failed to delete location");
      return;
    }

    // Refresh list
    queryClient.invalidateQueries(["locations"]);
  }

  if (wLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Warehouse: {warehouse?.name}
        </h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          Back
        </Button>
      </div>

      {/* WAREHOUSE DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Code:</strong> {warehouse.code}</p>
          <p><strong>Location:</strong> {warehouse.location}</p>
          <p><strong>Type:</strong> {warehouse.type.replace(/_/g, " ")}</p>
          <p>
            <strong>Status:</strong>{" "}
            {warehouse.is_active ? "Active" : "Inactive"}
          </p>
        </CardContent>
      </Card>

      {/* LOCATIONS LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Locations in this Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          {locLoading ? (
            <p>Loading locations...</p>
          ) : warehouseLocations.length === 0 ? (
            <p className="text-slate-500">No locations yet.</p>
          ) : (
            <ul className="space-y-3">
              {warehouseLocations.map((loc) => (
                <li
                  key={loc.locationId}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                >
                  <div>
                    <strong>{loc.locationId}</strong> — {loc.name} ({loc.type})
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/warehouses/${warehouseId}/locations/${loc.locationId}`)
                      }
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteLocation(loc.locationId)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ADD LOCATION */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateLocation}>
            <div>
              <Label>Name</Label>
              <Input
                value={locationForm.name}
                onChange={(e) =>
                  setLocationForm({ ...locationForm, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={locationForm.type}
                onValueChange={(v) =>
                  setLocationForm({ ...locationForm, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rack">Rack</SelectItem>
                  <SelectItem value="shelf">Shelf</SelectItem>
                  <SelectItem value="bin">Bin</SelectItem>
                  <SelectItem value="floor">Floor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="primary">
              Create Location
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
