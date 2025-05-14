import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Badge,
  Tooltip,
  Modal,
  Dropdown,
} from "@nextui-org/react";
import { Box } from "../../../components/styles/box";
import { Flex } from "../../../components/styles/flex";
import { useAuth } from "../../../contexts/AuthContext";
import showtimeService, { Showtime } from "../../../services/showtimeService";
import seatManagementService, {
  Seat,
} from "../../../services/seatManagementService";

const SeatMapPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [error, setError] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seatStatus, setSeatStatus] = useState("0");
  const [modalLoading, setModalLoading] = useState(false);

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
    if (isAuthenticated && id) {
      // Kiểm tra id có phải là số hợp lệ không
      if (!isNaN(Number(id))) {
        fetchData();
      } else {
        console.error("Invalid showtime ID:", id);
        setError("ID suất chiếu không hợp lệ");
        setLoading(false);
      }
    }
  }, [isAuthenticated, id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Kiểm tra ID suất chiếu hợp lệ
      const showtimeId = Number(id);
      if (isNaN(showtimeId) || showtimeId <= 0) {
        console.error("Invalid showtime ID:", id);
        setError("ID suất chiếu không hợp lệ");
        setLoading(false);
        return;
      }

      // Fetch showtime details
      const showtimeData = await showtimeService.getShowtimeById(showtimeId);
      if (!showtimeData) {
        setError("Không tìm thấy thông tin suất chiếu");
        setLoading(false);
        return;
      }
      setShowtime(Array.isArray(showtimeData) ? showtimeData[0] : showtimeData);

      // Fetch seats for this showtime
      const seatsData = await seatManagementService.getSeatsBySuatChieu(
        showtimeId
      );

      // Kiểm tra dữ liệu ghế
      if (!seatsData || !Array.isArray(seatsData)) {
        console.error("Invalid seats data:", seatsData);
        setError("Dữ liệu ghế ngồi không hợp lệ");
        setSeats([]);
        setLoading(false);
        return;
      }

      // Xử lý dữ liệu ghế để thêm thông tin hàng và cột
      const processedSeats = seatsData.map((seat: Seat) => {
        const seatName = seat.ten_ghe;
        // Tách tên ghế thành hàng và cột (ví dụ: A1 -> hàng A, cột 1)
        const match = seatName.match(/([A-Za-z]+)(\d+)/);
        if (match) {
          return {
            ...seat,
            hang: match[1],
            cot: parseInt(match[2]),
          };
        }
        return seat;
      });

      setSeats(processedSeats);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeat = async () => {
    if (!selectedSeat) return;

    try {
      setModalLoading(true);

      await seatManagementService.updateSeat({
        id_ghe_ngoi: selectedSeat.id_ghe_ngoi,
        trang_thai: parseInt(seatStatus),
      });

      // Cập nhật danh sách ghế
      await fetchData();

      // Đóng modal
      setShowEditModal(false);
      setError("");
    } catch (err) {
      console.error("Error updating seat:", err);
      setError("Không thể cập nhật ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setModalLoading(false);
    }
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
    switch (seat.trang_thai) {
      case 0:
        return "primary"; // Trống
      case 1:
        return "error"; // Đã đặt
      case 2:
        return "warning"; // Đang chọn
      default:
        return "default";
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
          onClick={() => router.push("/seats")}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  const groupedSeats = groupSeatsByRow();

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>Sơ đồ trạng thái ghế ngồi theo suất chiếu</Text>
          <Button as="a" href="/seats" auto flat>
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
                    Giá vé: {showtime.gia_ve?.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Flex>
              </Grid>
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text h3>Thông tin ghế</Text>
                  <Text>Tổng số ghế: {seats.length}</Text>
                  <Text>
                    Ghế trống:{" "}
                    {seats.filter((seat) => seat.trang_thai === 0).length}
                  </Text>
                  <Text>
                    Ghế đã đặt:{" "}
                    {seats.filter((seat) => seat.trang_thai === 1).length}
                  </Text>
                  <Text>
                    Ghế đang chọn:{" "}
                    {seats.filter((seat) => seat.trang_thai === 2).length}
                  </Text>
                </Flex>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>

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
                          <Tooltip
                            key={seat.id_ghe_ngoi}
                            content={`${seat.ten_ghe} - ${
                              seat.trang_thai === 0
                                ? "Trống"
                                : seat.trang_thai === 1
                                ? "Đã đặt"
                                : "Đang chọn"
                            }`}
                          >
                            <Button
                              size="sm"
                              color={getSeatColor(seat)}
                              onClick={() => {
                                setSelectedSeat(seat);
                                setSeatStatus(seat.trang_thai.toString());
                                setShowEditModal(true);
                              }}
                              css={{
                                minWidth: "40px",
                                height: "40px",
                                p: 0,
                              }}
                            >
                              {seat.ten_ghe.substring(1) || seat.cot}
                            </Button>
                          </Tooltip>
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
                      backgroundColor: "$error",
                      borderRadius: "$xs",
                    }}
                  />
                  <Text>Ghế đã đặt</Text>
                </Flex>
                <Flex align="center" css={{ gap: "$2" }}>
                  <Box
                    css={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "$warning",
                      borderRadius: "$xs",
                    }}
                  />
                  <Text>Ghế đang chọn</Text>
                </Flex>
              </Flex>
            </Flex>
          </Card.Body>
        </Card>
      </Flex>

      {/* Modal chỉnh sửa ghế ngồi */}
      <Modal
        closeButton
        aria-labelledby="edit-seat-modal"
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <Modal.Header>
          <Text id="edit-seat-modal" size={18}>
            Chỉnh sửa ghế {selectedSeat?.ten_ghe}
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Dropdown>
            <Dropdown.Button flat css={{ width: "100%" }}>
              {seatStatus === "0"
                ? "Trống"
                : seatStatus === "1"
                ? "Đã đặt"
                : seatStatus === "2"
                ? "Đang chọn"
                : "Chọn trạng thái"}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Chọn trạng thái"
              selectionMode="single"
              selectedKeys={new Set([seatStatus])}
              onSelectionChange={(keys) => {
                const selected = keys as Set<string>;
                if (selected.size > 0) {
                  setSeatStatus(Array.from(selected)[0]);
                }
              }}
            >
              <Dropdown.Item key="0">Trống</Dropdown.Item>
              <Dropdown.Item key="1">Đã đặt</Dropdown.Item>
              <Dropdown.Item key="2">Đang chọn</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onClick={() => setShowEditModal(false)}
          >
            Hủy
          </Button>
          <Button
            auto
            color="primary"
            onClick={handleUpdateSeat}
            disabled={modalLoading}
          >
            {modalLoading ? <Loading color="white" size="sm" /> : "Cập nhật"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default SeatMapPage;
