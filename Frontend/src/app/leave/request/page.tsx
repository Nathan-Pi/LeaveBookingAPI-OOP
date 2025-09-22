"use client";

import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Form, Button, Alert, Spinner, Card } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

export default function RequestLeavePage() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!userLoading && !user) {
    router.replace("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate) {
      setError("Start and end dates are required.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/leave`,
        { startDate, endDate, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Leave request submitted!");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to submit leave request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Card>
        <Card.Header>
          <h2>Request Leave</h2>
        </Card.Header>
        <Card.Body>
{error && (
  <Alert variant="danger">
    {typeof error === "string"
      ? error
      : error?.message ||
        JSON.stringify(error)}
  </Alert>
)}          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="startDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                min={todayStr}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="endDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="reason">
              <Form.Label>Reason (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g. Family holiday, medical, etc."
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Submit Leave Request"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}