import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@/shims/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LocationDetails() {
  const { warehouseId, locationId } = useParams();
  const navigate = useNavigate();

  const { data: location, isLoading, error } = useQuery({
    queryKey: ["location", locationId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/locations/${locationId}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to fetch location");
      return json.location;
    },
    enabled: !!locationId,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load location</div>;
  if (!location) return <div className="p-6">Location not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Location: {location.locationId}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Location ID:</strong> {location.locationId}</div>
          <div><strong>Name:</strong> {location.name}</div>
          <div><strong>Type:</strong> {location.type}</div>
          <div><strong>Warehouse:</strong> {location.warehouseId}</div>
          <div><strong>Created At:</strong> {new Date(location.createdAt).toLocaleString()}</div>
          <pre className="mt-4 text-sm bg-slate-50 p-3 rounded">{JSON.stringify(location, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
