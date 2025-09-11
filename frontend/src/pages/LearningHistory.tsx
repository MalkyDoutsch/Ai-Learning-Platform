import React, { useState, useEffect } from 'react';
import { promptService } from '../services/promptService';
import { Prompt } from '../types';

const LearningHistory: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // You'll replace user ID 1 with actual user
        const data = await promptService.getUserPrompts(1);
        setPrompts(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div>Loading history...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Learning History</h1>
      
      {prompts.length === 0 ? (
        <p>No lessons generated yet. <a href="/generate" className="text-blue-600">Generate your first lesson!</a></p>
      ) : (
        <div className="space-y-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h3 className="font-semibold">Your Question:</h3>
                <p className="text-gray-700">{prompt.prompt}</p>
              </div>
              
              {prompt.response && (
                <div>
                  <h3 className="font-semibold mb-2">AI Response:</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="whitespace-pre-wrap">{prompt.response}</p>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                Generated: {new Date(prompt.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningHistory;