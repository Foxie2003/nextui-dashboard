import api from './api';

export interface Ticket {
  id_ve: number;
  id_don_ve: number;
  id_ghe_ngoi: number;
  ten_ghe?: string;
  ten_phim?: string;
  ten_rap?: string;
  ten_phong?: string;
  ngay_chieu?: string;
  gio_chieu?: string;
}

export interface CreateTicketRequest {
  id_don_ve: number;
  id_ghe_ngoi: number;
}

const ticketService = {
  // Lấy tất cả vé
  getAllTickets: async () => {
    const response = await api.get('/ve');
    return response.data;
  },

  // Lấy vé theo ID
  getTicketById: async (id: number) => {
    const response = await api.get(`/ve/${id}`);
    return response.data;
  },

  // Lấy vé theo đơn vé
  getTicketsByOrder: async (orderId: number) => {
    const response = await api.get(`/ve/donve/${orderId}`);
    return response.data;
  },

  // Lấy vé theo suất chiếu
  getTicketsByShowtime: async (showtimeId: number) => {
    const response = await api.get(`/ve/suat/${showtimeId}`);
    return response.data;
  },

  // Lấy vé theo người dùng
  getTicketsByUser: async (userId: number) => {
    const response = await api.get(`/ve/user/${userId}`);
    return response.data;
  },

  // Lấy vé của người dùng hiện tại
  getMyTickets: async () => {
    const response = await api.get('/ve/khach-hang');
    return response.data;
  },

  // Tạo vé mới
  createTicket: async (ticketData: CreateTicketRequest) => {
    const response = await api.post('/ve', ticketData);
    return response.data;
  },

  // Cập nhật vé
  updateTicket: async (id: number, ticket: Partial<Ticket>) => {
    const response = await api.put(`/ve/${id}`, ticket);
    return response.data;
  },

  // Hủy vé
  cancelTicket: async (id: number) => {
    const response = await api.put(`/ve/${id}/huy`, {});
    return response.data;
  },

  // Xóa vé
  deleteTicket: async (ticketId: number) => {
    const response = await api.delete('/ve', {
      data: { id_ve: ticketId }
    });
    return response.data;
  }
};

export default ticketService;
