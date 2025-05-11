import api from './api';

export interface Room {
  id_phong_chieu: number;
  id_rap_phim: number;
  ten_phong_chieu: string;
}

const roomService = {
  getRooms: async () => {
    const response = await api.get('/phongchieu');
    return response.data;
  },
  
  getRoomsByTheater: async (theaterId: number) => {
    const response = await api.get(`/phongchieu/rapphim/${theaterId}`);
    return response.data;
  },
  
  getRoomById: async (id: number) => {
    const response = await api.get(`/phongchieu/${id}`);
    return response.data;
  }
};

export default roomService;
