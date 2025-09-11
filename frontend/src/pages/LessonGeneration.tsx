import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { promptService } from '../services/promptService';
import { Category } from '../types';

const LessonGeneration: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryService.getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleGenerate = async () => {
    if (!selectedCategory || !selectedSubCategory || !prompt.trim()) {
      alert('Please fill all fields');
      return;
    }

    setIsGenerating(true);
    try {
      await promptService.createPrompt({
        user_id: 1, // You'll replace this with actual user ID
        category_id: selectedCategory,
        sub_category_id: selectedSubCategory,
        prompt: prompt.trim(),
      });
      
      alert('Lesson generation started! Check your history in a moment.');
      setPrompt('');
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('Error generating lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generate AI Lesson</h1>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select 
            value={selectedCategory || ''} 
            onChange={(e) => {
              setSelectedCategory(Number(e.target.value) || null);
              setSelectedSubCategory(null);
            }}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* SubCategory Selection */}
        {selectedCategoryData && (
          <div>
            <label className="block text-sm font-medium mb-2">SubCategory</label>
            <select 
              value={selectedSubCategory || ''} 
              onChange={(e) => setSelectedSubCategory(Number(e.target.value) || null)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select SubCategory</option>
              {selectedCategoryData.sub_categories?.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium mb-2">What would you like to learn?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything about the selected topic..."
            className="w-full border rounded px-3 py-2 h-32"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Lesson'}
        </button>
      </div>
    </div>
  );
};

export default LessonGeneration;