"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Spinner,
  Card,
} from "react-bootstrap";
import { useUser } from "../contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useUser();
  const API_BASE = "http://localhost:3001/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/login`, {
        email,
        password,
      });
      login(response.data.user, response.data.token);
      router.push("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Login failed. Please check your credentials.");
      }
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex vh-100">
      <Row className="justify-content-center align-self-center w-100">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Card.Body>
              <h2 className="mb-4 text-center">Log In</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                    <Button
                      variant={showPassword ? "secondary" : "outline-secondary"}
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      size="sm"
                      style={{ marginLeft: "8px" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </Form.Group>
                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Login"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
