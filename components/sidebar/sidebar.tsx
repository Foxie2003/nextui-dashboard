import React, { useState } from "react";
import { Box } from "../styles/box";
import { Sidebar } from "./sidebar.styles";
import { Avatar, Tooltip } from "@nextui-org/react";
import { Flex } from "../styles/flex";
import { CompaniesDropdown } from "./companies-dropdown";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PaymentsIcon } from "../icons/sidebar/payments-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { CustomersIcon } from "../icons/sidebar/customers-icon";
import { ProductsIcon } from "../icons/sidebar/products-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { DevIcon } from "../icons/sidebar/dev-icon";
import { ViewIcon } from "../icons/sidebar/view-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CollapseItems } from "./collapse-items";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { FilterIcon } from "../icons/sidebar/filter-icon";
import { useSidebarContext } from "../layout/layout-context";
import { ChangeLogIcon } from "../icons/sidebar/changelog-icon";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

// Import các icon mới
import { MoviesIcon } from "../icons/sidebar/movies-icon";
import { TheatersIcon } from "../icons/sidebar/theaters-icon";
import { ShowtimesIcon } from "../icons/sidebar/showtimes-icon";

const TicketsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54z" />
    <path d="M11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z" />
  </svg>
);

export const SidebarWrapper = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <Box
      as="aside"
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        top: "0",
      }}
    >
      <Sidebar collapsed={collapsed}>
        <Sidebar.Header>
          <CompaniesDropdown />
        </Sidebar.Header>
        <Flex direction={"column"} justify={"between"} css={{ height: "100%" }}>
          <Sidebar.Body className="body sidebar">
            <SidebarItem
              title="Trang chủ"
              icon={<HomeIcon />}
              isActive={router.pathname === "/"}
              href="/"
            />

            <SidebarMenu title="Phim & Vé">
              <SidebarItem
                isActive={
                  router.pathname === "/movies" ||
                  router.pathname.startsWith("/movies/")
                }
                title="Phim đang chiếu"
                icon={<MoviesIcon />}
                href="/movies"
              />

              {isAuthenticated && (
                <SidebarItem
                  isActive={
                    router.pathname === "/tickets" ||
                    router.pathname.startsWith("/tickets/")
                  }
                  title="Vé của tôi"
                  icon={<TicketsIcon />}
                  href="/tickets"
                />
              )}
            </SidebarMenu>

            {isAuthenticated && (
              <SidebarMenu title="Rạp chiếu">
                <SidebarItem
                  isActive={
                    router.pathname === "/theaters" ||
                    router.pathname.startsWith("/theaters/")
                  }
                  title="Danh sách rạp"
                  icon={<TheatersIcon />}
                  href="/theaters"
                />
                <SidebarItem
                  isActive={
                    router.pathname === "/showtimes" ||
                    router.pathname.startsWith("/showtimes/")
                  }
                  title="Lịch chiếu"
                  icon={<ShowtimesIcon />}
                  href="/showtimes"
                />
              </SidebarMenu>
            )}

            {isAdmin && (
              <SidebarMenu title="Quản lý">
                <SidebarItem
                  isActive={
                    router.pathname === "/movies" ||
                    router.pathname.startsWith("/movies/")
                  }
                  title="Quản lý phim"
                  icon={<MoviesIcon />}
                  href="/movies"
                />
                <SidebarItem
                  isActive={
                    router.pathname === "/theaters" ||
                    router.pathname.startsWith("/theaters/")
                  }
                  title="Quản lý rạp"
                  icon={<TheatersIcon />}
                  href="/theaters"
                />
                <SidebarItem
                  isActive={
                    router.pathname === "/showtimes" ||
                    router.pathname.startsWith("/showtimes/")
                  }
                  title="Quản lý lịch chiếu"
                  icon={<ShowtimesIcon />}
                  href="/showtimes"
                />
                <SidebarItem
                  isActive={
                    router.pathname === "/admin/customers" ||
                    router.pathname.startsWith("/admin/customers/")
                  }
                  title="Quản lý khách hàng"
                  icon={<AccountsIcon />}
                  href="/admin/customers"
                />
              </SidebarMenu>
            )}

            {isAuthenticated && (
              <SidebarMenu title="Tài khoản">
                <SidebarItem
                  isActive={router.pathname === "/profile"}
                  title="Thông tin cá nhân"
                  icon={<AccountsIcon />}
                  href="/profile"
                />
                <SidebarItem
                  title="Đăng xuất"
                  icon={<SettingsIcon />}
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                />
              </SidebarMenu>
            )}

            {!isAuthenticated && (
              <SidebarMenu title="Tài khoản">
                <SidebarItem
                  isActive={router.pathname === "/login"}
                  title="Đăng nhập"
                  icon={<AccountsIcon />}
                  href="/login"
                />
                <SidebarItem
                  isActive={router.pathname === "/register"}
                  title="Đăng ký"
                  icon={<AccountsIcon />}
                  href="/register"
                />
              </SidebarMenu>
            )}
          </Sidebar.Body>
          <Sidebar.Footer>
            <Tooltip content={"Settings"} rounded color="primary">
              <SettingsIcon />
            </Tooltip>
          </Sidebar.Footer>
        </Flex>
      </Sidebar>
    </Box>
  );
};
