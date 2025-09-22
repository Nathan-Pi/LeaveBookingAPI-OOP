"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Table, Badge, Button, Alert, Spinner, Form } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

export default function MyLeaveRequestsPage() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
  }, [userLoading, user, router]);

  const fetchRequests = () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/leave/own`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRequests(res.data.data || []);
      })
      .catch(() => setError("Failed to fetch leave requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [user, token]);

  const handleCancel = (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    setCancelingId(id);

    axios
      .delete(`${API_BASE}/leave/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchRequests())
      .catch(() => setError("Failed to cancel leave request."))
      .finally(() => setCancelingId(null));
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status.toLowerCase() === filter);

  if (userLoading || !user) return null;

  return (
    <div className="container py-4">
      <h2>My Leave Requests</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form className="mb-3" style={{ maxWidth: 250 }}>
        <Form.Label>Status Filter</Form.Label>
        <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </Form.Select>
      </Form>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Alert variant="info">No leave requests found.</Alert>
      ) : (
        <div className="table-responsive">
          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) => (
                <tr key={req.leaveId || req.id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    {req.startDate} — {req.endDate}
                  </td>
                  <td>{req.reason}</td>
                  <td>
                    <Badge
                      bg={
                        req.status.toLowerCase() === "approved"
                          ? "success"
                          : req.status.toLowerCase() === "pending"
                          ? "warning"
                          : req.status.toLowerCase() === "rejected"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {req.status.toLowerCase() === "pending" && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={cancelingId === req.leaveId || cancelingId === req.id}
                        onClick={() => handleCancel(req.leaveId || req.id)}
                      >
                        {cancelingId === req.leaveId || cancelingId === req.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}