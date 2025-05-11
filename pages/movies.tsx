import React, { useEffect, useState } from "react";
import { Card, Grid, Text, Button, Row, Loading } from "@nextui-org/react";
import { Box } from "../components/styles/box";
import { Flex } from "../components/styles/flex";
import movieService, { Movie } from "../services/movieService";
import { useAuth } from "../contexts/AuthContext";

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovies();
        console.log("Fetched movies:", data);
        setMovies(data.movies || []);
        console.log("Movies set:", movies);
        setError("");
      } catch (err) {
        setError("Không thể tải danh sách phim. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
          onClick={() => window.location.reload()}
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
          <Text h2>Danh sách phim</Text>
          {isAdmin && (
            <Button as="a" href="/movies/create" auto color="primary">
              Thêm phim mới
            </Button>
          )}
        </Flex>

        <Grid.Container gap={2}>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <Grid xs={12} sm={6} md={4} key={movie.id_phim}>
                <Card>
                  <Card.Body css={{ padding: 0 }}>
                    <Card.Image
                      src={
                        `${
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:3001"
                        }${movie.hinh_anh}` ||
                        "https://via.placeholder.com/300x450"
                      }
                      objectFit="cover"
                      width="100%"
                      height={300}
                      alt={movie.ten_phim}
                    />
                  </Card.Body>
                  <Card.Footer css={{ justifyItems: "flex-start" }}>
                    <Row wrap="wrap" justify="space-between" align="center">
                      <Text b>{movie.ten_phim}</Text>
                      <Button
                        as="a"
                        href={`/movies/${movie.id_phim}`}
                        auto
                        flat
                        color="primary"
                        size="sm"
                      >
                        Chi tiết
                      </Button>
                    </Row>
                  </Card.Footer>
                </Card>
              </Grid>
            ))
          ) : (
            <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
              <Text>Không có phim nào.</Text>
            </Box>
          )}
        </Grid.Container>
      </Flex>
    </Box>
  );
};

export default Movies;
