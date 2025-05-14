import { Table, Button, Tooltip, Image } from "@nextui-org/react";
import React from "react";
import { Box } from "../styles/box";
import { DeleteIcon } from "../icons/table/delete-icon";
import { EditIcon } from "../icons/table/edit-icon";
import { EyeIcon } from "../icons/table/eye-icon";
import { IconButton } from "./table.styled";
import { Movie } from "../../services/movieService";
import { useRouter } from "next/router";

interface MovieTableProps {
  movies: Movie[];
  onDelete?: (id: number) => void;
}

export const MovieTable = ({ movies, onDelete }: MovieTableProps) => {
  const router = useRouter();

  const columns = [
    { name: "HÌNH ẢNH", uid: "hinh_anh" },
    { name: "TÊN PHIM", uid: "ten_phim" },
    { name: "THỂ LOẠI", uid: "ten_the_loai" },
    { name: "THỜI LƯỢNG", uid: "thoi_luong" },
    { name: "NGÀY KHỞI CHIẾU", uid: "ngay_khoi_chieu" },
    { name: "THAO TÁC", uid: "actions" },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const renderCell = (movie: Movie, columnKey: React.Key) => {
    switch (columnKey) {
      case "hinh_anh":
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src={
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${
                  movie.hinh_anh
                }` || "https://via.placeholder.com/150x150"
              }
              alt={movie.ten_phim}
              width={60}
              height={90}
              objectFit="cover"
              css={{ borderRadius: "8px" }}
            />
          </div>
        );
      case "ten_phim":
        return (
          <div
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {movie.ten_phim}
          </div>
        );
      case "ten_the_loai":
        return movie.ten_the_loai || "Chưa cập nhật";
      case "thoi_luong":
        return movie.thoi_luong ? `${movie.thoi_luong} phút` : "Chưa cập nhật";
      case "ngay_khoi_chieu":
        return formatDate(movie.ngay_khoi_chieu);
      case "actions":
        return (
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "center" }}
          >
            <Tooltip content="Chi tiết">
              <IconButton
                onClick={() => router.push(`/movies/${movie.id_phim}`)}
              >
                <EyeIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Chỉnh sửa">
              <IconButton
                onClick={() => router.push(`/movies/edit/${movie.id_phim}`)}
              >
                <EditIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Xóa" color="error">
              <IconButton onClick={() => onDelete && onDelete(movie.id_phim)}>
                <DeleteIcon size={20} fill="#FF0080" />
              </IconButton>
            </Tooltip>
          </div>
        );
      default:
        return movie[columnKey as keyof Movie];
    }
  };

  return (
    <Box
      css={{
        "& .nextui-table-container": {
          boxShadow: "none",
        },
      }}
    >
      <Table
        aria-label="Danh sách phim"
        css={{
          height: "auto",
          minWidth: "100%",
          boxShadow: "none",
          width: "100%",
          px: 0,
        }}
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              key={column.uid}
              hideHeader={column.uid === "hinh_anh"}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={movies}>
          {(item) => (
            <Table.Row key={item.id_phim}>
              {(columnKey) => (
                <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
              )}
            </Table.Row>
          )}
        </Table.Body>
        <Table.Pagination shadow noMargin align="center" rowsPerPage={10} />
      </Table>
    </Box>
  );
};
