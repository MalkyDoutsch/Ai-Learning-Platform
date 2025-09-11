import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { Category } from '../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Loading categories...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Learning Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="space-y-2">
              {category.sub_categories?.map((sub) => (
                <div key={sub.id} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {sub.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;