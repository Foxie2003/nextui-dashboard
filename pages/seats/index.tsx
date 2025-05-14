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
import showtimeService, { Showtime } from "../../services/showtimeService";
import seatManagementService, {
  Seat,
  CreateMultipleSeatsRequest,
} from "../../services/seatManagementService";
import { DeleteIcon } from "../../components/icons/table/delete-icon";
import { EditIcon } from "../../components/icons/table/edit-icon";
import { IconButton } from "../../components/table/table.styled";

const SeatManagementPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [rowsInput, setRowsInput] = useState("A,B,C,D,E,F,G,H");
  const [colsInput, setColsInput] = useState("1,2,3,4,5,6,7,8,9,10");
  const [seatStatus, setSeatStatus] = useState("0");

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
      fetchShowtimes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedShowtime) {
      fetchSeats(parseInt(selectedShowtime));
    }
  }, [selectedShowtime]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const data = await showtimeService.getShowtimes();

      // Lọc ra các suất chiếu có ID hợp lệ
      const validShowtimes = Array.isArray(data)
        ? data.filter(
            (showtime) =>
              showtime.id_lich_chieu &&
              !isNaN(Number(showtime.id_lich_chieu)) &&
              Number(showtime.id_lich_chieu) > 0
          )
        : [];

      setShowtimes(validShowtimes);
      setError("");
    } catch (err) {
      console.error("Error fetching showtimes:", err);
      setError("Không thể tải danh sách suất chiếu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (showtimeId: number) => {
    // Kiểm tra ID suất chiếu hợp lệ
    if (isNaN(showtimeId) || showtimeId <= 0) {
      console.error("Invalid showtime ID:", showtimeId);
      setError("ID suất chiếu không hợp lệ");
      setSeats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await seatManagementService.getSeatsBySuatChieu(showtimeId);

      // Kiểm tra dữ liệu trả về
      if (!data || !Array.isArray(data)) {
        console.error("Invalid data returned from API:", data);
        setError("Dữ liệu ghế ngồi không hợp lệ");
        setSeats([]);
        setLoading(false);
        return;
      }

      // Xử lý dữ liệu ghế để thêm thông tin hàng và cột
      const processedSeats = data.map((seat: Seat) => {
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

      // Sắp xếp ghế theo hàng và cột
      const sortedSeats = processedSeats.sort((a: Seat, b: Seat) => {
        if (a.hang !== b.hang) {
          return a.hang.localeCompare(b.hang);
        }
        return (a.cot || 0) - (b.cot || 0);
      });

      setSeats(sortedSeats);
      setError("");
    } catch (err) {
      console.error("Error fetching seats:", err);
      setError("Không thể tải danh sách ghế ngồi. Vui lòng thử lại sau.");
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeats = async () => {
    if (!selectedShowtime) {
      setError("Vui lòng chọn suất chiếu trước khi tạo ghế");
      return;
    }

    try {
      setModalLoading(true);

      // Xử lý input hàng và cột
      const rows = rowsInput.split(",").map((row) => row.trim());
      const cols = colsInput.split(",").map((col) => parseInt(col.trim()));

      // Tạo template ghế
      const seatsTemplate = seatManagementService.generateSeatsTemplate(
        rows,
        cols,
        parseInt(selectedShowtime)
      );

      // Gọi API để tạo ghế
      await seatManagementService.createMultipleSeats(seatsTemplate);

      // Cập nhật danh sách ghế
      await fetchSeats(parseInt(selectedShowtime));

      // Đóng modal
      setShowCreateModal(false);
      setError("");
    } catch (err) {
      console.error("Error creating seats:", err);
      setError("Không thể tạo ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setModalLoading(false);
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
      await fetchSeats(parseInt(selectedShowtime));

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

  const handleDeleteSeat = async () => {
    if (!selectedSeat) return;

    try {
      setModalLoading(true);

      await seatManagementService.deleteSeat({
        id_ghe_ngoi: selectedSeat.id_ghe_ngoi,
      });

      // Cập nhật danh sách ghế
      await fetchSeats(parseInt(selectedShowtime));

      // Đóng modal
      setShowDeleteModal(false);
      setError("");
    } catch (err) {
      console.error("Error deleting seat:", err);
      setError("Không thể xóa ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAllSeats = async () => {
    if (!selectedShowtime) return;

    try {
      setModalLoading(true);

      await seatManagementService.deleteAllSeatsBySuatChieu({
        id_suat_chieu: parseInt(selectedShowtime),
      });

      // Cập nhật danh sách ghế
      await fetchSeats(parseInt(selectedShowtime));

      // Đóng modal
      setShowDeleteAllModal(false);
      setError("");
    } catch (err) {
      console.error("Error deleting all seats:", err);
      setError("Không thể xóa tất cả ghế ngồi. Vui lòng thử lại sau.");
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge color="primary">Trống</Badge>;
      case 1:
        return <Badge color="error">Đã đặt</Badge>;
      case 2:
        return <Badge color="warning">Đang chọn</Badge>;
      default:
        return <Badge color="default">Không xác định</Badge>;
    }
  };

  const columns = [
    { name: "TÊN GHẾ", uid: "ten_ghe" },
    { name: "HÀNG", uid: "hang" },
    { name: "CỘT", uid: "cot" },
    { name: "TRẠNG THÁI", uid: "trang_thai" },
    { name: "THAO TÁC", uid: "actions" },
  ];

  const renderCell = (seat: Seat, columnKey: React.Key) => {
    switch (columnKey) {
      case "ten_ghe":
        return <Text>{seat.ten_ghe}</Text>;
      case "hang":
        return <Text>{seat.hang || seat.ten_ghe.replace(/[0-9]/g, "")}</Text>;
      case "cot":
        return <Text>{seat.cot || seat.ten_ghe.replace(/[^0-9]/g, "")}</Text>;
      case "trang_thai":
        return getStatusBadge(seat.trang_thai);
      case "actions":
        return (
          <Flex css={{ gap: "$4" }} justify="center">
            <Tooltip content="Chỉnh sửa">
              <IconButton
                onClick={() => {
                  setSelectedSeat(seat);
                  setSeatStatus(seat.trang_thai.toString());
                  setShowEditModal(true);
                }}
              >
                <EditIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Xóa" color="error">
              <IconButton
                onClick={() => {
                  setSelectedSeat(seat);
                  setShowDeleteModal(true);
                }}
              >
                <DeleteIcon size={20} fill="#FF0080" />
              </IconButton>
            </Tooltip>
          </Flex>
        );
      default:
        return <Text>{seat[columnKey as keyof Seat]?.toString()}</Text>;
    }
  };

  if (loading && !selectedShowtime) {
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
          <Text h2>Quản lý trạng thái ghế ngồi theo suất chiếu</Text>
        </Flex>

        <Card>
          <Card.Body>
            <Flex direction="column" css={{ gap: "$6" }}>
              <Dropdown>
                <Dropdown.Button
                  flat
                  css={{ width: "100%", justifyContent: "space-between" }}
                >
                  {selectedShowtime
                    ? showtimes.find(
                        (s) => s.id_lich_chieu?.toString() === selectedShowtime
                      )
                      ? `${
                          showtimes.find(
                            (s) =>
                              s.id_lich_chieu?.toString() === selectedShowtime
                          )?.ten_phim
                        } - ${new Date(
                          showtimes.find(
                            (s) =>
                              s.id_lich_chieu?.toString() === selectedShowtime
                          )?.thoi_gian || ""
                        ).toLocaleString("vi-VN")}`
                      : "Chọn suất chiếu"
                    : "Chọn suất chiếu"}
                </Dropdown.Button>
                <Dropdown.Menu
                  aria-label="Chọn suất chiếu"
                  selectionMode="single"
                  selectedKeys={new Set([selectedShowtime])}
                  onSelectionChange={(keys) => {
                    const selected = keys as Set<string>;
                    if (selected.size > 0) {
                      const selectedKey = Array.from(selected)[0];
                      setSelectedShowtime(selectedKey);
                    }
                  }}
                >
                  {showtimes.map((showtime) => (
                    <Dropdown.Item
                      key={showtime.id_lich_chieu.toString()}
                      textValue={showtime.ten_phim}
                    >
                      {showtime.ten_phim} -{" "}
                      {new Date(showtime.thoi_gian).toLocaleString("vi-VN")}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {selectedShowtime && (
                <Flex justify="end" css={{ gap: "$4" }}>
                  <Button
                    auto
                    color="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Tạo ghế ngồi
                  </Button>
                  <Button
                    auto
                    color="secondary"
                    onClick={() =>
                      router.push(`/seats/map/${selectedShowtime}`)
                    }
                  >
                    Xem sơ đồ
                  </Button>
                  <Button
                    auto
                    color="error"
                    onClick={() => setShowDeleteAllModal(true)}
                  >
                    Xóa tất cả ghế
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

        {selectedShowtime && (
          <>
            <Text h3>Danh sách ghế ngồi</Text>
            {loading ? (
              <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
                <Loading size="xl" />
              </Box>
            ) : seats.length > 0 ? (
              <Table
                aria-label="Danh sách ghế ngồi"
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
                <Table.Body items={seats}>
                  {(item) => (
                    <Table.Row key={item.id_ghe_ngoi}>
                      {(columnKey) => (
                        <Table.Cell key={`${item.id_ghe_ngoi}-${columnKey}`}>
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
                    Không có ghế ngồi nào cho suất chiếu này.
                  </Text>
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Flex>

      {/* Modal tạo ghế ngồi */}
      <Modal
        closeButton
        aria-labelledby="create-seats-modal"
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <Modal.Header>
          <Text id="create-seats-modal" size={18}>
            Tạo ghế ngồi
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
            Lưu ý: Hệ thống sẽ tạo ghế với tên là sự kết hợp của hàng và cột (ví
            dụ: A1, A2, B1, B2, ...)
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onClick={() => setShowCreateModal(false)}
          >
            Hủy
          </Button>
          <Button
            auto
            color="primary"
            onClick={handleCreateSeats}
            disabled={modalLoading}
          >
            {modalLoading ? <Loading color="white" size="sm" /> : "Tạo ghế"}
          </Button>
        </Modal.Footer>
      </Modal>

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

      {/* Modal xóa ghế ngồi */}
      <Modal
        closeButton
        aria-labelledby="delete-seat-modal"
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <Modal.Header>
          <Text id="delete-seat-modal" size={18}>
            Xác nhận xóa
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Bạn có chắc chắn muốn xóa ghế {selectedSeat?.ten_ghe}? Hành động này
            không thể hoàn tác.
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
            onClick={handleDeleteSeat}
            disabled={modalLoading}
          >
            {modalLoading ? <Loading color="white" size="sm" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xóa tất cả ghế ngồi */}
      <Modal
        closeButton
        aria-labelledby="delete-all-seats-modal"
        open={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
      >
        <Modal.Header>
          <Text id="delete-all-seats-modal" size={18}>
            Xác nhận xóa tất cả
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Bạn có chắc chắn muốn xóa tất cả ghế ngồi của suất chiếu này? Hành
            động này không thể hoàn tác.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            auto
            flat
            color="error"
            onClick={() => setShowDeleteAllModal(false)}
          >
            Hủy
          </Button>
          <Button
            auto
            color="error"
            onClick={handleDeleteAllSeats}
            disabled={modalLoading}
          >
            {modalLoading ? <Loading color="white" size="sm" /> : "Xóa tất cả"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default SeatManagementPage;
