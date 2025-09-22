"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Table, Badge, Button, Alert, Spinner, Form } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString(undefined, opts)} - ${new Date(end).toLocaleDateString(undefined, opts)}`;
}

export default function AdminLeaveRequestsPage() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all"); // Default to "all"
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (
      !userLoading &&
      (!user || user.role?.name !== "Admin")
    ) {
      router.replace("/dashboard");
    }
  }, [userLoading, user, router]);

  const fetchRequests = () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE}/leave/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRequests(res.data.data || res.data || []))
      .catch(() => setError("Failed to fetch leave requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [user, token]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setUpdatingId(id);
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/leave/${action}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string"
          ? err.response.data
          : "Failed to update leave request.")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => (r.status || "").toLowerCase() === filter);

  return (
    <div className="container py-4">
      <h2>Leave Requests Overview</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form className="mb-3" style={{ maxWidth: 250 }}>
        <Form.Label>Status Filter</Form.Label>
        <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All</option>
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
                <th>User</th>
                <th>Email</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) => (
                <tr key={req.leaveId || req.id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    {req.user?.firstname} {req.user?.surname}
                  </td>
                  <td>{req.user?.email}</td>
                  <td>{formatDateRange(req.startDate, req.endDate)}</td>
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
                          : req.status.toLowerCase() === "cancelled"
                          ? "secondary"
                          : "secondary"
                      }
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {req.status.toLowerCase() === "pending" ? (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2"
                          disabled={updatingId === req.leaveId || updatingId === req.id}
                          onClick={() => handleAction(req.leaveId || req.id, "approve")}
                        >
                          {updatingId === req.leaveId || updatingId === req.id
                            ? "Processing..."
                            : "Approve"}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={updatingId === req.leaveId || updatingId === req.id}
                          onClick={() => handleAction(req.leaveId || req.id, "reject")}
                        >
                          {updatingId === req.leaveId || updatingId === req.id
                            ? "Processing..."
                            : "Reject"}
                        </Button>
                      </>
                    ) : (
                      <span>-</span>
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