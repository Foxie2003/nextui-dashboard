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
import roomService, { Room } from "../../../services/roomService";
import roomSeatTemplateService, { SeatTemplate } from "../../../services/roomSeatTemplateService";

const RoomSeatMapPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [seatTemplates, setSeatTemplates] = useState<SeatTemplate[]>([]);
  const [error, setError] = useState("");

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
        console.error("Invalid room ID:", id);
        setError("ID phòng chiếu không hợp lệ");
        setLoading(false);
      }
    }
  }, [isAuthenticated, id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Kiểm tra ID phòng chiếu hợp lệ
      const roomId = Number(id);
      if (isNaN(roomId) || roomId <= 0) {
        console.error("Invalid room ID:", id);
        setError("ID phòng chiếu không hợp lệ");
        setLoading(false);
        return;
      }
      
      // Fetch room details
      const roomData = await roomService.getRoomById(roomId);
      if (!roomData) {
        setError("Không tìm thấy thông tin phòng chiếu");
        setLoading(false);
        return;
      }
      setRoom(Array.isArray(roomData) ? roomData[0] : roomData);

      // Fetch seat templates for this room
      const templatesData = await roomSeatTemplateService.getSeatTemplatesByRoom(roomId);
      
      // Kiểm tra dữ liệu mẫu ghế
      if (!templatesData || !Array.isArray(templatesData)) {
        console.error("Invalid seat templates data:", templatesData);
        setError("Dữ liệu mẫu ghế ngồi không hợp lệ");
        setSeatTemplates([]);
        setLoading(false);
        return;
      }

      // Xử lý dữ liệu ghế để thêm thông tin hàng và cột
      const processedTemplates = templatesData.map((template: SeatTemplate) => {
        const seatName = template.ten_ghe;
        // Tách tên ghế thành hàng và cột (ví dụ: A1 -> hàng A, cột 1)
        const match = seatName.match(/([A-Za-z]+)(\d+)/);
        if (match) {
          return {
            ...template,
            hang: match[1],
            cot: parseInt(match[2]),
          };
        }
        return template;
      });

      setSeatTemplates(processedTemplates);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setSeatTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Group seats by row for better display
  const groupSeatsByRow = () => {
    const rows: { [key: string]: SeatTemplate[] } = {};

    seatTemplates.forEach((template) => {
      const row = template.hang || template.ten_ghe.charAt(0);
      if (!rows[row]) {
        rows[row] = [];
      }
      rows[row].push(template);
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

  if (loading) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Text color="error">
          {error || "Không tìm thấy thông tin phòng chiếu"}
        </Text>
        <Button
          auto
          color="primary"
          css={{ mt: "$5" }}
          onClick={() => router.push("/room-seats")}
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
          <Text h2>Sơ đồ ghế ngồi theo phòng chiếu</Text>
          <Button as="a" href="/room-seats" auto flat>
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <Grid.Container gap={2}>
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text h3>{room.ten_phong_chieu || "Không có thông tin"}</Text>
                </Flex>
              </Grid>
              <Grid xs={12} md={6}>
                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text h3>Thông tin mẫu ghế</Text>
                  <Text>Tổng số mẫu ghế: {seatTemplates.length}</Text>
                </Flex>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Flex direction="column" css={{ gap: "$6", alignItems: "center" }}>
              <Text h3 css={{ textAlign: "center" }}>
                Sơ đồ mẫu ghế ngồi
              </Text>
              
              <Box css={{ width: "100%", maxWidth: "800px", overflowX: "auto" }}>
                <Flex direction="column" css={{ gap: "$2", alignItems: "center" }}>
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
                            key={seat.id_mau_ghe || `${seat.id_phong_chieu}-${seat.ten_ghe}`}
                            content={`${seat.ten_ghe}`}
                          >
                            <Button
                              size="sm"
                              color="primary"
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
            </Flex>
          </Card.Body>
        </Card>
      </Flex>
    </Box>
  );
};

export default RoomSeatMapPage;
