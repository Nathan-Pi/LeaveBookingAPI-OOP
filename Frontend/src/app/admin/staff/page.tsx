"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Table, Badge, Button, Alert, Spinner, Form, Modal, Row, Col, Card } from "react-bootstrap";

const API_BASE = "http://localhost:3001/api";

interface StaffUser {
  id: number;
  firstname: string;
  surname: string;
  email: string;
  role: { id: number; name: string };
  manager?: { id: number; firstname: string; surname: string };
  remainingAl: number;
}

interface Role {
  id: number;
  name: string;
}

export default function StaffManagementPage() {
  const { user, token, loading: userLoading } = useUser();
  const router = useRouter();

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | string[] | object | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstname: "",
    surname: "",
    roleId: "",
    managerId: "",
  });

  useEffect(() => {
    if (
      !userLoading &&
      (!user || user.role?.name !== "Admin")
    ) {
      router.replace("/dashboard");
    }
  }, [userLoading, user, router]);

  const fetchStaff = () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStaff(res.data.data || res.data || []);
      })
      .catch(() => setError("Failed to fetch staff list."))
      .finally(() => setLoading(false));
  };

  const fetchRoles = () => {
    if (!user || !token) return;
    axios
      .get(`${API_BASE}/roles/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRoles(res.data.data || res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, [user, token]);

  const handleRoleChange = async (userId: number, roleId: number) => {
    setUpdatingId(userId);
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/users/${userId}`,
        { roleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStaff();
    } catch {
      setError("Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateAnnualLeave = async (userId: number, newValue: number) => {
    setUpdatingId(userId);
    setError(null);
    try {
      await axios.patch(
        `${API_BASE}/leave/amend/${userId}`,
        { amount: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStaff();
    } catch {
      setError("Failed to update annual leave.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setUpdatingId(deleteId);
    setError(null);
    try {
      await axios.delete(`${API_BASE}/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(staff.filter(u => u.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch {
      setError("Failed to delete user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    if (!newUser.email || !newUser.password || !newUser.firstname || !newUser.surname || !newUser.roleId) {
      setCreateError("Please fill in all required fields.");
      setCreating(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/users`, {
        email: newUser.email,
        password: newUser.password,
        firstname: newUser.firstname,
        surname: newUser.surname,
        roleId: Number(newUser.roleId),
        managerId: newUser.managerId ? Number(newUser.managerId) : undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreateSuccess("User created successfully!");
      setNewUser({
        email: "",
        password: "",
        firstname: "",
        surname: "",
        roleId: "",
        managerId: "",
      });
      fetchStaff();
    } catch (err: any) {
      let message: string | string[] | object = "Failed to create user.";
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          message = err.response.data;
        } else if (err.response.data.error) {
          message = err.response.data.error;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        } else if (Array.isArray(err.response.data.errors)) {
          message = err.response.data.errors;
        } else if (typeof err.response.data === "object") {
          message = err.response.data;
        }
      }
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container py-4">
      <h2>Staff Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>Create New User</Card.Header>
        <Card.Body>
          {createError &&
            <Alert variant="danger">
              {Array.isArray(createError) ? (
                <ul style={{ marginBottom: 0 }}>
                  {createError.map((msg, i) =>
                    <li key={i}>{typeof msg === "object" ? JSON.stringify(msg) : msg}</li>
                  )}
                </ul>
              ) : typeof createError === "object" ? (
                JSON.stringify(createError)
              ) : (
                createError
              )}
            </Alert>
          }
          {createSuccess && <Alert variant="success">{createSuccess}</Alert>}
          <Form onSubmit={handleCreateUser}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleCreateChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleCreateChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstname"
                    value={newUser.firstname}
                    onChange={handleCreateChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Surname *</Form.Label>
                  <Form.Control
                    type="text"
                    name="surname"
                    value={newUser.surname}
                    onChange={handleCreateChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="roleId"
                    value={newUser.roleId}
                    onChange={handleCreateChange}
                    required
                  >
                    <option value="">Select...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Manager</Form.Label>
                  <Form.Select
                    name="managerId"
                    value={newUser.managerId}
                    onChange={handleCreateChange}
                  >
                    <option value="">None</option>
                    {staff
                      .filter((u) => u.role.name === "Manager")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstname} {u.surname}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text muted>
                    Only required for users who report to a manager.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Annual Leave Remaining</th>
                <th>Change Role</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>
                    {u.firstname} {u.surname}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Badge bg={
                      u.role.name === "Admin" ? "primary" :
                        u.role.name === "Manager" ? "info" :
                          "secondary"
                    }>
                      {u.role.name}
                    </Badge>
                  </td>
                  <td>
                    {u.manager
                      ? `${u.manager.firstname} ${u.manager.surname}`
                      : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => updateAnnualLeave(u.id, u.remainingAl - 1)}
                        disabled={updatingId === u.id || u.remainingAl <= 0}
                      >-</Button>
                      <span>{u.remainingAl}</span>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => updateAnnualLeave(u.id, u.remainingAl + 1)}
                        disabled={updatingId === u.id}
                      >+</Button>
                    </div>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={u.role.id}
                      disabled={updatingId === u.id}
                      onChange={e =>
                        handleRoleChange(u.id, Number(e.target.value))
                      }
                      style={{ minWidth: 120 }}
                    >
                      {roles.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={updatingId === u.id}
                      onClick={() => openDeleteModal(u.id)}
                    >
                      {updatingId === u.id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently delete this user? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={updatingId === deleteId}
          >
            {updatingId === deleteId ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}