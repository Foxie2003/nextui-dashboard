import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Spacer,
  Badge,
} from "@nextui-org/react";
import { Box } from "../../../components/styles/box";
import { Flex } from "../../../components/styles/flex";
import { useAuth } from "../../../contexts/AuthContext";
import showtimeService, { Showtime } from "../../../services/showtimeService";
import seatService, { Seat } from "../../../services/seatService";

const SeatSelectionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

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
    if (isAuthenticated && id) {
      fetchData();
    }
  }, [isAuthenticated, id]);

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

      // Fetch seats for this showtime
      const seatsData = await seatService.getSeatsByShowtime(Number(id));
      setSeats(Array.isArray(seatsData) ? seatsData : []);

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.trang_thai !== 0) {
      // Seat is already taken
      return;
    }

    const isSelected = selectedSeats.some(
      (s) => s.id_ghe_ngoi === seat.id_ghe_ngoi
    );

    if (isSelected) {
      // Remove from selection
      const newSelectedSeats = selectedSeats.filter(
        (s) => s.id_ghe_ngoi !== seat.id_ghe_ngoi
      );
      setSelectedSeats(newSelectedSeats);
      calculateTotalPrice(newSelectedSeats);
    } else {
      // Add to selection
      const newSelectedSeats = [...selectedSeats, seat];
      setSelectedSeats(newSelectedSeats);
      calculateTotalPrice(newSelectedSeats);
    }
  };

  const calculateTotalPrice = (selectedSeats: Seat[]) => {
    const price = selectedSeats.reduce((total, seat) => {
      return total + (showtime?.gia_ve || 0);
    }, 0);
    setTotalPrice(price);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế");
      return;
    }

    // Store selected seats in session storage to pass to checkout page
    sessionStorage.setItem(
      "selectedSeats",
      JSON.stringify(selectedSeats.map((seat) => seat.id_ghe_ngoi))
    );
    sessionStorage.setItem("showtimeId", id as string);
    sessionStorage.setItem("totalPrice", totalPrice.toString());

    router.push(`/showtimes/${id}/checkout`);
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

  // Group seats by row for better display
  const groupSeatsByRow = () => {
    const rows: { [key: string]: Seat[] } = {};

    seats.forEach((seat) => {
      const row = seat.hang || seat.ten_ghe.charAt(0);
      if (!rows[row]) {
        rows[row] = [];
      }
      rows[row].push(seat);
    });

    // Sort rows by row name
    return Object.keys(rows)
      .sort()
      .map((row) => ({
        row,
        seats: rows[row].sort((a, b) => {
          // Extract seat number for sorting
          const aNum = parseInt(a.ten_ghe.substring(1)) || a.cot || 0;
          const bNum = parseInt(b.ten_ghe.substring(1)) || b.cot || 0;
          return aNum - bNum;
        }),
      }));
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.trang_thai !== 0) {
      return "error"; // Taken seat
    }

    const isSelected = selectedSeats.some(
      (s) => s.id_ghe_ngoi === seat.id_ghe_ngoi
    );

    return isSelected ? "success" : "primary"; // Selected or available
  };

  if (loading) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error || !showtime) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Text color="error">
          {error || "Không tìm thấy thông tin suất chiếu"}
        </Text>
        <Button
          auto
          color="primary"
          css={{ mt: "$5" }}
          onClick={() => router.push("/showtimes")}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const groupedSeats = groupSeatsByRow();

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Flex direction="column" css={{ gap: "$2" }}>
            <Text h2>Chọn ghế</Text>
            <Text css={{ color: "$accents8" }}>
              Chọn ghế cho khách hàng mua vé tại quầy
            </Text>
          </Flex>
          <Button as="a" href="/showtimes" auto flat>
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <Grid.Container gap={2}>
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text h3>{showtime.ten_phim || "Không có thông tin"}</Text>
                  <Text>Rạp: {showtime.ten_rap || "Không có thông tin"}</Text>
                  <Text>
                    Phòng chiếu:{" "}
                    {showtime.ten_phong_chieu || "Không có thông tin"}
                  </Text>
                  <Text>
                    Thời gian: {formatDate(showtime.thoi_gian)}{" "}
                    {formatTime(showtime.thoi_gian)}
                  </Text>
                  <Text>
                    Giá vé: {showtime.gia_ve.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Flex>
              </Grid>
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text h3>Thông tin đặt vé</Text>
                  <Text>
                    Ghế đã chọn:{" "}
                    {selectedSeats.length > 0
                      ? selectedSeats.map((seat) => seat.ten_ghe).join(", ")
                      : "Chưa chọn ghế"}
                  </Text>
                  <Text>Số lượng: {selectedSeats.length} ghế</Text>
                  <Text>
                    Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Flex>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>

        <Spacer y={1} />

        <Card>
          <Card.Body>
            <Flex direction="column" css={{ gap: "$6", alignItems: "center" }}>
              <Text h3 css={{ textAlign: "center" }}>
                Sơ đồ ghế ngồi
              </Text>

              <Box
                css={{ width: "100%", maxWidth: "800px", overflowX: "auto" }}
              >
                <Flex
                  direction="column"
                  css={{ gap: "$2", alignItems: "center" }}
                >
                  <Box
                    css={{
                      width: "80%",
                      height: "30px",
                      backgroundColor: "$accents2",
                      borderRadius: "$md",
                      mb: "$8",
                      textAlign: "center",
                    }}
                  >
                    <Text css={{ lineHeight: "30px" }}>Màn hình</Text>
                  </Box>

                  {groupedSeats.map(({ row, seats }) => (
                    <Flex key={row} css={{ gap: "$2", mb: "$2" }}>
                      <Text b css={{ width: "30px", textAlign: "center" }}>
                        {row}
                      </Text>
                      <Flex css={{ gap: "$2" }}>
                        {seats.map((seat) => (
                          <Button
                            key={seat.id_ghe_ngoi}
                            size="sm"
                            color={getSeatColor(seat)}
                            disabled={seat.trang_thai !== 0}
                            onClick={() => handleSeatClick(seat)}
                            css={{
                              minWidth: "40px",
                              height: "40px",
                              p: 0,
                            }}
                          >
                            {seat.ten_ghe.substring(1) || seat.cot}
                          </Button>
                        ))}
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Box>

              <Flex css={{ gap: "$6", mt: "$8" }}>
                <Flex align="center" css={{ gap: "$2" }}>
                  <Box
                    css={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "$primary",
                      borderRadius: "$xs",
                    }}
                  />
                  <Text>Ghế trống</Text>
                </Flex>
                <Flex align="center" css={{ gap: "$2" }}>
                  <Box
                    css={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "$success",
                      borderRadius: "$xs",
                    }}
                  />
                  <Text>Ghế đã chọn</Text>
                </Flex>
                <Flex align="center" css={{ gap: "$2" }}>
                  <Box
                    css={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "$error",
                      borderRadius: "$xs",
                    }}
                  />
                  <Text>Ghế đã đặt</Text>
                </Flex>
              </Flex>
            </Flex>
          </Card.Body>
          <Card.Footer>
            <Flex css={{ width: "100%" }} justify="center">
              <Button
                color="primary"
                size="lg"
                disabled={selectedSeats.length === 0}
                onClick={handleProceedToCheckout}
              >
                Tiếp tục
              </Button>
            </Flex>
          </Card.Footer>
        </Card>
      </Flex>
    </Box>
  );
};

export default SeatSelectionPage;
