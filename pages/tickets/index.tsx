import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Table,
  Text,
  Button,
  Loading,
  Tooltip,
  Modal,
  Badge,
  Dropdown,
} from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import { useAuth } from "../../contexts/AuthContext";
import orderService, { Order } from "../../services/orderService";
import { EyeIcon } from "../../components/icons/table/eye-icon";
import { DeleteIcon } from "../../components/icons/table/delete-icon";
import { IconButton } from "../../components/table/table.styled";

const TicketsPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status update state
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Kiểm tra quyền admin trực tiếp từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 1) {
          // User is admin, allow access
          console.log("User is admin from localStorage check");
        } else {
          console.log("User is not admin from localStorage check");
          router.push("/movies");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/movies");
      }
    } else {
      console.log("No user data in localStorage");
      router.push("/movies");
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let data;

      if (user?.role === 1) {
        // Admin sees all orders
        data = await orderService.getAllOrders();
      } else {
        // Regular users see only their orders
        data = await orderService.getOrdersByUser(user?.id_khach_hang);
      }

      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải danh sách đơn vé. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setOrderToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      setDeleteLoading(true);
      await orderService.deleteOrder(orderToDelete);
      setOrders(orders.filter((order) => order.id_don_ve !== orderToDelete));
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Không thể xóa đơn vé. Vui lòng thử lại sau.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: number) => {
    try {
      setStatusUpdateLoading(true);
      await orderService.updateOrderStatus({
        id_don_ve: orderId,
        trang_thai: newStatus,
      });

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id_don_ve === orderId
            ? { ...order, trang_thai: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Không thể cập nhật trạng thái đơn vé. Vui lòng thử lại sau.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge color="warning">Chờ thanh toán</Badge>;
      case 1:
        return <Badge color="success">Đã thanh toán</Badge>;
      case 2:
        return <Badge color="error">Đã hủy</Badge>;
      default:
        return <Badge color="default">Không xác định</Badge>;
    }
  };

  const columns = [
    { name: "MÃ ĐƠN", uid: "id_don_ve" },
    { name: "PHIM", uid: "ten_phim" },
    { name: "RẠP", uid: "ten_rap" },
    { name: "THỜI GIAN", uid: "thoi_gian_giao_dich" },
    { name: "HÌNH THỨC", uid: "hinh_thuc_giao_dich" },
    { name: "TỔNG TIỀN", uid: "tong_tien" },
    { name: "TRẠNG THÁI", uid: "trang_thai" },
    { name: "THAO TÁC", uid: "actions" },
  ];

  const renderCell = (order: Order, columnKey: React.Key) => {
    switch (columnKey) {
      case "id_don_ve":
        return <Text>#{order.id_don_ve}</Text>;
      case "ten_phim":
        return <Text>{order.ten_phim || "Không có thông tin"}</Text>;
      case "ten_rap":
        return <Text>{order.ten_rap || "Không có thông tin"}</Text>;
      case "thoi_gian_giao_dich":
        return <Text>{formatDate(order.thoi_gian_giao_dich)}</Text>;
      case "hinh_thuc_giao_dich":
        return (
          <Badge
            color={
              order.hinh_thuc_giao_dich === "Offline" ? "success" : "primary"
            }
          >
            {order.hinh_thuc_giao_dich || "Không xác định"}
          </Badge>
        );
      case "tong_tien":
        return <Text>{order.tong_tien?.toLocaleString("vi-VN")} VNĐ</Text>;
      case "trang_thai":
        return (
          <Flex css={{ gap: "$2" }} align="center">
            {getStatusBadge(order.trang_thai)}
            {user?.role === 1 && (
              <Dropdown>
                <Dropdown.Button flat size="xs" css={{ ml: "$2" }}>
                  Cập nhật
                </Dropdown.Button>
                <Dropdown.Menu
                  aria-label="Cập nhật trạng thái"
                  onAction={(key) =>
                    handleStatusChange(order.id_don_ve, Number(key))
                  }
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={[order.trang_thai.toString()]}
                >
                  <Dropdown.Item key="0">Chờ thanh toán</Dropdown.Item>
                  <Dropdown.Item key="1">Đã thanh toán</Dropdown.Item>
                  <Dropdown.Item key="2">Đã hủy</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Flex>
        );
      case "actions":
        return (
          <Flex css={{ gap: "$4" }} justify="center">
            <Tooltip content="Chi tiết">
              <IconButton
                onClick={() => router.push(`/tickets/${order.id_don_ve}`)}
              >
                <EyeIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            {user?.role === 1 && (
              <Tooltip content="Xóa" color="error">
                <IconButton onClick={() => handleDelete(order.id_don_ve)}>
                  <DeleteIcon size={20} fill="#FF0080" />
                </IconButton>
              </Tooltip>
            )}
          </Flex>
        );
      default:
        return <Text>{order[columnKey as keyof Order]?.toString()}</Text>;
    }
  };

  if (loading) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Text color="error">{error}</Text>
        <Button
          auto
          color="primary"
          css={{ mt: "$5" }}
          onClick={() => fetchOrders()}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>Quản lý đơn vé</Text>
          <Flex css={{ gap: "$4" }}>
            <Button as="a" href="/showtimes" auto color="primary">
              Đặt vé tại quầy
            </Button>
          </Flex>
        </Flex>

        {orders.length > 0 ? (
          <Table
            aria-label="Danh sách đơn vé"
            css={{
              height: "auto",
              minWidth: "100%",
              boxShadow: "none",
              width: "100%",
              px: 0,
            }}
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body items={orders}>
              {(item) => (
                <Table.Row key={item.id_don_ve}>
                  {(columnKey) => (
                    <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                  )}
                </Table.Row>
              )}
            </Table.Body>
            <Table.Pagination shadow noMargin align="center" rowsPerPage={10} />
          </Table>
        ) : (
          <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
            <Text>Không có đơn vé nào.</Text>
          </Box>
        )}
      </Flex>

      {/* Delete Confirmation Modal */}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Xác nhận xóa
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Bạn có chắc chắn muốn xóa đơn vé này? Hành động này không thể hoàn
            tác.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onClick={() => setShowDeleteModal(false)}
          >
            Hủy
          </Button>
          <Button
            auto
            color="error"
            onClick={confirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Loading color="white" size="sm" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default TicketsPage;
