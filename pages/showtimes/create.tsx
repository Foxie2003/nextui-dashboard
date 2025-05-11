import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Input,
  Dropdown,
  Loading,
  Spacer,
  FormElement,
} from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import movieService, { Movie } from "../../services/movieService";
import theaterService, { Theater } from "../../services/theaterService";
import roomService, { Room } from "../../services/roomService";
import showtimeService from "../../services/showtimeService";
import { useAuth } from "../../contexts/AuthContext";

const CreateShowtime = () => {
  const router = useRouter();
  const { movieId } = router.query;
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedTheater, setSelectedTheater] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [formData, setFormData] = useState({
    ngay_chieu: "",
    gio_bat_dau: "",
    gio_ket_thuc: "",
    gia_ve: "",
  });
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

  // Lấy danh sách phim và rạp
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách phim
        const moviesData = await movieService.getMovies();
        setMovies(moviesData.movies || []);

        // Lấy danh sách rạp
        const theatersData = await theaterService.getTheaters();
        setTheaters(Array.isArray(theatersData) ? theatersData : []);

        // Nếu có movieId từ query, đặt phim đã chọn
        if (movieId) {
          setSelectedMovie(movieId.toString());
        }
      } catch (err) {
        console.error("Không thể tải dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  // Lấy danh sách phòng chiếu khi chọn rạp
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedTheater) {
        setRooms([]);
        setSelectedRoom("");
        return;
      }

      try {
        setLoading(true);
        const roomsData = await roomService.getRoomsByTheater(
          parseInt(selectedTheater)
        );
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setSelectedRoom("");
      } catch (err) {
        console.error("Không thể tải danh sách phòng chiếu:", err);
        setError("Không thể tải danh sách phòng chiếu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedTheater]);

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<FormElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý chọn phim
  const handleMovieSelect = (movieId: string) => {
    setSelectedMovie(movieId);
  };

  // Xử lý chọn rạp
  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheater(theaterId);
  };

  // Xử lý chọn phòng chiếu
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);

    if (!selectedMovie) {
      setError("Vui lòng chọn phim");
      return;
    }

    if (!selectedTheater) {
      setError("Vui lòng chọn rạp");
      return;
    }

    if (!selectedRoom) {
      setError("Vui lòng chọn phòng chiếu");
      return;
    }

    if (!formData.ngay_chieu) {
      setError("Vui lòng chọn ngày chiếu");
      return;
    }

    if (!formData.gio_bat_dau) {
      setError("Vui lòng nhập giờ bắt đầu");
      return;
    }

    if (!formData.gia_ve) {
      setError("Vui lòng nhập giá vé");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Tạo đối tượng lịch chiếu
      const showtime = {
        id_phim: parseInt(selectedMovie),
        id_phong_chieu: parseInt(selectedRoom),
        thoi_gian: `${formData.ngay_chieu}T${formData.gio_bat_dau}:00`,
        gia_ve: parseInt(formData.gia_ve),
      };

      console.log("Sending showtime data:", showtime);

      // Gọi API tạo lịch chiếu
      await showtimeService.createShowtime(showtime);

      // Chuyển hướng đến trang chi tiết phim
      router.push(`/movies/${selectedMovie}`);
    } catch (err: any) {
      setError(
        err.message || "Không thể tạo lịch chiếu. Vui lòng thử lại sau."
      );
      console.error("Error creating showtime:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          <Text h2>Thêm lịch chiếu mới</Text>
          <Button
            as="a"
            href={selectedMovie ? `/movies/${selectedMovie}` : "/movies"}
            auto
            flat
          >
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Grid.Container gap={2}>
                <Grid xs={12}>
                  <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                    <Dropdown>
                      <Dropdown.Button
                        flat
                        css={{ width: "100%", justifyContent: "space-between" }}
                      >
                        {selectedMovie
                          ? movies.find(
                              (m) => m.id_phim.toString() === selectedMovie
                            )?.ten_phim
                          : "Chọn phim"}
                      </Dropdown.Button>
                      <Dropdown.Menu
                        aria-label="Chọn phim"
                        selectionMode="single"
                        selectedKeys={new Set([selectedMovie])}
                        onSelectionChange={(keys) => {
                          const selected = keys as Set<string>;
                          if (selected.size > 0) {
                            handleMovieSelect(Array.from(selected)[0]);
                          }
                        }}
                      >
                        {movies.map((movie) => (
                          <Dropdown.Item
                            key={movie.id_phim.toString()}
                            textValue={movie.ten_phim}
                          >
                            {movie.ten_phim}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown>
                      <Dropdown.Button
                        flat
                        css={{ width: "100%", justifyContent: "space-between" }}
                      >
                        {selectedTheater
                          ? theaters.find(
                              (t) =>
                                t.id_rap_phim.toString() === selectedTheater
                            )?.ten_rap
                          : "Chọn rạp"}
                      </Dropdown.Button>
                      <Dropdown.Menu
                        aria-label="Chọn rạp"
                        selectionMode="single"
                        selectedKeys={new Set([selectedTheater])}
                        onSelectionChange={(keys) => {
                          const selected = keys as Set<string>;
                          if (selected.size > 0) {
                            handleTheaterSelect(Array.from(selected)[0]);
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

                    <Dropdown>
                      <Dropdown.Button
                        flat
                        css={{ width: "100%", justifyContent: "space-between" }}
                        disabled={!selectedTheater}
                      >
                        {selectedRoom
                          ? rooms.find(
                              (r) =>
                                r.id_phong_chieu.toString() === selectedRoom
                            )?.ten_phong_chieu
                          : "Chọn phòng chiếu"}
                      </Dropdown.Button>
                      <Dropdown.Menu
                        aria-label="Chọn phòng chiếu"
                        selectionMode="single"
                        selectedKeys={new Set([selectedRoom])}
                        onSelectionChange={(keys) => {
                          const selected = keys as Set<string>;
                          if (selected.size > 0) {
                            handleRoomSelect(Array.from(selected)[0]);
                          }
                        }}
                        disabledKeys={rooms.length === 0 ? ["no-rooms"] : []}
                      >
                        {rooms.length > 0 ? (
                          rooms.map((room) => (
                            <Dropdown.Item
                              key={room.id_phong_chieu.toString()}
                              textValue={room.ten_phong_chieu}
                            >
                              {room.ten_phong_chieu}
                            </Dropdown.Item>
                          ))
                        ) : (
                          <Dropdown.Item
                            key="no-rooms"
                            textValue="Không có phòng chiếu"
                          >
                            Không có phòng chiếu
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>

                    <Input
                      label="Ngày chiếu"
                      name="ngay_chieu"
                      type="date"
                      value={formData.ngay_chieu}
                      onChange={handleInputChange}
                      fullWidth
                      bordered
                      required
                    />

                    <Grid.Container gap={2}>
                      <Grid xs={12} sm={6}>
                        <Input
                          label="Giờ bắt đầu"
                          name="gio_bat_dau"
                          type="time"
                          value={formData.gio_bat_dau}
                          onChange={handleInputChange}
                          fullWidth
                          bordered
                          required
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Input
                          label="Giờ kết thúc"
                          name="gio_ket_thuc"
                          type="time"
                          value={formData.gio_ket_thuc}
                          onChange={handleInputChange}
                          fullWidth
                          bordered
                        />
                      </Grid>
                    </Grid.Container>

                    <Input
                      label="Giá vé (VNĐ)"
                      name="gia_ve"
                      type="number"
                      value={formData.gia_ve}
                      onChange={handleInputChange}
                      fullWidth
                      bordered
                      required
                    />
                  </Flex>
                </Grid>

                {error && (
                  <Grid xs={12}>
                    <Text color="error">{error}</Text>
                  </Grid>
                )}

                <Grid xs={12}>
                  <Flex justify="end" css={{ mt: "$8" }}>
                    <Button
                      type="submit"
                      color="primary"
                      auto
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loading color="currentColor" size="sm" />
                      ) : (
                        "Tạo lịch chiếu"
                      )}
                    </Button>
                  </Flex>
                </Grid>
              </Grid.Container>
            </form>
          </Card.Body>
        </Card>
      </Flex>
    </Box>
  );
};

export default CreateShowtime;
