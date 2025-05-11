import api from './api';

export interface Movie {
  id_phim: number;
  ten_phim: string;
  mo_ta?: string;
  thoi_luong?: number;
  hinh_anh?: string;
  id_the_loai: number;
  ten_the_loai?: string;
  do_tuoi: string;
  ngon_ngu: string;
  trailer?: string;
  ngay_khoi_chieu?: string;
  dao_dien?: Person[];
  dien_vien?: Person[];
}

export interface Person {
  id_nguoi: number;
  ho_ten: string;
  hinh_anh?: string;
}

const movieService = {
  getMovies: async () => {
    const response = await api.get('/phim');
    console.log('API response:', response.data);
    // Đảm bảo trả về đúng định dạng mà component mong đợi
    return { 
      movies: Array.isArray(response.data) ? response.data : [response.data] 
    };
  },
  
  getMovieById: async (id: number) => {
    const response = await api.get(`/phim/${id}`);
    return { movie: response.data };
  },
  
  createMovie: async (movieData: FormData) => {
    // Chuyển đổi FormData thành JSON object
    const movieObj: any = {};
    
    // Sử dụng Array.from thay vì for...of
    Array.from(movieData.entries()).forEach(([key, value]) => {
      if (key !== 'hinh_anh') { // Xử lý riêng file hình ảnh
        movieObj[key] = value;
      }
    });
    
    console.log('Create movie JSON:', movieObj);
    
    // Nếu có file hình ảnh, xử lý riêng
    const imageFile = movieData.get('hinh_anh') as File;
    if (imageFile) {
      const response = await api.post('/phim', movieObj);
      const newMovie = response.data;
      
      // Upload hình ảnh sau khi tạo phim
      if (newMovie && (newMovie as any).id_phim) {
        await api.uploadFile(`/phim/upload-image/${(newMovie as any).id_phim}`, imageFile, 'hinh_anh');
      }
      
      return newMovie;
    } else {
      // Không có hình ảnh, chỉ tạo phim
      const response = await api.post('/phim', movieObj);
      return response.data;
    }
  },
  
  updateMovie: async (id: number, movieData: FormData) => {
    // Đảm bảo id_phim được thêm vào FormData
    if (!movieData.has('id_phim')) {
      movieData.append('id_phim', id.toString());
    }
    
    // Xử lý riêng file hình ảnh nếu có
    const imageFile = movieData.get('hinh_anh') as File;
    if (imageFile && imageFile.size > 0) {
      // Tạo bản sao của FormData không chứa hình ảnh
      const movieObj: any = {};
      Array.from(movieData.entries()).forEach(([key, value]) => {
        if (key !== 'hinh_anh') {
          movieObj[key] = value;
        }
      });
      
      // Cập nhật thông tin phim trước
      const response = await api.put(`/phim/${id}`, movieObj);
      
      // Sau đó upload hình ảnh
      await api.uploadFile(`/phim/upload-image/${id}`, imageFile, 'hinh_anh');
      
      return response.data;
    } else {
      // Không có hình ảnh mới, chỉ cập nhật thông tin
      const movieObj: any = {};
      Array.from(movieData.entries()).forEach(([key, value]) => {
        if (key !== 'hinh_anh') {
          movieObj[key] = value;
        }
      });
      
      const response = await api.put(`/phim/${id}`, movieObj);
      return response.data;
    }
  },
  
  deleteMovie: async (id: number) => {
    const response = await api.delete(`/phim/${id}`);
    return response.data;
  },
  
  uploadImage: async (id: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('id_phim', id.toString());
    formData.append('hinh_anh', imageFile);
    console.log('FormData entries222222:', Array.from(formData.entries()));
    
    const response = await api.postForm('/phim/upload-image', formData);
    return response.data;
  },
  
  addCastMember: async (id_phim: number, id_nguoi: number, vai_tro: number) => {
    const response = await api.post('/phim/cast', { id_phim, id_nguoi, vai_tro });
    return response.data;
  },
  
  removeCastMember: async (id_phim: number, id_nguoi: number) => {
    const response = await api.delete('/phim/cast', { data: { id_phim, id_nguoi } });
    return response.data;
  },
  
  getMoviesByGenre: async (genreId: number) => {
    const response = await api.get(`/phim/theloai/${genreId}`);
    return { 
      movies: Array.isArray(response.data) ? response.data : [response.data] 
    };
  }
};

export default movieService;











