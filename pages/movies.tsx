import React, { useEffect, useState } from "react";
import { Text, Button, Loading } from "@nextui-org/react";
import { Box } from "../components/styles/box";
import { Flex } from "../components/styles/flex";
import movieService, { Movie } from "../services/movieService";
import { useAuth } from "../contexts/AuthContext";
import { MovieTable } from "../components/table/movie-table";

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

        {movies.length > 0 ? (
          <MovieTable movies={movies} />
        ) : (
          <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
            <Text>Không có phim nào.</Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default Movies;
