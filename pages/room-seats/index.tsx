import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Dropdown,
  Input,
  Modal,
  Spacer,
  Table,
  Badge,
  Tooltip,
} from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import { useAuth } from "../../contexts/AuthContext";
import theaterService, { Theater } from "../../services/theaterService";
import roomService, { Room } from "../../services/roomService";
import roomSeatTemplateService, {
  SeatTemplate,
} from "../../services/roomSeatTemplateService";
import { DeleteIcon } from "../../components/icons/table/delete-icon";
import { EditIcon } from "../../components/icons/table/edit-icon";
import { IconButton } from "../../components/table/table.styled";

const RoomSeatManagementPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [seatTemplates, setSeatTemplates] = useState<SeatTemplate[]>([]);
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [rowsInput, setRowsInput] = useState("A,B,C,D,E,F,G,H");
  const [colsInput, setColsInput] = useState("1,2,3,4,5,6,7,8,9,10");

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
      fetchTheaters();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedTheater) {
      fetchRooms(parseInt(selectedTheater));
    }
  }, [selectedTheater]);

  useEffect(() => {
    if (selectedRoom) {
      fetchSeatTemplates(parseInt(selectedRoom));
    }
  }, [selectedRoom]);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const data = await theaterService.getTheaters();
      setTheaters(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching theaters:", err);
      setError("Không thể tải danh sách rạp phim. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (theaterId: number) => {
    try {
      setLoading(true);
      const data = await roomService.getRoomsByTheater(theaterId);
      setRooms(Array.isArray(data) ? data : []);
      setSelectedRoom("");
      setError("");
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Không thể tải danh sách phòng chiếu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatTemplates = async (roomId: number) => {
    try {
      setLoading(true);
      const data = await roomSeatTemplateService.getSeatTemplatesByRoom(roomId);

      // Xử lý dữ liệu ghế để thêm thông tin hàng và cột
      const processedTemplates = data.map((template: SeatTemplate) => {
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

      // Sắp xếp ghế theo hàng và cột
      const sortedTemplates = processedTemplates.sort(
        (a: SeatTemplate, b: SeatTemplate) => {
          if (a.hang !== b.hang) {
            return a.hang.localeCompare(b.hang);
          }
          return (a.cot || 0) - (b.cot || 0);
        }
      );

      setSeatTemplates(sortedTemplates);
      setError("");
    } catch (err) {
      console.error("Error fetching seat templates:", err);
      setError("Không thể tải mẫu ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeatTemplates = async () => {
    if (!selectedRoom) {
      setError("Vui lòng chọn phòng chiếu trước khi tạo mẫu ghế");
      return;
    }

    try {
      setModalLoading(true);

      // Xử lý input hàng và cột
      const rows = rowsInput.split(",").map((row) => row.trim());
      const cols = colsInput.split(",").map((col) => parseInt(col.trim()));

      // Tạo template ghế
      const templatesData = roomSeatTemplateService.generateSeatTemplates(
        rows,
        cols,
        parseInt(selectedRoom)
      );

      // Gọi API để tạo mẫu ghế
      await roomSeatTemplateService.createMultipleSeatTemplates(templatesData);

      // Cập nhật danh sách mẫu ghế
      await fetchSeatTemplates(parseInt(selectedRoom));

      // Đóng modal
      setShowCreateModal(false);
      setError("");
    } catch (err) {
      console.error("Error creating seat templates:", err);
      setError("Không thể tạo mẫu ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAllSeatTemplates = async () => {
    if (!selectedRoom) return;

    try {
      setModalLoading(true);

      await roomSeatTemplateService.deleteAllSeatTemplatesByRoom({
        id_phong_chieu: parseInt(selectedRoom),
      });

      // Cập nhật danh sách mẫu ghế
      await fetchSeatTemplates(parseInt(selectedRoom));

      // Đóng modal
      setShowDeleteAllModal(false);
      setError("");
    } catch (err) {
      console.error("Error deleting all seat templates:", err);
      setError("Không thể xóa tất cả mẫu ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { name: "TÊN GHẾ", uid: "ten_ghe" },
    { name: "HÀNG", uid: "hang" },
    { name: "CỘT", uid: "cot" },
  ];

  const renderCell = (template: SeatTemplate, columnKey: React.Key) => {
    switch (columnKey) {
      case "ten_ghe":
        return <Text>{template.ten_ghe}</Text>;
      case "hang":
        return (
          <Text>{template.hang || template.ten_ghe.replace(/[0-9]/g, "")}</Text>
        );
      case "cot":
        return (
          <Text>{template.cot || template.ten_ghe.replace(/[^0-9]/g, "")}</Text>
        );
      default:
        return (
          <Text>{template[columnKey as keyof SeatTemplate]?.toString()}</Text>
        );
    }
  };

  if (loading && !selectedTheater) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>Quản lý sơ đồ ghế ngồi theo phòng chiếu</Text>
        </Flex>

        <Card>
          <Card.Body>
            <Flex direction="column" css={{ gap: "$6" }}>
              <Dropdown>
                <Dropdown.Button
                  flat
                  css={{ width: "100%", justifyContent: "space-between" }}
                >
                  {selectedTheater
                    ? theaters.find(
                        (t) => t.id_rap_phim.toString() === selectedTheater
                      )?.ten_rap || "Chọn rạp phim"
                    : "Chọn rạp phim"}
                </Dropdown.Button>
                <Dropdown.Menu
                  aria-label="Chọn rạp phim"
                  selectionMode="single"
                  selectedKeys={new Set([selectedTheater])}
                  onSelectionChange={(keys) => {
                    const selected = keys as Set<string>;
                    if (selected.size > 0) {
                      setSelectedTheater(Array.from(selected)[0]);
                    }
                  }}
                >
                  {theaters.map((theater) => (
                    <Dropdown.Item
                      key={theater.id_rap_phim.toString()}
                      textValue={theater.ten_rap}
                    >
                      {theater.ten_rap}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {selectedTheater && (
                <Dropdown>
                  <Dropdown.Button
                    flat
                    css={{ width: "100%", justifyContent: "space-between" }}
                  >
                    {selectedRoom
                      ? rooms.find(
                          (r) => r.id_phong_chieu.toString() === selectedRoom
                        )?.ten_phong_chieu || "Chọn phòng chiếu"
                      : "Chọn phòng chiếu"}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    aria-label="Chọn phòng chiếu"
                    selectionMode="single"
                    selectedKeys={new Set([selectedRoom])}
                    onSelectionChange={(keys) => {
                      const selected = keys as Set<string>;
                      if (selected.size > 0) {
                        setSelectedRoom(Array.from(selected)[0]);
                      }
                    }}
                  >
                    {rooms.map((room) => (
                      <Dropdown.Item
                        key={room.id_phong_chieu.toString()}
                        textValue={room.ten_phong_chieu}
                      >
                        {room.ten_phong_chieu}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}

              {selectedRoom && (
                <Flex justify="end" css={{ gap: "$4" }}>
                  <Button
                    auto
                    color="primary"
                    onPress={() => setShowCreateModal(true)}
                  >
                    Tạo mẫu ghế ngồi
                  </Button>
                  <Button
                    auto
                    color="secondary"
                    onPress={() =>
                      router.push(`/room-seats/map/${selectedRoom}`)
                    }
                  >
                    Xem sơ đồ
                  </Button>
                  <Button
                    auto
                    color="error"
                    onPress={() => setShowDeleteAllModal(true)}
                  >
                    Xóa tất cả mẫu ghế
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card.Body>
        </Card>

        {error && (
          <Card color="error">
            <Card.Body>
              <Text color="error">{error}</Text>
            </Card.Body>
          </Card>
        )}

        {selectedRoom && (
          <>
            <Text h3>Danh sách mẫu ghế ngồi</Text>
            {loading ? (
              <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
                <Loading size="xl" />
              </Box>
            ) : seatTemplates.length > 0 ? (
              <Table
                aria-label="Danh sách mẫu ghế ngồi"
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
                    <Table.Column key={column.uid} align="start">
                      {column.name}
                    </Table.Column>
                  )}
                </Table.Header>
                <Table.Body items={seatTemplates}>
                  {(item) => (
                    <Table.Row
                      key={
                        item.id_mau_ghe ||
                        `${item.id_phong_chieu}-${item.ten_ghe}`
                      }
                    >
                      {(columnKey) => (
                        <Table.Cell
                          key={`${
                            item.id_mau_ghe ||
                            `${item.id_phong_chieu}-${item.ten_ghe}`
                          }-${columnKey}`}
                        >
                          {renderCell(item, columnKey)}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  )}
                </Table.Body>
                <Table.Pagination
                  shadow
                  noMargin
                  align="center"
                  rowsPerPage={10}
                />
              </Table>
            ) : (
              <Card variant="flat">
                <Card.Body>
                  <Text css={{ textAlign: "center" }}>
                    Không có mẫu ghế ngồi nào cho phòng chiếu này.
                  </Text>
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Flex>

      {/* Modal tạo mẫu ghế ngồi */}
      <Modal
        closeButton
        aria-labelledby="create-seat-templates-modal"
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <Modal.Header>
          <Text id="create-seat-templates-modal" size={18}>
            Tạo mẫu ghế ngồi
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            label="Danh sách hàng (cách nhau bởi dấu phẩy)"
            placeholder="A,B,C,D,E,F,G,H"
            value={rowsInput}
            onChange={(e) => setRowsInput(e.target.value)}
            width="100%"
          />
          <Input
            label="Danh sách cột (cách nhau bởi dấu phẩy)"
            placeholder="1,2,3,4,5,6,7,8,9,10"
            value={colsInput}
            onChange={(e) => setColsInput(e.target.value)}
            width="100%"
          />
          <Text size={14} color="warning">
            Lưu ý: Hệ thống sẽ tạo mẫu ghế với tên là sự kết hợp của hàng và cột
            (ví dụ: A1, A2, B1, B2, ...)
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onPress={() => setShowCreateModal(false)}
          >
            Hủy
          </Button>
          <Button
            auto
            color="primary"
            onPress={handleCreateSeatTemplates}
            disabled={modalLoading}
          >
            {modalLoading ? <Loading color="white" size="sm" /> : "Tạo mẫu ghế"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả mẫu ghế ngồi */}
      <Modal
        closeButton
        aria-labelledby="delete-all-seat-templates-modal"
        open={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
      >
        <Modal.Header>
          <Text id="delete-all-seat-templates-modal" size={18}>
            Xác nhận xóa tất cả
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Bạn có chắc chắn muốn xóa tất cả mẫu ghế ngồi của phòng chiếu này?
            Hành động này không thể hoàn tác.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onPress={() => setShowDeleteAllModal(false)}
          >
            Hủy
          </Button>
          <Button
            auto
            color="error"
            onPress={handleDeleteAllSeatTemplates}
            disabled={modalLoading}
          >
            {modalLoading ? <Loading color="white" size="sm" /> : "Xóa tất cả"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default RoomSeatManagementPage;
