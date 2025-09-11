import { api } from './api';
import { Prompt } from '../types';

interface PromptCreateRequest {
  user_id: number;
  category_id: number;
  sub_category_id: number;
  prompt: string;
}

export const promptService = {
  async createPrompt(data: PromptCreateRequest): Promise<Prompt> {
    const response = await api.post('/prompts', data);
    return response.data;
  },

  async getUserPrompts(userId: number): Promise<Prompt[]> {
    const response = await api.get(`/prompts?user_id=${userId}`);
    return response.data;
  },
};