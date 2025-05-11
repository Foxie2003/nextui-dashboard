import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Loading,
  Spacer,
  Avatar,
} from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import movieService, { Movie } from "../../services/movieService";
import showtimeService, { Showtime } from "../../services/showtimeService";
import { useAuth } from "../../contexts/AuthContext";

const MovieDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const movieId = Number(id);

        // Lấy thông tin phim
        const movieData = await movieService.getMovieById(movieId);
        console.log("Movie data:", movieData);
        setMovie(movieData.movie as Movie);

        // Lấy lịch chiếu của phim
        const showtimesData = await showtimeService.getShowtimesByMovie(
          movieId
        );
        setShowtimes(
          Array.isArray(showtimesData)
            ? showtimesData
            : (showtimesData as any).showtimes || []
        );

        setError("");
      } catch (err) {
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Text color="error">{error || "Không tìm thấy phim"}</Text>
        <Button
          auto
          color="primary"
          css={{ mt: "$5" }}
          onClick={() => router.push("/movies")}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Chưa cập nhật";
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>{movie.ten_phim}</Text>
          <Button as="a" href="/movies" auto flat>
            Quay lại
          </Button>
        </Flex>

        <Grid.Container gap={2}>
          <Grid xs={12} sm={4}>
            <Card>
              <Card.Body css={{ padding: "$0" }}>
                <Card.Image
                  src={
                    movie.hinh_anh
                      ? `${
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:3001"
                        }${movie.hinh_anh}`
                      : "https://via.placeholder.com/300x450"
                  }
                  objectFit="cover"
                  width="100%"
                  height="auto"
                  alt={movie.ten_phim}
                />
              </Card.Body>
              {movie.trailer && (
                <Card.Footer>
                  <Button
                    as="a"
                    href={movie.trailer}
                    target="_blank"
                    auto
                    color="gradient"
                    css={{ width: "100%" }}
                  >
                    Xem Trailer
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </Grid>

          <Grid xs={12} sm={8}>
            <Card>
              <Card.Body>
                <Text h4>Thông tin phim</Text>
                <Spacer y={1} />

                <Flex direction="column" css={{ gap: "$2" }}>
                  <Text>
                    <Text b>Thể loại:</Text>{" "}
                    {movie.ten_the_loai || "Chưa cập nhật"}
                  </Text>
                  <Text>
                    <Text b>Thời lượng:</Text>{" "}
                    {movie.thoi_luong
                      ? `${movie.thoi_luong} phút`
                      : "Chưa cập nhật"}
                  </Text>
                  <Text>
                    <Text b>Ngày khởi chiếu:</Text>{" "}
                    {movie.ngay_khoi_chieu
                      ? formatDate(movie.ngay_khoi_chieu)
                      : "Chưa cập nhật"}
                  </Text>
                  <Text>
                    <Text b>Độ tuổi:</Text> {movie.do_tuoi || "Chưa cập nhật"}
                  </Text>
                  <Text>
                    <Text b>Ngôn ngữ:</Text> {movie.ngon_ngu || "Chưa cập nhật"}
                  </Text>
                  <Spacer y={1} />
                  <Text>
                    <Text b>Mô tả:</Text>
                  </Text>
                  <Text>{movie.mo_ta || "Chưa có mô tả"}</Text>
                </Flex>

                <Spacer y={1} />

                {isAdmin && (
                  <Flex justify="end" css={{ gap: "$4" }}>
                    <Button
                      as="a"
                      href={`/movies/edit/${movie.id_phim}`}
                      auto
                      color="primary"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      auto
                      color="error"
                      onClick={async () => {
                        if (confirm("Bạn có chắc chắn muốn xóa phim này?")) {
                          try {
                            await movieService.deleteMovie(movie.id_phim);
                            router.push("/movies");
                          } catch (err: any) {
                            alert(
                              err.message ||
                                "Không thể xóa phim. Vui lòng thử lại sau."
                            );
                          }
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </Flex>
                )}
              </Card.Body>
            </Card>

            {/* Hiển thị đạo diễn */}
            {movie.dao_dien && movie.dao_dien.length > 0 && (
              <Card css={{ mt: "$6" }}>
                <Card.Body>
                  <Text h4>Đạo diễn</Text>
                  <Spacer y={1} />
                  <Grid.Container gap={2}>
                    {movie.dao_dien.map((person) => (
                      <Grid key={person.id_nguoi} xs={6} sm={4}>
                        <Flex direction="column" align="center">
                          <Avatar
                            src={
                              person.hinh_anh
                                ? `${process.env.NEXT_PUBLIC_API_URL}${person.hinh_anh}`
                                : undefined
                            }
                            css={{ size: "$20" }}
                          />
                          <Text css={{ mt: "$2" }}>{person.ho_ten}</Text>
                        </Flex>
                      </Grid>
                    ))}
                  </Grid.Container>
                </Card.Body>
              </Card>
            )}

            {/* Hiển thị diễn viên */}
            {movie.dien_vien && movie.dien_vien.length > 0 && (
              <Card css={{ mt: "$6" }}>
                <Card.Body>
                  <Text h4>Diễn viên</Text>
                  <Spacer y={1} />
                  <Grid.Container gap={2}>
                    {movie.dien_vien.map((person) => (
                      <Grid key={person.id_nguoi} xs={6} sm={3}>
                        <Flex direction="column" align="center">
                          <Avatar
                            src={
                              person.hinh_anh
                                ? `${process.env.NEXT_PUBLIC_API_URL}${person.hinh_anh}`
                                : undefined
                            }
                            css={{ size: "$20" }}
                          />
                          <Text css={{ mt: "$2" }}>{person.ho_ten}</Text>
                        </Flex>
                      </Grid>
                    ))}
                  </Grid.Container>
                </Card.Body>
              </Card>
            )}
          </Grid>
        </Grid.Container>

        <Spacer y={1} />

        <Text h3>Lịch chiếu</Text>

        {isAdmin && (
          <Flex justify="end">
            <Button
              as="a"
              href={`/showtimes/create?movieId=${movie.id_phim}`}
              auto
              color="primary"
            >
              Thêm lịch chiếu
            </Button>
          </Flex>
        )}

        <Grid.Container gap={2}>
          {showtimes.length > 0 ? (
            showtimes.map((showtime) => (
              <Grid xs={12} sm={6} md={4} key={showtime.id_lich_chieu}>
                <Card variant="bordered">
                  <Card.Body>
                    <Flex direction="column" css={{ gap: "$2" }}>
                      <Text b>Rạp: {showtime.ten_rap || "Chưa cập nhật"}</Text>
                      <Text b>
                        Phòng chiếu:{" "}
                        {showtime.ten_phong_chieu || "Chưa cập nhật"}
                      </Text>
                      <Text>
                        Thời gian: {formatDate(showtime.thoi_gian)}{" "}
                        {formatTime(showtime.thoi_gian)}
                      </Text>
                      <Text>
                        Giá vé: {showtime.gia_ve.toLocaleString("vi-VN")} VNĐ
                      </Text>
                    </Flex>
                  </Card.Body>
                  <Card.Footer>
                    <Flex justify="between" css={{ width: "100%" }}>
                      <Button
                        as="a"
                        href={`/showtimes/edit/${showtime.id_lich_chieu}`}
                        auto
                        color="primary"
                        size="sm"
                      >
                        Sửa lịch chiếu
                      </Button>
                      <Button
                        auto
                        color="error"
                        size="sm"
                        onClick={async () => {
                          if (
                            confirm("Bạn có chắc chắn muốn xóa lịch chiếu này?")
                          ) {
                            try {
                              await showtimeService.deleteShowtime(
                                showtime.id_lich_chieu!
                              );
                              // Cập nhật lại danh sách lịch chiếu sau khi xóa
                              const updatedShowtimes = showtimes.filter(
                                (s) =>
                                  s.id_lich_chieu !== showtime.id_lich_chieu
                              );
                              setShowtimes(updatedShowtimes);
                            } catch (err: any) {
                              alert(
                                err.message ||
                                  "Không thể xóa lịch chiếu. Vui lòng thử lại sau."
                              );
                            }
                          }
                        }}
                      >
                        Xóa
                      </Button>
                    </Flex>
                  </Card.Footer>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid xs={12}>
              <Card variant="flat">
                <Card.Body>
                  <Text css={{ textAlign: "center" }}>
                    Chưa có lịch chiếu nào cho phim này
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

export default MovieDetail;
