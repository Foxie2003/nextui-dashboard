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

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register(email, password, name, phone);
    } catch (err) {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
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
            Tạo tài khoản mới
          </Text>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <Input
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Họ tên"
            />
            <Spacer y={1} />
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
            <Input
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Số điện thoại"
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
              Đăng ký
            </Button>
          </form>
        </Card.Body>
        <Card.Footer>
          <Row justify="center">
            <Text>
              Đã có tài khoản?{" "}
              <Link href="/login">
                <a>Đăng nhập</a>
              </Link>
            </Text>
          </Row>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Register;
