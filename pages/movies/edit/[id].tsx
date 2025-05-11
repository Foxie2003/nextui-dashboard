import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Input,
  Textarea,
  Dropdown,
  Loading,
  Spacer,
} from "@nextui-org/react";
import { Box } from "../../../components/styles/box";
import { Flex } from "../../../components/styles/flex";
import movieService, { Movie } from "../../../services/movieService";
import genreService, { Genre } from "../../../services/genreService";
import { useAuth } from "../../../contexts/AuthContext";

const EditMovie = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    ten_phim: "",
    mo_ta: "",
    thoi_luong: "",
    do_tuoi: "",
    ngon_ngu: "",
    trailer: "",
    ngay_khoi_chieu: "",
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

  // Lấy thông tin phim và danh sách thể loại
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Lấy thông tin phim
        const movieData = await movieService.getMovieById(Number(id));
        const movie = movieData.movie as Movie;

        // Cập nhật form data
        setFormData({
          ten_phim: movie.ten_phim || "",
          mo_ta: movie.mo_ta || "",
          thoi_luong: movie.thoi_luong ? movie.thoi_luong.toString() : "",
          do_tuoi: movie.do_tuoi || "",
          ngon_ngu: movie.ngon_ngu || "",
          trailer: movie.trailer || "",
          ngay_khoi_chieu: movie.ngay_khoi_chieu
            ? movie.ngay_khoi_chieu.split("T")[0]
            : "",
        });

        // Cập nhật thể loại đã chọn
        if (movie.id_the_loai) {
          setSelectedGenre(movie.id_the_loai.toString());
        }

        // Cập nhật preview hình ảnh
        if (movie.hinh_anh) {
          setImagePreview(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${
              movie.hinh_anh
            }`
          );
        }

        // Lấy danh sách thể loại
        const genresData = await genreService.getGenres();
        setGenres(Array.isArray(genresData) ? genresData : []);
      } catch (err) {
        console.error("Không thể tải dữ liệu:", err);
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Xử lý chọn thể loại
  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Tạo URL xem trước ảnh
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ten_phim) {
      setError("Vui lòng nhập tên phim");
      return;
    }

    if (!selectedGenre) {
      setError("Vui lòng chọn thể loại phim");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Tạo FormData để gửi lên server
      const movieFormData = new FormData();
      movieFormData.append("ten_phim", formData.ten_phim);
      movieFormData.append("mo_ta", formData.mo_ta || "");
      movieFormData.append("id_the_loai", selectedGenre);
      movieFormData.append("do_tuoi", formData.do_tuoi);
      movieFormData.append("ngon_ngu", formData.ngon_ngu);

      if (formData.thoi_luong) {
        movieFormData.append("thoi_luong", formData.thoi_luong);
      }

      if (formData.ngay_khoi_chieu) {
        movieFormData.append("ngay_khoi_chieu", formData.ngay_khoi_chieu);
      }

      if (formData.trailer) {
        movieFormData.append("trailer", formData.trailer);
      }

      if (imageFile) {
        movieFormData.append("hinh_anh", imageFile);
      }

      // Gọi API cập nhật phim
      await movieService.updateMovie(Number(id), movieFormData);

      // Chuyển hướng đến trang chi tiết phim
      router.push(`/movies/${id}`);
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật phim. Vui lòng thử lại sau.");
      console.error("Error updating movie:", err);
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
          <Text h2>Chỉnh sửa phim</Text>
          <Button as="a" href={`/movies/${id}`} auto flat>
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Grid.Container gap={2}>
                <Grid xs={12} md={8}>
                  <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                    <Input
                      label="Tên phim"
                      name="ten_phim"
                      value={formData.ten_phim}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      clearable
                      bordered
                    />

                    <Textarea
                      label="Mô tả"
                      name="mo_ta"
                      value={formData.mo_ta}
                      onChange={handleInputChange}
                      fullWidth
                      bordered
                      rows={5}
                    />

                    <Dropdown>
                      <Dropdown.Button flat>
                        {selectedGenre
                          ? genres.find(
                              (g) => g.id_the_loai.toString() === selectedGenre
                            )?.ten_the_loai
                          : "Chọn thể loại"}
                      </Dropdown.Button>
                      <Dropdown.Menu
                        aria-label="Thể loại phim"
                        selectionMode="single"
                        selectedKeys={[selectedGenre]}
                        onSelectionChange={(keys) =>
                          handleGenreSelect(Array.from(keys)[0] as string)
                        }
                      >
                        {genres.map((genre) => (
                          <Dropdown.Item key={genre.id_the_loai.toString()}>
                            {genre.ten_the_loai}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    <Grid.Container gap={2}>
                      <Grid xs={12} sm={6}>
                        <Input
                          label="Thời lượng (phút)"
                          name="thoi_luong"
                          type="number"
                          value={formData.thoi_luong}
                          onChange={handleInputChange}
                          fullWidth
                          bordered
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Input
                          label="Ngày khởi chiếu"
                          name="ngay_khoi_chieu"
                          type="date"
                          value={formData.ngay_khoi_chieu}
                          onChange={handleInputChange}
                          fullWidth
                          bordered
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Input
                          label="Độ tuổi"
                          name="do_tuoi"
                          value={formData.do_tuoi}
                          onChange={handleInputChange}
                          fullWidth
                          bordered
                          placeholder="VD: 13+, 16+, 18+"
                          required
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Input
                          label="Ngôn ngữ"
                          name="ngon_ngu"
                          value={formData.ngon_ngu}
                          onChange={handleInputChange}
                          fullWidth
                          bordered
                          required
                        />
                      </Grid>
                    </Grid.Container>

                    <Input
                      label="Trailer URL"
                      name="trailer"
                      value={formData.trailer}
                      onChange={handleInputChange}
                      fullWidth
                      bordered
                    />
                  </Flex>
                </Grid>

                <Grid xs={12} md={4}>
                  <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                    <Text>Hình ảnh phim</Text>
                    <Card variant="bordered">
                      <Card.Body css={{ overflow: "hidden", padding: 0 }}>
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: "100%",
                              height: "300px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            css={{
                              height: "300px",
                              bg: "$gray100",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text color="$gray600">Chưa có ảnh</Text>
                          </Box>
                        )}
                      </Card.Body>
                    </Card>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ width: "100%" }}
                    />
                    <Text size="sm" color="$gray600">
                      Chỉ tải lên ảnh mới nếu muốn thay đổi ảnh hiện tại
                    </Text>
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
                        "Cập nhật phim"
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

export default EditMovie;
