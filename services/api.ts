import fetch from 'isomorphic-unfetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T;
}

const api = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    console.log('URL', url);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return { data: await response.json() };
  },
  
  post: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    console.log('Sending POST data to:', `${API_URL}${url}`);
    console.log('POST data:', data);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return { data: await response.json() };
    } catch (error) {
      console.error('Error in post:', error);
      throw error;
    }
  },
  
  postForm: async <T>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    console.log('Sending FormData to:', `${API_URL}${url}`);
    console.log('FormData entries:');
    
    // Sử dụng Array.from thay vì for...of
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    const headers: HeadersInit = {};
    
    // Quan trọng: KHÔNG đặt Content-Type khi gửi FormData
    // Trình duyệt sẽ tự động thêm header với boundary đúng
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return { data: await response.json() };
    } catch (error) {
      console.error('Error in postForm:', error);
      throw error;
    }
  },
  
  put: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return { data: await response.json() };
  },
  
  putForm: async <T>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    console.log('Sending FormData with PUT to:', `${API_URL}${url}`);
    console.log('FormData entries:');
    
    // Sử dụng Array.from thay vì for...of
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    const headers: HeadersInit = {};
    
    // Quan trọng: KHÔNG đặt Content-Type khi gửi FormData
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return { data: await response.json() };
    } catch (error) {
      console.error('Error in putForm:', error);
      throw error;
    }
  },
  
  delete: async <T>(url: string, options = {}): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    const requestOptions: RequestInit = {
      method: 'DELETE',
      headers,
      ...options
    };
    
    if ('data' in options) {
      requestOptions.body = JSON.stringify((options as any).data);
    }
    
    const response = await fetch(`${API_URL}${url}`, requestOptions);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return { data: await response.json() };
  },
  
  uploadFile: async <T>(url: string, file: File, fieldName: string = 'hinh_anh'): Promise<ApiResponse<T>> => {
    console.log(`Uploading file to: ${API_URL}${url}`);
    
    const formData = new FormData();
    formData.append(fieldName, file);
    
    console.log('Upload FormData entries:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    const headers: HeadersInit = {};
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      return { data: await response.json() };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }
};

export default api;













