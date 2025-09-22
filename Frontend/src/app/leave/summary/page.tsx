"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, Row, Col, ListGroup, Table, Spinner, Alert, Badge } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString(undefined, opts)} - ${new Date(end).toLocaleDateString(undefined, opts)}`;
}

function daysBetween(start: string, end: string) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function LeaveSummaryPage() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const [balance, setBalance] = useState<number | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
  }, [userLoading, user, router]);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    Promise.all([
      axios.get(`${API_BASE}/leave/balance`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_BASE}/leave/own`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([balRes, reqRes]) => {
        setBalance(balRes.data.remainingAl ?? null);
        setRequests(reqRes.data.data || []);
      })
      .catch(() => setError("Failed to load leave summary."))
      .finally(() => setLoading(false));
  }, [user, token]);

  const statusMap: Record<string, { label: string; color: string }> = {
    approved: { label: "Approved", color: "success" },
    pending: { label: "Pending", color: "warning" },
    rejected: { label: "Rejected", color: "danger" },
    cancelled: { label: "Cancelled", color: "secondary" },
  };

  const summary: Record<string, { count: number; days: number }> = {};
  requests.forEach((req) => {
    const status = req.status?.toLowerCase() || "other";
    if (!summary[status]) summary[status] = { count: 0, days: 0 };
    summary[status].count++;
    summary[status].days += daysBetween(req.startDate, req.endDate);
  });

  if (userLoading || !user) return null;

  return (
    <div className="container py-4">
      <h2>Leave Summary</h2>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row className="gy-4">
          <Col md={4}>
            <Card>
              <Card.Header>Your Balance</Card.Header>
              <Card.Body>
                <h4>
                  <Badge bg="success">{balance !== null ? `${balance} days` : "..."}</Badge>
                </h4>
                <div>Annual leave remaining</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card>
              <Card.Header>Summary Breakdown</Card.Header>
              <Table bordered className="mb-0">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Requests</th>
                    <th>Total Days</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statusMap).map(([status, { label, color }]) => (
                    <tr key={status}>
                      <td>
                        <Badge bg={color}>{label}</Badge>
                      </td>
                      <td>{summary[status]?.count || 0}</td>
                      <td>{summary[status]?.days || 0}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>
                        {Object.values(summary).reduce((sum, v) => sum + v.count, 0)}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        {Object.values(summary).reduce((sum, v) => sum + v.days, 0)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col md={12}>
            <Card>
              <Card.Header>All Requests</Card.Header>
              <ListGroup variant="flush">
                {requests.length === 0 ? (
                  <ListGroup.Item>No leave requests made yet.</ListGroup.Item>
                ) : (
                  requests
                    .sort(
                      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    )
                    .map((req, idx) => (
                      <ListGroup.Item key={req.leaveId || req.id || idx}>
                        <Badge bg={statusMap[req.status?.toLowerCase()]?.color || "secondary"} className="me-2">
                          {statusMap[req.status?.toLowerCase()]?.label || req.status}
                        </Badge>
                        {formatDateRange(req.startDate, req.endDate)}: {req.reason || <em>No reason given</em>}{" "}
                        <span className="text-muted">({daysBetween(req.startDate, req.endDate)} days)</span>
                      </ListGroup.Item>
                    ))
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}