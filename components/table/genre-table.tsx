import { Table, Button, Tooltip } from "@nextui-org/react";
import React from "react";
import { Box } from "../styles/box";
import { DeleteIcon } from "../icons/table/delete-icon";
import { EditIcon } from "../icons/table/edit-icon";
import { EyeIcon } from "../icons/table/eye-icon";
import { IconButton } from "./table.styled";
import { Genre } from "../../services/genreService";
import { useRouter } from "next/router";

interface GenreTableProps {
  genres: Genre[];
  onDelete?: (id: number) => void;
}

export const GenreTable = ({ genres, onDelete }: GenreTableProps) => {
  const router = useRouter();

  const columns = [
    { name: "TÊN THỂ LOẠI", uid: "ten_the_loai" },
    { name: "MÔ TẢ", uid: "mo_ta" },
    { name: "THAO TÁC", uid: "actions" },
  ];

  const renderCell = (genre: Genre, columnKey: React.Key) => {
    switch (columnKey) {
      case "ten_the_loai":
        return (
          <div
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {genre.ten_the_loai}
          </div>
        );
      case "mo_ta":
        return (
          <div
            style={{
              maxWidth: "400px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {genre.mo_ta || "Chưa có mô tả"}
          </div>
        );
      case "actions":
        return (
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "center" }}
          >
            <Tooltip content="Chi tiết">
              <IconButton
                onClick={() => router.push(`/genres/${genre.id_the_loai}`)}
              >
                <EyeIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Chỉnh sửa">
              <IconButton
                onClick={() => router.push(`/genres/edit/${genre.id_the_loai}`)}
              >
                <EditIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Xóa" color="error">
              <IconButton onClick={() => onDelete && onDelete(genre.id_the_loai)}>
                <DeleteIcon size={20} fill="#FF0080" />
              </IconButton>
            </Tooltip>
          </div>
        );
      default:
        return genre[columnKey as keyof Genre];
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
        aria-label="Danh sách thể loại"
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
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={genres}>
          {(item) => (
            <Table.Row key={item.id_the_loai}>
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
