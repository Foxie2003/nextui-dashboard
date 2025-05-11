import api from './api';

export interface Theater {
  id_rap_phim: number;
  ten_rap: string;
  dia_chi: string;
  so_ghe: number;
  mo_ta?: string;
}

const theaterService = {
  getTheaters: async () => {
    const response = await api.get('/rapphim');
    return response.data;
  },
  
  getTheaterById: async (id: number) => {
    const response = await api.get(`/rapphim/${id}`);
    return response.data;
  },
  
  createTheater: async (theater: Omit<Theater, 'id_rap_phim'>) => {
    const response = await api.post('/rapphim', theater);
    return response.data;
  },
  
  updateTheater: async (id: number, theater: Partial<Theater>) => {
    const response = await api.put(`/rapphim/${id}`, theater);
    return response.data;
  },
  
  deleteTheater: async (id: number) => {
    const response = await api.delete(`/rapphim/${id}`);
    return response.data;
  }
};

export default theaterService;
