import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Text,
  Spacer,
  Container,
  Row,
} from "@nextui-org/react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError("Thông tin đăng nhập không chính xác. Vui lòng thử lại.");
    }
  };

  return (
    <Container
      css={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card css={{ mw: "420px", p: "20px" }}>
        <Card.Header>
          <Text
            h1
            size={24}
            weight="bold"
            css={{ textAlign: "center", width: "100%" }}
          >
            Đăng nhập vào Hệ thống Rạp chiếu phim
          </Text>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <Input
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
            />
            <Spacer y={1} />
            <Input.Password
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Mật khẩu"
            />
            <Spacer y={1} />
            {error && (
              <>
                <Text color="error">{error}</Text>
                <Spacer y={1} />
              </>
            )}
            <Button type="submit" css={{ width: "100%" }}>
              Đăng nhập
            </Button>
          </form>
        </Card.Body>
        <Card.Footer>
          <Row justify="center">
            <Text>Đăng nhập với tài khoản quản trị viên</Text>
          </Row>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Login;
