import api from './api';

export interface Seat {
  id_ghe_ngoi: number;
  id_suat_chieu: number;
  ten_ghe: string;
  trang_thai: number; // 0: Trống, 1: Đã đặt
  gia_ve?: number;
  hang?: string;
  cot?: number;
}

const seatService = {
  // Lấy tất cả ghế của một suất chiếu
  getSeatsByShowtime: async (showtimeId: number) => {
    const response = await api.get(`/ghengoi/suat/${showtimeId}`);
    return response.data;
  },
  
  // Lấy ghế theo ID
  getSeatById: async (id: number) => {
    const response = await api.get(`/ghengoi/${id}`);
    return response.data;
  },
  
  // Cập nhật trạng thái ghế
  updateSeatStatus: async (seatId: number, status: number) => {
    const response = await api.put(`/ghengoi/status`, {
      id_ghe_ngoi: seatId,
      trang_thai: status
    });
    return response.data;
  }
};

export default seatService;
