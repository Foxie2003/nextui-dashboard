import { Dropdown, Navbar, Text, Avatar } from "@nextui-org/react";
import React from "react";
import { DarkModeSwitch } from "./darkmodeswitch";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";

export const UserDropdown = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Navbar.Item>
        <Avatar
          as="button"
          color="secondary"
          size="md"
          src="https://i.pravatar.cc/150?u=guest"
          onClick={() => router.push("/login")}
        />
      </Navbar.Item>
    );
  }

  return (
    <Dropdown placement="bottom-right">
      <Navbar.Item>
        <Dropdown.Trigger>
          <Avatar
            bordered
            as="button"
            color="secondary"
            size="md"
            src={user?.avatarUrl || "https://i.pravatar.cc/150?u=user"}
          />
        </Dropdown.Trigger>
      </Navbar.Item>
      <Dropdown.Menu
        aria-label="User menu actions"
        onAction={(actionKey) => {
          if (actionKey === "logout") {
            logout();
            router.push("/");
          } else if (actionKey === "profile") {
            router.push("/profile");
          } else if (actionKey === "tickets") {
            router.push("/tickets");
          }
        }}
      >
        <Dropdown.Item key="profile" css={{ height: "$18" }}>
          <Text b color="inherit" css={{ d: "flex" }}>
            {user?.isAdmin ? "Quản lý:" : "Nhân viên:"}
          </Text>
          <Text b color="inherit" css={{ d: "flex" }}>
            {user?.email || "user@example.com"}
          </Text>
        </Dropdown.Item>
        <Dropdown.Item key="profile" withDivider>
          Thông tin cá nhân
        </Dropdown.Item>
        <Dropdown.Item key="tickets">Vé của tôi</Dropdown.Item>
        <Dropdown.Item key="logout" withDivider color="error">
          Đăng xuất
        </Dropdown.Item>
        <Dropdown.Item key="switch" withDivider>
          <DarkModeSwitch />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
