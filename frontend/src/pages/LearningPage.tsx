import React, { useState, useEffect } from 'react';
import { categoryApi, promptApi } from '../services/api';
import { Category, SubCategory, CreatePromptData, Prompt } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const LearningPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    category_id: '',
    sub_category_id: '',
    prompt: '',
  });
  
  const [submittedPrompt, setSubmittedPrompt] = useState<Prompt | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      loadSubCategories(parseInt(formData.category_id));
    } else {
      setSubCategories([]);
    }
  }, [formData.category_id]);

  // Poll for AI response after submitting prompt
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (submittedPrompt && !submittedPrompt.response) {
      pollInterval = setInterval(async () => {
        try {
          const updatedPrompt = await promptApi.getPrompt(submittedPrompt.id);
          if (updatedPrompt.response) {
            setSubmittedPrompt(updatedPrompt);
            setAiResponse(updatedPrompt.response);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling for response:', error);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [submittedPrompt]);

  const loadInitialData = async () => {
    try {
      const categoriesData = await categoryApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load categories. Please refresh the page.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubCategories = async (categoryId: number) => {
    try {
      const subCategoriesData = await categoryApi.getSubCategories(categoryId);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load subcategories'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset sub_category when category changes
      ...(name === 'category_id' && { sub_category_id: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);
    setSubmittedPrompt(null);
    setAiResponse('');

    try {
      // Validation
      if (!formData.category_id || !formData.sub_category_id || !formData.prompt.trim()) {
        throw new Error('All fields are required');
      }

      const promptData: CreatePromptData = {
        category_id: parseInt(formData.category_id),
        sub_category_id: parseInt(formData.sub_category_id),
        prompt: formData.prompt.trim()
      };

      const createdPrompt = await promptApi.createPrompt(promptData);
      setSubmittedPrompt(createdPrompt);
      
      setAlert({
        type: 'info',
        message: 'Prompt submitted! AI is generating your lesson...'
      });

      // Reset form
      setFormData({
        category_id: '',
        sub_category_id: '',
        prompt: '',
      });

    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.response?.data?.detail || error.message || 'Failed to submit prompt'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === parseInt(formData.category_id));
  const selectedSubCategory = subCategories.find(s => s.id === parseInt(formData.sub_category_id));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="large" text="Loading learning platform..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🧠 AI Learning Platform
        </h1>
        <p className="text-xl text-gray-600">
          Hello {user?.full_name}! Select a topic and ask questions to receive personalized AI lessons
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📝</span>
            Submit Learning Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Learning Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Choose a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category Selection */}
            <div>
              <label htmlFor="sub_category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Category *
              </label>
              <select
                id="sub_category_id"
                name="sub_category_id"
                value={formData.sub_category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={!formData.category_id}
              >
                <option value="">Choose a sub-category...</option>
                {subCategories.map(subCategory => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              {formData.category_id && subCategories.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No sub-categories available for this category.
                </p>
              )}
            </div>

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Your Learning Prompt *
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="e.g., 'Teach me about black holes and how they form'"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific about what you want to learn!
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Generate AI Lesson
                </>
              )}
            </button>
          </form>
        </div>

        {/* Response Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🤖</span>
            AI Response
          </h2>

          {!submittedPrompt ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg">Submit a learning prompt to see your AI-generated lesson here</p>
            </div>
          ) : (
            <div className="animate-slide-up">
              {/* Prompt Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Your Request:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Topic:</strong> {selectedCategory?.name} → {selectedSubCategory?.name}
                </p>
                <p className="text-gray-800">"{submittedPrompt.prompt}"</p>
              </div>

              {/* AI Response */}
              {aiResponse ? (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="mr-2">✅</span>
                    Your AI Lesson:
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                    {aiResponse}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <LoadingSpinner size="medium" text="AI is generating your personalized lesson..." />
                  <p className="text-sm text-gray-500 mt-4">
                    This usually takes 10-30 seconds
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Tips for Better Learning
        </h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Be specific in your prompts for more targeted lessons</li>
          <li>• Ask follow-up questions to dive deeper into topics</li>
          <li>• Check your learning history to review past lessons</li>
          <li>• Try different categories to explore new subjects</li>
        </ul>
      </div>
    </div>
  );
};

export default LearningPage;
    