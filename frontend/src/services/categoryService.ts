import { api } from './api';
import { Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};