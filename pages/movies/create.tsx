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
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import movieService from "../../services/movieService";
import genreService, { Genre } from "../../services/genreService";
import { useAuth } from "../../contexts/AuthContext";

const CreateMovie = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  // Debug
  useEffect(() => {
    console.log("CreateMovie - Auth state:", {
      isAuthenticated,
      isAdmin,
      user,
    });
    console.log("LocalStorage token:", localStorage.getItem("token"));
    console.log("LocalStorage user:", localStorage.getItem("user"));
  }, [isAuthenticated, isAdmin, user]);

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

  // Lấy danh sách thể loại
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await genreService.getGenres();
        setGenres(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Không thể tải thể loại:", err);
      }
    };

    fetchGenres();
  }, []);

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
      setLoading(true);
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
      // Gọi API tạo phim mới
      const result = await movieService.createMovie(movieFormData);
      console.log("API response:", result);

      // Chuyển hướng đến trang chi tiết phim
      router.push(`/movies/${(result as any).id_phim}`);
    } catch (err: any) {
      setError(err.message || "Không thể tạo phim mới. Vui lòng thử lại sau.");
      console.error("Error creating movie:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>Thêm phim mới</Text>
          <Button as="a" href="/movies" auto flat>
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
                      placeholder="https://www.youtube.com/watch?v=..."
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
                      disabled={loading}
                    >
                      {loading ? (
                        <Loading color="currentColor" size="sm" />
                      ) : (
                        "Tạo phim"
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

export default CreateMovie;
