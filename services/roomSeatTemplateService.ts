import api from './api';

export interface SeatTemplate {
  id_mau_ghe?: number;
  id_phong_chieu: number;
  ten_ghe: string;
  hang?: string; // Hàng (A, B, C, ...)
  cot?: number; // Cột (1, 2, 3, ...)
}

export interface CreateSeatTemplateRequest {
  id_phong_chieu: number;
  ten_ghe: string;
}

export interface CreateMultipleSeatTemplatesRequest {
  id_phong_chieu: number;
  danh_sach_ghe: {
    ten_ghe: string;
  }[];
}

export interface DeleteSeatTemplateRequest {
  id_mau_ghe: number;
}

export interface DeleteAllSeatTemplatesByRoomRequest {
  id_phong_chieu: number;
}

const roomSeatTemplateService = {
  // Lấy tất cả mẫu ghế ngồi
  getAllSeatTemplates: async () => {
    try {
      // Giả lập API call vì chưa có API thực tế
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.get('/maughe');
      // return response.data;
      
      // Giả lập dữ liệu
      return [];
    } catch (error) {
      console.error("Error fetching seat templates:", error);
      throw error;
    }
  },
  
  // Lấy mẫu ghế ngồi theo phòng chiếu
  getSeatTemplatesByRoom: async (roomId: number) => {
    try {
      // Giả lập API call vì chưa có API thực tế
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.get(`/maughe/phong/${roomId}`);
      // return response.data;
      
      // Giả lập dữ liệu
      return [];
    } catch (error) {
      console.error("Error fetching seat templates by room:", error);
      throw error;
    }
  },
  
  // Tạo mẫu ghế ngồi mới
  createSeatTemplate: async (templateData: CreateSeatTemplateRequest) => {
    try {
      // Giả lập API call vì chưa có API thực tế
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.post('/maughe', templateData);
      // return response.data;
      
      // Giả lập dữ liệu
      return { message: "Mẫu ghế ngồi đã được thêm" };
    } catch (error) {
      console.error("Error creating seat template:", error);
      throw error;
    }
  },
  
  // Tạo nhiều mẫu ghế ngồi cùng lúc
  createMultipleSeatTemplates: async (templatesData: CreateMultipleSeatTemplatesRequest) => {
    try {
      // Giả lập API call vì chưa có API thực tế
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.post('/maughe/multiple', templatesData);
      // return response.data;
      
      // Giả lập dữ liệu
      return { message: "Các mẫu ghế ngồi đã được thêm" };
    } catch (error) {
      console.error("Error creating multiple seat templates:", error);
      throw error;
    }
  },
  
  // Xóa mẫu ghế ngồi
  deleteSeatTemplate: async (templateData: DeleteSeatTemplateRequest) => {
    try {
      // Giả lập API call vì chưa có API thực tế
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.delete('/maughe', { data: templateData });
      // return response.data;
      
      // Giả lập dữ liệu
      return { message: "Mẫu ghế ngồi đã được xóa" };
    } catch (error) {
      console.error("Error deleting seat template:", error);
      throw error;
    }
  },
  
  // Xóa tất cả mẫu ghế ngồi của một phòng chiếu
  deleteAllSeatTemplatesByRoom: async (data: DeleteAllSeatTemplatesByRoomRequest) => {
    try {
      // Giả lập API call vì chưa có API thực tế
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.delete('/maughe/phong', { data });
      // return response.data;
      
      // Giả lập dữ liệu
      return { message: "Đã xóa tất cả mẫu ghế ngồi của phòng chiếu này" };
    } catch (error) {
      console.error("Error deleting all seat templates by room:", error);
      throw error;
    }
  },
  
  // Tạo mẫu ghế ngồi tự động theo mẫu (hàng x cột)
  generateSeatTemplates: (rows: string[], cols: number[], roomId: number) => {
    const templates: CreateMultipleSeatTemplatesRequest = {
      id_phong_chieu: roomId,
      danh_sach_ghe: []
    };
    
    rows.forEach(row => {
      cols.forEach(col => {
        templates.danh_sach_ghe.push({
          ten_ghe: `${row}${col}`
        });
      });
    });
    
    return templates;
  },
  
  // Áp dụng mẫu ghế ngồi cho suất chiếu
  applySeatTemplatesToShowtime: async (roomId: number, showtimeId: number) => {
    try {
      // Lấy mẫu ghế ngồi của phòng chiếu
      const templates = await roomSeatTemplateService.getSeatTemplatesByRoom(roomId);
      
      // Tạo danh sách ghế ngồi cho suất chiếu dựa trên mẫu
      const seats = {
        id_suat_chieu: showtimeId,
        danh_sach_ghe: templates.map((template: SeatTemplate) => ({
          ten_ghe: template.ten_ghe,
          trang_thai: 0 // Mặc định là trống
        }))
      };
      
      // Gọi API tạo ghế ngồi cho suất chiếu
      // Trong thực tế, bạn sẽ gọi API thực sự
      // const response = await api.post('/ghengoi/multiple', seats);
      // return response.data;
      
      // Giả lập dữ liệu
      return { message: "Đã áp dụng mẫu ghế ngồi cho suất chiếu" };
    } catch (error) {
      console.error("Error applying seat templates to showtime:", error);
      throw error;
    }
  }
};

export default roomSeatTemplateService;
