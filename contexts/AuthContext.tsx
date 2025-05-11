import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useRouter } from "next/router";

interface User {
  id_khach_hang: number;
  ho_ten: string;
  email: string;
  so_dien_thoai: string;
  dia_chi?: string;
  role: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa khi tải trang
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("Parsed user:", parsedUser);

          // Chỉ cho phép admin đăng nhập
          if (parsedUser.role === 1) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(true);
            console.log("User is admin, isAdmin set to:", true);
          } else {
            console.log("User is not admin, role:", parsedUser.role);
            // Nếu không phải admin, xóa thông tin đăng nhập
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        tai_khoan: email,
        mat_khau: password,
      });

      const { token, user } = response.data as { token: string; user: User };
      console.log("Login response:", { token, user });

      // Chỉ cho phép admin đăng nhập
      if (user.role !== 1) {
        throw new Error(
          "Chỉ quản trị viên mới có thể đăng nhập vào hệ thống này"
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(true);
      console.log("After login, isAdmin set to:", true);

      router.push("/movies");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
