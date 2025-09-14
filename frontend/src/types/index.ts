export interface User {
  id: number;
  username: string;
  email?: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  prompt_count?: number;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  sub_categories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  created_at: string;
}

export interface Prompt {
  id: number;
  user_id: number;
  category_id: number;
  sub_category_id: number;
  prompt: string;
  response?: string;
  created_at: string;
  user_name?: string;
  category_name?: string;
  sub_category_name?: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  full_name: string;
  phone?: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface CreatePromptData {
  category_id: number;
  sub_category_id: number;
  prompt: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}