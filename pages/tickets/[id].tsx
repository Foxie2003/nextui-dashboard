import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Divider,
  Badge,
  Table,
} from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import { useAuth } from "../../contexts/AuthContext";
import orderService, { Order } from "../../services/orderService";
import ticketService, { Ticket } from "../../services/ticketService";

const TicketDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (id) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, id, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order details
      const orderData = await orderService.getOrderById(Number(id));
      if (!orderData || !orderData[0]) {
        setError("Không tìm thấy thông tin đơn vé");
        setLoading(false);
        return;
      }
      
      setOrder(orderData[0]);
      
      // Fetch tickets for this order
      const ticketsData = await ticketService.getTicketsByOrder(Number(id));
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      
      setError("");
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Không thể tải thông tin đơn vé. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
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
      minute: "2-digit"
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

  if (loading) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Text color="error">{error || "Không tìm thấy thông tin đơn vé"}</Text>
        <Button
          auto
          color="primary"
          css={{ mt: "$5" }}
          onClick={() => router.push("/tickets")}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>Chi tiết đơn vé #{order.id_don_ve}</Text>
          <Button as="a" href="/tickets" auto flat>
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <Grid.Container gap={2}>
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                  <Box>
                    <Text h3 css={{ mb: "$2" }}>Thông tin đơn vé</Text>
                    <Divider css={{ my: "$5" }} />
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Mã đơn vé:</Text>
                      <Text>#{order.id_don_ve}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Thời gian đặt:</Text>
                      <Text>{formatDate(order.thoi_gian_giao_dich)}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Hình thức:</Text>
                      <Text>{order.hinh_thuc_giao_dich}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Tổng tiền:</Text>
                      <Text>{order.tong_tien?.toLocaleString("vi-VN")} VNĐ</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Trạng thái:</Text>
                      {getStatusBadge(order.trang_thai)}
                    </Flex>
                  </Box>
                </Flex>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                  <Box>
                    <Text h3 css={{ mb: "$2" }}>Thông tin suất chiếu</Text>
                    <Divider css={{ my: "$5" }} />
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Phim:</Text>
                      <Text>{order.ten_phim || "Không có thông tin"}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Rạp:</Text>
                      <Text>{order.ten_rap || "Không có thông tin"}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Phòng:</Text>
                      <Text>{order.ten_phong || "Không có thông tin"}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Ngày chiếu:</Text>
                      <Text>{order.ngay_chieu || "Không có thông tin"}</Text>
                    </Flex>
                    
                    <Flex css={{ mb: "$5" }}>
                      <Text b css={{ width: "150px" }}>Giờ chiếu:</Text>
                      <Text>{order.gio_chieu || "Không có thông tin"}</Text>
                    </Flex>
                  </Box>
                </Flex>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>

        <Text h3>Danh sách vé</Text>
        
        {tickets.length > 0 ? (
          <Table
            aria-label="Danh sách vé"
            css={{
              height: "auto",
              minWidth: "100%",
              boxShadow: "none",
              width: "100%",
              px: 0,
            }}
          >
            <Table.Header>
              <Table.Column>MÃ VÉ</Table.Column>
              <Table.Column>GHẾ</Table.Column>
              <Table.Column>PHIM</Table.Column>
              <Table.Column>RẠP</Table.Column>
              <Table.Column>PHÒNG</Table.Column>
            </Table.Header>
            <Table.Body>
              {tickets.map((ticket) => (
                <Table.Row key={ticket.id_ve}>
                  <Table.Cell>#{ticket.id_ve}</Table.Cell>
                  <Table.Cell>{ticket.ten_ghe || "Không có thông tin"}</Table.Cell>
                  <Table.Cell>{ticket.ten_phim || "Không có thông tin"}</Table.Cell>
                  <Table.Cell>{ticket.ten_rap || "Không có thông tin"}</Table.Cell>
                  <Table.Cell>{ticket.ten_phong || "Không có thông tin"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
            <Text>Không có vé nào trong đơn hàng này.</Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default TicketDetailPage;
