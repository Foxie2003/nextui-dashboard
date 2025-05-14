import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, Grid, Text, Button, Loading, Divider } from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import genreService, { Genre } from "../../services/genreService";
import { useAuth } from "../../contexts/AuthContext";

const GenreDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAdmin } = useAuth();
  const [genre, setGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGenre = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await genreService.getGenreById(Number(id));
        if (data && data[0]) {
          setGenre(data[0]);
        } else {
          setError("Không tìm thấy thể loại");
        }
      } catch (err) {
        console.error("Không thể tải thông tin thể loại:", err);
        setError("Không thể tải thông tin thể loại. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGenre();
    }
  }, [id]);

  if (loading) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Loading size="xl" />
      </Box>
    );
  }

  if (error || !genre) {
    return (
      <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
        <Text color="error">{error || "Không tìm thấy thể loại"}</Text>
        <Button
          auto
          color="primary"
          css={{ mt: "$5" }}
          onClick={() => router.push("/genres")}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box css={{ px: "$12", mt: "$8", "@xsMax": { px: "$10" } }}>
      <Flex direction="column" css={{ gap: "$6" }}>
        <Flex justify="between" align="center">
          <Text h2>Chi tiết thể loại</Text>
          <Flex css={{ gap: "$4" }}>
            <Button as="a" href="/genres" auto flat>
              Quay lại
            </Button>
            {isAdmin && (
              <Button
                as="a"
                href={`/genres/edit/${genre.id_the_loai}`}
                auto
                color="primary"
              >
                Chỉnh sửa
              </Button>
            )}
          </Flex>
        </Flex>

        <Card>
          <Card.Body>
            <Grid.Container gap={2}>
              <Grid xs={12}>
                <Flex direction="column" css={{ gap: "$6", width: "100%" }}>
                  <Box>
                    <Text h3 css={{ mb: "$2" }}>
                      {genre.ten_the_loai}
                    </Text>
                    <Divider css={{ my: "$5" }} />
                    <Text h4 css={{ mb: "$2" }}>
                      Mô tả
                    </Text>
                    <Text css={{ whiteSpace: "pre-wrap" }}>
                      {genre.mo_ta || "Không có mô tả"}
                    </Text>
                  </Box>
                </Flex>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>
      </Flex>
    </Box>
  );
};

export default GenreDetail;
