"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, Row, Col, Spinner, Alert, Badge, Table } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

function daysBetween(start: string, end: string) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function formatUKDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function TeamOverviewPage() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !userLoading &&
      (!user || user.role?.name !== "Manager")
    ) {
      router.replace("/dashboard");
    }
  }, [userLoading, user, router]);

  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);

    axios.get(`${API_BASE}/leave/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const leaveRequests = res.data.data || [];
        const today = new Date().toISOString().slice(0, 10);

        const memberMap: Record<number, any> = {};
        for (const req of leaveRequests) {
          const member = req.user;
          if (!member) continue;

          if (!memberMap[member.id]) {
            memberMap[member.id] = {
              id: member.id,
              firstname: member.firstname,
              surname: member.surname,
              email: member.email,
              role: member.role,
              remainingAl: member.remainingAl,
              requests: [],
            };
          }
          memberMap[member.id].requests.push(req);
        }

        const statsArray = Object.values(memberMap).map((member: any) => {
          const requestsThisYear = member.requests.filter((req: any) =>
            new Date(req.startDate).getFullYear() === new Date().getFullYear()
          );
          const daysTaken = requestsThisYear.reduce((sum: number, req: any) => {
            if (req.status?.toLowerCase() === "approved") {
              return sum + daysBetween(req.startDate, req.endDate);
            }
            return sum;
          }, 0);

          const lastLeave = member.requests
            .filter((req: any) =>
              req.status?.toLowerCase() === "approved" &&
              req.endDate <= today
            )
            .sort((a: any, b: any) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];

          const nextLeave = member.requests
            .filter((req: any) =>
              req.status?.toLowerCase() === "approved" &&
              req.startDate > today
            )
            .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

          return {
            ...member,
            requestCount: requestsThisYear.length,
            daysTaken,
            lastLeaveDate: lastLeave ? lastLeave.endDate : null,
            nextLeaveDate: nextLeave ? nextLeave.startDate : null,
          };
        });

        setTeamStats(statsArray);
      })
      .catch(() => setError("Failed to load team overview."))
      .finally(() => setLoading(false));
  }, [user, token]);

  if (userLoading || !user) return null;

  return (
    <div className="container py-4">
      <h2>Team Overview</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header>Team Members</Card.Header>
              <div className="table-responsive">
                <Table hover bordered className="mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Annual Leave Remaining</th>
                      <th>Requests This Year</th>
                      <th>Days Taken This Year</th>
                      <th>Last Leave Date</th>
                      <th>Next Leave Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.length === 0 ? (
                      <tr>
                        <td colSpan={9}>No team members found.</td>
                      </tr>
                    ) : (
                      teamStats.map((member, idx) => (
                        <tr key={member.id}>
                          <td>{idx + 1}</td>
                          <td>{member.firstname} {member.surname}</td>
                          <td>{member.email}</td>
                          <td>
                            <Badge bg={
                              member.role?.name === "Manager" ? "info" : "secondary"
                            }>
                              {member.role?.name}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="success">{member.remainingAl ?? "N/A"} days</Badge>
                          </td>
                          <td>{member.requestCount}</td>
                          <td>{member.daysTaken}</td>
                          <td>
                            {member.lastLeaveDate
                              ? formatUKDate(member.lastLeaveDate)
                              : <span className="text-muted">—</span>
                            }
                          </td>
                          <td>
                            {member.nextLeaveDate
                              ? formatUKDate(member.nextLeaveDate)
                              : <span className="text-muted">—</span>
                            }
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}