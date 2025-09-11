export interface User {
    id: number;
    name: string;
    phone: string;
    created_at: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    created_at: string;
    sub_categories: SubCategory[];
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
  }