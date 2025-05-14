import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Input,
  Dropdown,
  Spacer,
} from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import { useAuth } from "../../contexts/AuthContext";
import movieService, { Movie } from "../../services/movieService";
import theaterService, { Theater } from "../../services/theaterService";
import showtimeService, { Showtime } from "../../services/showtimeService";
import { SearchIcon } from "../../components/icons/searchicon";

const ShowtimesPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<Showtime[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedTheater, setSelectedTheater] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

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
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch movies
      const moviesData = await movieService.getMovies();
      setMovies(moviesData.movies || []);

      // Fetch theaters
      const theatersData = await theaterService.getTheaters();
      setTheaters(Array.isArray(theatersData) ? theatersData : []);

      // Fetch all showtimes
      const showtimesData = await showtimeService.getShowtimes();
      const allShowtimes = Array.isArray(showtimesData) ? showtimesData : [];
      setShowtimes(allShowtimes);

      // Apply initial filtering (today's showtimes)
      filterShowtimes(allShowtimes, "", "", searchDate);

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const filterShowtimes = (
    allShowtimes: Showtime[],
    movieId: string,
    theaterId: string,
    date: string
  ) => {
    let filtered = [...allShowtimes];

    // Filter by movie
    if (movieId) {
      filtered = filtered.filter(
        (showtime) => showtime.id_phim.toString() === movieId
      );
    }

    // Filter by theater
    if (theaterId) {
      filtered = filtered.filter((showtime) => {
        // This assumes the showtime object has theater information
        // You might need to adjust this based on your actual data structure
        const showtimeTheaterId =
          showtime.id_rap_phim ||
          (showtime.ten_rap &&
            theaters.find((t) => t.ten_rap === showtime.ten_rap)?.id_rap_phim);
        return showtimeTheaterId?.toString() === theaterId;
      });
    }

    // Filter by date
    if (date) {
      const searchDateStr = date.split("T")[0];
      filtered = filtered.filter((showtime) => {
        const showtimeDate = new Date(showtime.thoi_gian)
          .toISOString()
          .split("T")[0];
        return showtimeDate === searchDateStr;
      });
    }

    setFilteredShowtimes(filtered);
  };

  const handleMovieSelect = (movieId: string) => {
    setSelectedMovie(movieId);
    filterShowtimes(showtimes, movieId, selectedTheater, searchDate);
  };

  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheater(theaterId);
    filterShowtimes(showtimes, selectedMovie, theaterId, searchDate);
  };

  const handleDateChange = (date: string) => {
    setSearchDate(date);
    filterShowtimes(showtimes, selectedMovie, selectedTheater, date);
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

  const handleSelectShowtime = (showtimeId: number) => {
    router.push(`/showtimes/${showtimeId}/seats`);
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
          onClick={() => fetchData()}
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
          <Flex direction="column" css={{ gap: "$2" }}>
            <Text h2>Lịch chiếu phim</Text>
            <Text css={{ color: "$accents8" }}>
              Chọn suất chiếu để bán vé tại quầy
            </Text>
          </Flex>
          <Button as="a" href="/tickets" auto flat>
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <Grid.Container gap={2}>
              <Grid xs={12} md={4}>
                <Dropdown>
                  <Dropdown.Button
                    flat
                    css={{ width: "100%", justifyContent: "space-between" }}
                  >
                    {selectedMovie
                      ? movies.find(
                          (m) => m.id_phim.toString() === selectedMovie
                        )?.ten_phim
                      : "Tất cả phim"}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    aria-label="Chọn phim"
                    selectionMode="single"
                    selectedKeys={new Set([selectedMovie])}
                    onSelectionChange={(keys) => {
                      const selected = keys as Set<string>;
                      if (selected.size > 0) {
                        handleMovieSelect(Array.from(selected)[0]);
                      } else {
                        handleMovieSelect("");
                      }
                    }}
                  >
                    <Dropdown.Item key="">Tất cả phim</Dropdown.Item>
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
              </Grid>

              <Grid xs={12} md={4}>
                <Dropdown>
                  <Dropdown.Button
                    flat
                    css={{ width: "100%", justifyContent: "space-between" }}
                  >
                    {selectedTheater
                      ? theaters.find(
                          (t) => t.id_rap_phim.toString() === selectedTheater
                        )?.ten_rap
                      : "Tất cả rạp"}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    aria-label="Chọn rạp"
                    selectionMode="single"
                    selectedKeys={new Set([selectedTheater])}
                    onSelectionChange={(keys) => {
                      const selected = keys as Set<string>;
                      if (selected.size > 0) {
                        handleTheaterSelect(Array.from(selected)[0]);
                      } else {
                        handleTheaterSelect("");
                      }
                    }}
                  >
                    <Dropdown.Item key="">Tất cả rạp</Dropdown.Item>
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
              </Grid>

              <Grid xs={12} md={4}>
                <Input
                  type="date"
                  label="Ngày chiếu"
                  value={searchDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  width="100%"
                />
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>

        <Spacer y={1} />

        <Text h3>Kết quả tìm kiếm</Text>

        <Grid.Container gap={2}>
          {filteredShowtimes.length > 0 ? (
            filteredShowtimes.map((showtime) => (
              <Grid xs={12} sm={6} md={4} key={showtime.id_lich_chieu}>
                <Card variant="bordered">
                  <Card.Body>
                    <Flex direction="column" css={{ gap: "$2" }}>
                      <Text b size="$lg">
                        {showtime.ten_phim || "Không có thông tin"}
                      </Text>
                      <Text b>
                        Rạp: {showtime.ten_rap || "Không có thông tin"}
                      </Text>
                      <Text b>
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
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      auto
                      color="primary"
                      onClick={() =>
                        handleSelectShowtime(showtime.id_lich_chieu!)
                      }
                    >
                      Chọn ghế
                    </Button>
                  </Card.Footer>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid xs={12}>
              <Card variant="flat">
                <Card.Body>
                  <Text css={{ textAlign: "center" }}>
                    Không tìm thấy lịch chiếu nào phù hợp
                  </Text>
                </Card.Body>
              </Card>
            </Grid>
          )}
        </Grid.Container>
      </Flex>
    </Box>
  );
};

export default ShowtimesPage;
