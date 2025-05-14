import api from './api';

export interface Order {
  id_don_ve: number;
  id_khach_hang: number;
  id_suat_chieu: number;
  thoi_gian_giao_dich: string;
  hinh_thuc_giao_dich: string;
  tong_tien: number;
  trang_thai: number;
  id_khuyen_mai?: number;
  ten_phim?: string;
  ten_rap?: string;
  ten_phong?: string;
  ngay_chieu?: string;
  gio_chieu?: string;
  ho_ten_khach_hang?: string;
}

export interface Seat {
  id_ghe_ngoi: number;
  id_suat_chieu: number;
  ten_ghe: string;
  trang_thai: number;
  gia_ve?: number;
}

export interface CreateOrderRequest {
  id_khach_hang: number;
  id_suat_chieu: number;
  thoi_gian_giao_dich: string;
  hinh_thuc_giao_dich: string;
  tong_tien: number;
  trang_thai: number;
  danh_sach_ghe: number[];
}

export interface OrderStatus {
  id_don_ve: number;
  trang_thai: number;
}

const orderService = {
  // Lấy tất cả đơn vé
  getAllOrders: async () => {
    const response = await api.get('/donve');
    return response.data;
  },
  
  // Lấy đơn vé theo ID
  getOrderById: async (id: number) => {
    const response = await api.get(`/donve/${id}`);
    return response.data;
  },
  
  // Lấy đơn vé theo suất chiếu
  getOrdersByShowtime: async (showtimeId: number) => {
    const response = await api.get(`/donve/suat/${showtimeId}`);
    return response.data;
  },
  
  // Lấy đơn vé theo người dùng
  getOrdersByUser: async (userId: number) => {
    const response = await api.get(`/donve/user/${userId}`);
    return response.data;
  },
  
  // Tạo đơn vé mới
  createOrder: async (orderData: CreateOrderRequest) => {
    const response = await api.post('/donve', orderData);
    return response.data;
  },
  
  // Cập nhật trạng thái đơn vé
  updateOrderStatus: async (statusData: OrderStatus) => {
    const response = await api.put('/donve/status', statusData);
    return response.data;
  },
  
  // Xóa đơn vé
  deleteOrder: async (orderId: number) => {
    const response = await api.delete('/donve', { 
      data: { id_don_ve: orderId } 
    });
    return response.data;
  }
};

export default orderService;
