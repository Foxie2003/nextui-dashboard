import api from './api';

export interface Showtime {
  id_lich_chieu?: number;
  id_phim: number;
  id_phong_chieu: number;
  thoi_gian: string;
  gia_ve: number;
  ten_phim?: string;
  ten_rap?: string;
  ten_phong_chieu?: string;
}

const showtimeService = {
  getShowtimes: async () => {
    const response = await api.get('/suatchieu');
    return response.data;
  },
  
  getShowtimeById: async (id: number) => {
    const response = await api.get(`/suatchieu/${id}`);
    return response.data;
  },
  
  getShowtimesByMovie: async (movieId: number) => {
    const response = await api.get(`/suatchieu/phim/${movieId}`);
    return response.data;
  },
  
  getShowtimesByTheater: async (theaterId: number) => {
    const response = await api.get(`/suatchieu/rapphim/${theaterId}`);
    return response.data;
  },
  
  createShowtime: async (showtime: Omit<Showtime, 'id_lich_chieu'>) => {
    console.log('Creating showtime with data:', showtime);
    const response = await api.post('/suatchieu', showtime);
    return response.data;
  },
  
  updateShowtime: async (id: number, showtime: Partial<Showtime>) => {
    const response = await api.put(`/suatchieu/${id}`, showtime);
    return response.data;
  },
  
  deleteShowtime: async (id: number) => {
    const response = await api.delete(`/suatchieu/${id}`);
    return response.data;
  }
};

export default showtimeService;


