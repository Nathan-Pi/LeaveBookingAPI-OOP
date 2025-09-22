"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Badge, Button, Card, Col, Row, ListGroup, Alert, Spinner } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

export default function Dashboard() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const [remainingAl, setRemainingAl] = useState<number | null>(null);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [userLoading, user, router]);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    const headers = { Authorization: `Bearer ${token}` };

    const fetchBalance = axios.get(`${API_BASE}/leave/balance`, { headers });

    const fetchOwnLeaves = axios.get(`${API_BASE}/leave/own`, { headers });

    const fetchNotifications = async () => {
      try {
        if (user.role?.name === "Manager" && user.id) {
          const notifRes = await axios.get(`${API_BASE}/leave/getManagedOutstanding/${user.id}`, { headers });
          setNotifications([
            {
              id: 1,
              message: `${notifRes.data.data ? notifRes.data.data.length : 0} leave requests need your attention`,
              link: "/team/requests",
            },
          ]);
        } else if (user.role?.name === "Admin") {
          const notifRes = await axios.get(`${API_BASE}/leave/getAllOutstanding`, { headers });
          setNotifications([
            {
              id: 1,
              message: `${notifRes.data.data ? notifRes.data.data.length : 0} leave requests need your attention`,
              link: "/admin/requests",
            },
          ]);
        } else {
          setNotifications([]);
        }
      } catch (notifErr: any) {
        setNotifications([]);

      }
    };

    Promise.all([fetchBalance, fetchOwnLeaves])
      .then(([balanceRes, ownLeavesRes]) => {
        setRemainingAl(balanceRes.data.remainingAl);

        const leaves = ownLeavesRes.data.data || [];
        setLeaveData(leaves);

        setPendingRequests(leaves.filter((l: any) => l.status?.toLowerCase() === "pending").length);

        const sorted = [...leaves].sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setRecentActivity(sorted.slice(0, 5));

        return fetchNotifications();
      })
      .catch((err) => {
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  if (userLoading || !user) return null;

  return (
    <div className="container py-4">
      <h2>
        Welcome, {user.firstname} {user.surname}!{" "}
        <Badge bg="secondary">{user.role?.name}</Badge>
      </h2>

      {notifications.length > 0 && (
        <Alert variant="info" className="mt-3">
          <ul className="mb-0">
            {notifications.map((n: any) => (
              <li key={n.id}>
                {n.link ? (
                  <Link href={n.link}>{n.message}</Link>
                ) : (
                  n.message
                )}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="my-3">
        <Button as={Link} href="/leave/request" variant="primary" className="me-2">
          Request Leave
        </Button>
        <Button as={Link} href="/leave/summary" variant="outline-primary" className="me-2">
          View Leave Summary
        </Button>
      </div>

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
              <Card.Header>Leave Summary</Card.Header>
              <Card.Body>
                <p>
                  <strong>Remaining Leave:</strong>{" "}
                  <Badge bg="success">
                    {remainingAl !== null ? `${remainingAl} days` : "Loading..."}
                  </Badge>
                </p>
                <p>
                  <strong>Pending Requests:</strong>{" "}
                  <Badge bg="warning">{pendingRequests}</Badge>
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>Upcoming Holidays</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>No upcoming holidays listed.</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>Recent Activity</Card.Header>
              <ListGroup variant="flush">
                {recentActivity.length === 0 ? (
                  <ListGroup.Item>No recent activity.</ListGroup.Item>
                ) : (
                  recentActivity.map((a: any, idx: number) => (
                    <ListGroup.Item key={a.id ?? idx}>
                      <span
                        className={
                          a.status?.toLowerCase() === "approved"
                            ? "text-success"
                            : a.status?.toLowerCase() === "rejected"
                            ? "text-danger"
                            : "text-warning"
                        }
                      >
                        <strong>
                          {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                        </strong>
                      </span>{" "}
                      - {a.reason} ({a.startDate} to {a.endDate})
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