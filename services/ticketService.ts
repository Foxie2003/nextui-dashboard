import api from './api';

export interface Ticket {
  id_ve: number;
  id_lich_chieu: number;
  id_khach_hang: number;
  so_ghe: string;
  ngay_dat: string;
  gia_ve: number;
  trang_thai: string;
  ten_phim?: string;
  ten_rap?: string;
  ngay_chieu?: string;
  gio_bat_dau?: string;
}

const ticketService = {
  getTickets: async () => {
    const response = await api.get('/ve');
    return response.data;
  },
  
  getTicketById: async (id: number) => {
    const response = await api.get(`/ve/${id}`);
    return response.data;
  },
  
  getMyTickets: async () => {
    const response = await api.get('/ve/khach-hang');
    return response.data;
  },
  
  createTicket: async (ticket: Omit<Ticket, 'id_ve'>) => {
    const response = await api.post('/ve', ticket);
    return response.data;
  },
  
  updateTicket: async (id: number, ticket: Partial<Ticket>) => {
    const response = await api.put(`/ve/${id}`, ticket);
    return response.data;
  },
  
  cancelTicket: async (id: number) => {
    const response = await api.put(`/ve/${id}/huy`, {});
    return response.data;
  }
};

export default ticketService;
