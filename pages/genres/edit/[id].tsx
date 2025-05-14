import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Grid,
  Text,
  Button,
  Input,
  Textarea,
  Loading,
} from "@nextui-org/react";
import { Box } from "../../../components/styles/box";
import { Flex } from "../../../components/styles/flex";
import genreService, { Genre } from "../../../services/genreService";
import { useAuth } from "../../../contexts/AuthContext";

const EditGenre = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<Genre>({
    id_the_loai: 0,
    ten_the_loai: "",
    mo_ta: "",
  });
  const [error, setError] = useState("");

  // Kiểm tra quyền admin
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
          router.push("/genres");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/genres");
      }
    } else {
      console.log("No user data in localStorage");
      router.push("/genres");
    }
  }, [router]);

  // Lấy thông tin thể loại
  useEffect(() => {
    const fetchGenre = async () => {
      if (!id) return;
      
      try {
        setFetchLoading(true);
        const data = await genreService.getGenreById(Number(id));
        if (data && data[0]) {
          setFormData(data[0]);
        } else {
          setError("Không tìm thấy thể loại");
          router.push("/genres");
        }
      } catch (err) {
        console.error("Không thể tải thông tin thể loại:", err);
        setError("Không thể tải thông tin thể loại. Vui lòng thử lại sau.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchGenre();
    }
  }, [id, router]);

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

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ten_the_loai) {
      setError("Vui lòng nhập tên thể loại");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Gọi API cập nhật thể loại
      await genreService.updateGenre(formData);

      // Chuyển hướng đến trang danh sách thể loại
      router.push("/genres");
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật thể loại. Vui lòng thử lại sau.");
      console.error("Error updating genre:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
          <Text h2>Chỉnh sửa thể loại</Text>
          <Button as="a" href="/genres" auto flat>
            Quay lại
          </Button>
        </Flex>

        <Card>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Grid.Container gap={2}>
                <Grid xs={12}>
                  <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                    <Input
                      label="Tên thể loại"
                      name="ten_the_loai"
                      value={formData.ten_the_loai}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      clearable
                      bordered
                    />

                    <Textarea
                      label="Mô tả"
                      name="mo_ta"
                      value={formData.mo_ta || ""}
                      onChange={handleInputChange}
                      fullWidth
                      bordered
                      rows={5}
                      placeholder="Mô tả về thể loại phim"
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
                        "Cập nhật"
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

export default EditGenre;
