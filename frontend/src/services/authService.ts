import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
}

export const authService = {
  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<any> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    const response = await api.get("/users/profile");
    return response.data;
  },

  /**
   * Logout user (clear token on client side)
   */
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Store token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem("token", token);
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  /**
   * Store user in localStorage
   */
  setUser(user: any): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  /**
   * Get user from localStorage
   */
  getUser(): any | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;

