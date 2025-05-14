import api from './api';

export interface Seat {
  id_ghe_ngoi: number;
  id_suat_chieu: number;
  ten_ghe: string;
  trang_thai: number; // 0: Trống, 1: Đã đặt, 2: Đang chọn
  thoi_gian?: string;
  ten_phim?: string;
  ten_phong_chieu?: string;
  hang?: string; // Hàng (A, B, C, ...)
  cot?: number; // Cột (1, 2, 3, ...)
}

export interface CreateSeatRequest {
  id_suat_chieu: number;
  ten_ghe: string;
  trang_thai?: number;
}

export interface CreateMultipleSeatsRequest {
  id_suat_chieu: number;
  danh_sach_ghe: {
    ten_ghe: string;
    trang_thai?: number;
  }[];
}

export interface UpdateSeatRequest {
  id_ghe_ngoi: number;
  trang_thai: number;
}

export interface DeleteSeatRequest {
  id_ghe_ngoi: number;
}

export interface DeleteAllSeatsBySuatChieuRequest {
  id_suat_chieu: number;
}

const seatManagementService = {
  // Lấy tất cả ghế ngồi
  getAllSeats: async () => {
    const response = await api.get('/ghengoi');
    return response.data;
  },

  // Lấy ghế ngồi theo ID
  getSeatById: async (id: number) => {
    const response = await api.get(`/ghengoi/${id}`);
    return response.data;
  },

  // Lấy ghế ngồi theo suất chiếu
  getSeatsBySuatChieu: async (suatChieuId: number) => {
    try {
      // Kiểm tra ID suất chiếu hợp lệ
      if (isNaN(suatChieuId) || suatChieuId <= 0) {
        console.error("Invalid showtime ID:", suatChieuId);
        throw new Error("ID suất chiếu không hợp lệ");
      }

      const response = await api.get(`/ghengoi/suat/${suatChieuId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching seats by showtime:", error);
      throw error;
    }
  },

  // Tạo ghế ngồi mới
  createSeat: async (seatData: CreateSeatRequest) => {
    const response = await api.post('/ghengoi', seatData);
    return response.data;
  },

  // Tạo nhiều ghế ngồi cùng lúc
  createMultipleSeats: async (seatsData: CreateMultipleSeatsRequest) => {
    const response = await api.post('/ghengoi/multiple', seatsData);
    return response.data;
  },

  // Cập nhật trạng thái ghế ngồi
  updateSeat: async (seatData: UpdateSeatRequest) => {
    const response = await api.put('/ghengoi', seatData);
    return response.data;
  },

  // Xóa ghế ngồi
  deleteSeat: async (seatData: DeleteSeatRequest) => {
    const response = await api.delete('/ghengoi', {
      data: seatData
    });
    return response.data;
  },

  // Xóa tất cả ghế ngồi của một suất chiếu
  deleteAllSeatsBySuatChieu: async (data: DeleteAllSeatsBySuatChieuRequest) => {
    const response = await api.delete('/ghengoi/suat', {
      data: data
    });
    return response.data;
  },

  // Tạo ghế ngồi tự động theo mẫu (hàng x cột)
  generateSeatsTemplate: (rows: string[], cols: number[], suatChieuId: number) => {
    const seats: CreateMultipleSeatsRequest = {
      id_suat_chieu: suatChieuId,
      danh_sach_ghe: []
    };

    rows.forEach(row => {
      cols.forEach(col => {
        seats.danh_sach_ghe.push({
          ten_ghe: `${row}${col}`,
          trang_thai: 0
        });
      });
    });

    return seats;
  }
};

export default seatManagementService;
