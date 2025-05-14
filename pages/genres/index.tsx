import React, { useEffect, useState } from "react";
import { Text, Button, Loading, Modal } from "@nextui-org/react";
import { Box } from "../../components/styles/box";
import { Flex } from "../../components/styles/flex";
import genreService, { Genre } from "../../services/genreService";
import { useAuth } from "../../contexts/AuthContext";
import { GenreTable } from "../../components/table/genre-table";
import { useRouter } from "next/router";

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [genreToDelete, setGenreToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const data = await genreService.getGenres();
      setGenres(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Không thể tải danh sách thể loại. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setGenreToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!genreToDelete) return;
    
    try {
      setDeleteLoading(true);
      await genreService.deleteGenre(genreToDelete);
      setGenres(genres.filter(genre => genre.id_the_loai !== genreToDelete));
      setShowDeleteModal(false);
      setGenreToDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa thể loại:", err);
      setError("Không thể xóa thể loại. Vui lòng thử lại sau.");
    } finally {
      setDeleteLoading(false);
    }
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
          onClick={() => fetchGenres()}
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
          <Text h2>Danh sách thể loại</Text>
          {isAdmin && (
            <Button as="a" href="/genres/create" auto color="primary">
              Thêm thể loại mới
            </Button>
          )}
        </Flex>

        {genres.length > 0 ? (
          <GenreTable genres={genres} onDelete={handleDelete} />
        ) : (
          <Box css={{ width: "100%", textAlign: "center", p: "$10" }}>
            <Text>Không có thể loại nào.</Text>
          </Box>
        )}
      </Flex>

      {/* Delete Confirmation Modal */}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Xác nhận xóa
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Bạn có chắc chắn muốn xóa thể loại này? Hành động này không thể hoàn tác.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button auto color="error" onClick={confirmDelete} disabled={deleteLoading}>
            {deleteLoading ? <Loading color="white" size="sm" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default Genres;
