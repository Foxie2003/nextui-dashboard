import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Spacer,
  Input,
  Checkbox,
} from "@nextui-org/react";
import { Box } from "../../../components/styles/box";
import { Flex } from "../../../components/styles/flex";
import { useAuth } from "../../../contexts/AuthContext";
import showtimeService, { Showtime } from "../../../services/showtimeService";
import seatService, { Seat } from "../../../services/seatService";
import orderService from "../../../services/orderService";

const CheckoutPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isOfflinePayment, setIsOfflinePayment] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);

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
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Get data from session storage
    const storedSeats = sessionStorage.getItem("selectedSeats");
    const storedShowtimeId = sessionStorage.getItem("showtimeId");
    const storedTotalPrice = sessionStorage.getItem("totalPrice");

    if (!storedSeats || !storedShowtimeId || storedShowtimeId !== id) {
      router.push(`/showtimes/${id}/seats`);
      return;
    }

    setSelectedSeatIds(JSON.parse(storedSeats));
    setTotalPrice(Number(storedTotalPrice));

    fetchData();
  }, [isAuthenticated, id, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch showtime details
      const showtimeData = await showtimeService.getShowtimeById(Number(id));
      if (!showtimeData) {
        setError("Không tìm thấy thông tin suất chiếu");
        setLoading(false);
        return;
      }
      setShowtime(Array.isArray(showtimeData) ? showtimeData[0] : showtimeData);

      // Fetch details for selected seats
      const storedSeats = sessionStorage.getItem("selectedSeats");
      if (storedSeats) {
        const seatIds = JSON.parse(storedSeats) as number[];
        const seats: Seat[] = [];

        for (const seatId of seatIds) {
          try {
            const seatData = await seatService.getSeatById(seatId);
            if (seatData) {
              seats.push(Array.isArray(seatData) ? seatData[0] : seatData);
            }
          } catch (err) {
            console.error(`Error fetching seat ${seatId}:`, err);
          }
        }

        setSelectedSeats(seats);
      }

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAmountChange = (value: string) => {
    setPaymentAmount(value);
    const payment = parseFloat(value) || 0;
    const change = payment - totalPrice;
    setChangeAmount(change > 0 ? change : 0);
  };

  const handleSubmit = async () => {
    // Validate form
    if (isOfflinePayment) {
      if (!customerName.trim()) {
        setError("Vui lòng nhập tên khách hàng");
        return;
      }

      if (parseFloat(paymentAmount) < totalPrice) {
        setError("Số tiền thanh toán không đủ");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      // Create order
      const orderData = {
        id_khach_hang: user?.id_khach_hang || 0, // Use 0 for guest or offline customers
        id_suat_chieu: Number(id),
        thoi_gian_giao_dich: new Date().toISOString(),
        hinh_thuc_giao_dich: isOfflinePayment ? "Offline" : "Online",
        tong_tien: totalPrice,
        trang_thai: 1, // 1: Đã thanh toán
        danh_sach_ghe: selectedSeatIds,
      };

      const response = await orderService.createOrder(orderData);

      // Clear session storage
      sessionStorage.removeItem("selectedSeats");
      sessionStorage.removeItem("showtimeId");
      sessionStorage.removeItem("totalPrice");

      // Redirect to order details page
      router.push(`/tickets/${response.id_don_ve}`);
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Không thể tạo đơn vé. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleTimeString("vi-VN", options);
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
          onClick={() => router.push(`/showtimes/${id}/seats`)}
        >
          Quay lại chọn ghế
        </Button>
      </Box>
    );
  }

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Flex direction="column" css={{ gap: "$2" }}>
            <Text h2>Thanh toán</Text>
            <Text css={{ color: "$accents8" }}>
              Hoàn tất thanh toán cho khách hàng mua vé tại quầy
            </Text>
          </Flex>
          <Button as="a" href={`/showtimes/${id}/seats`} auto flat>
            Quay lại
          </Button>
        </Flex>

        <Grid.Container gap={2}>
          <Grid xs={12} md={8}>
            <Card css={{ width: "100%" }}>
              <Card.Header>
                <Text h3>Thông tin khách hàng</Text>
              </Card.Header>
              <Card.Body>
                <Flex direction="column" css={{ gap: "$6" }}>
                  <Input
                    label="Họ tên khách hàng"
                    placeholder="Nhập họ tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    width="100%"
                    required
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    width="100%"
                  />
                  <Input
                    label="Email"
                    placeholder="Nhập email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    width="100%"
                  />
                  <Checkbox
                    isSelected={isOfflinePayment}
                    onChange={setIsOfflinePayment}
                    defaultSelected
                  >
                    Thanh toán trực tiếp tại quầy
                  </Checkbox>

                  {isOfflinePayment && (
                    <Flex direction="column" css={{ gap: "$4", mt: "$6" }}>
                      <Text b>Thông tin thanh toán</Text>
                      <Input
                        label="Số tiền khách trả"
                        placeholder="Nhập số tiền khách trả"
                        value={paymentAmount}
                        onChange={(e) =>
                          handlePaymentAmountChange(e.target.value)
                        }
                        width="100%"
                        type="number"
                        min={totalPrice}
                      />
                      <Flex justify="between">
                        <Text>Tiền thối lại:</Text>
                        <Text b color="success">
                          {changeAmount.toLocaleString("vi-VN")} VNĐ
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              </Card.Body>
            </Card>
          </Grid>

          <Grid xs={12} md={4}>
            <Card css={{ width: "100%" }}>
              <Card.Header>
                <Text h3>Thông tin đơn hàng</Text>
              </Card.Header>
              <Card.Body>
                <Flex direction="column" css={{ gap: "$4" }}>
                  <Text b size="$lg">
                    {showtime?.ten_phim || "Không có thông tin"}
                  </Text>
                  <Text>Rạp: {showtime?.ten_rap || "Không có thông tin"}</Text>
                  <Text>
                    Phòng: {showtime?.ten_phong_chieu || "Không có thông tin"}
                  </Text>
                  <Text>
                    Thời gian:{" "}
                    {showtime?.thoi_gian && formatDate(showtime.thoi_gian)}{" "}
                    {showtime?.thoi_gian && formatTime(showtime.thoi_gian)}
                  </Text>
                  <Text>
                    Ghế: {selectedSeats.map((seat) => seat.ten_ghe).join(", ")}
                  </Text>
                  <Text>Số lượng: {selectedSeats.length} ghế</Text>
                  <Text b>
                    Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Flex>
              </Card.Body>
              <Card.Body css={{ borderTop: "1px solid $border" }}>
                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text b size="$md" color="primary">
                    Thông tin thanh toán
                  </Text>
                  <Flex justify="between">
                    <Text>Tổng tiền:</Text>
                    <Text b>{totalPrice.toLocaleString("vi-VN")} VNĐ</Text>
                  </Flex>
                  {isOfflinePayment && (
                    <>
                      <Flex justify="between">
                        <Text>Tiền khách trả:</Text>
                        <Text b>
                          {parseFloat(paymentAmount || "0").toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Text>
                      </Flex>
                      <Flex justify="between">
                        <Text>Tiền thối lại:</Text>
                        <Text b color="success">
                          {changeAmount.toLocaleString("vi-VN")} VNĐ
                        </Text>
                      </Flex>
                    </>
                  )}
                </Flex>
              </Card.Body>
              <Card.Footer>
                <Button
                  color="primary"
                  css={{ width: "100%" }}
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    (isOfflinePayment &&
                      parseFloat(paymentAmount || "0") < totalPrice)
                  }
                >
                  {submitting ? (
                    <Loading color="white" size="sm" />
                  ) : (
                    "Xác nhận thanh toán"
                  )}
                </Button>
              </Card.Footer>
            </Card>
          </Grid>
        </Grid.Container>
      </Flex>
    </Box>
  );
};

export default CheckoutPage;
