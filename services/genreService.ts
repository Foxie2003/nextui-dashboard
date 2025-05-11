import api from './api';

export interface Genre {
  id_the_loai: number;
  ten_the_loai: string;
  mo_ta?: string;
}

const genreService = {
  getGenres: async () => {
    const response = await api.get('/theloai');
    return response.data;
  },
  
  getGenreById: async (id: number) => {
    const response = await api.get(`/theloai/${id}`);
    return response.data;
  },
  
  createGenre: async (genre: Omit<Genre, 'id_the_loai'>) => {
    const response = await api.post('/theloai', genre);
    return response.data;
  },
  
  updateGenre: async (id: number, genre: Partial<Genre>) => {
    const response = await api.put(`/theloai/${id}`, genre);
    return response.data;
  },
  
  deleteGenre: async (id: number) => {
    const response = await api.delete(`/theloai/${id}`);
    return response.data;
  }
};

export default genreService;